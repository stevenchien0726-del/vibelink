import { NextResponse } from 'next/server'

import { getAuthenticatedSupabaseUser } from '@/lib/api/authenticatedSupabaseUser'
import {
  checkRateLimits,
  getRequestIp,
  type RateLimitRule,
} from '@/lib/api/rateLimit'
import { openaiParseQuery } from '@/lib/ai-radar/openaiParseQuery'
import { generateAIRadarReply } from '@/lib/ai-radar/generateAIRadarReply'
import { searchAIRadarUsersSupabase } from '@/lib/ai-radar/searchAIRadarUsersSupabase'
import { transformSupabaseAIRadarUsers } from '@/lib/ai-radar/transformSupabaseAIRadarUsers'

import { searchVectorUsers } from '@/lib/ai-radar/searchVectorUsers'
import { transformVectorResults } from '@/lib/ai-radar/transformVectorResults'

import { generateAIRadarRewritePrompts } from '@/lib/ai-radar/generateAIRadarRewritePrompts'
import { generateHumanFeeling } from '@/lib/ai-radar/generateHumanFeeling'
import {
  createDeadlineSignal,
  hasDeadlineTime,
  withRouteDeadline,
} from '@/lib/ai-radar/openaiDeadline'

const MINUTE = 60 * 1000
const DAY = 24 * 60 * 60 * 1000
const AI_RADAR_ROUTE_DEADLINE_MS = 20_000
const PARSE_QUERY_TIMEOUT_MS = 4_000
const VECTOR_SEARCH_TIMEOUT_MS = 4_000
const HUMAN_FEELING_TIMEOUT_MS = 4_500
const REPLY_TIMEOUT_MS = 6_000
const REWRITE_TIMEOUT_MS = 2_000

const AI_RADAR_IP_RULES: RateLimitRule[] = [
  {
    name: 'ai-radar-ip-minute',
    limit: 30,
    windowMs: MINUTE,
  },
]

const AI_RADAR_USER_RULES: RateLimitRule[] = [
  {
    name: 'ai-radar-user-minute',
    limit: 10,
    windowMs: MINUTE,
  },
  {
    name: 'ai-radar-user-day',
    limit: 100,
    windowMs: DAY,
  },
]

type AIRadarProgressStage = 'searching' | 'parsing' | 'generating'

function encodeAIRadarStreamEvent(event: unknown) {
  return `data: ${JSON.stringify(event)}\n\n`
}

function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      ok: false,
      error: 'RATE_LIMITED',
      matchedUsers: [],
      aiReply: 'AI 雷達使用次數已達目前限制，請稍後再試。',
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
      },
    }
  )
}

function rerankVectorUsersByTags(users: any[], tags: string[]) {
  if (!Array.isArray(users) || users.length === 0 || tags.length === 0) {
    return users
  }

  const normalizedTags = tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.toLowerCase().trim())
    .filter(Boolean)

  if (normalizedTags.length === 0) return users

  return [...users]
    .map((user) => {
      const userTags = [
        ...(user.tags ?? []),
        ...(user.vibe_tags ?? []),
        ...(user.aiTags ?? []),
        ...(user.ai_tags ?? []),
        ...(user.aiStyleTags ?? []),
        ...(user.ai_style_tags ?? []),
        ...(user.styleTags ?? []),
      ]
        .filter((tag): tag is string => typeof tag === 'string')
        .map((tag) => tag.toLowerCase().trim())
        .filter(Boolean)

      const matchedTags = normalizedTags.filter((tag) =>
        userTags.includes(tag)
      )

      const tagMatchCount = matchedTags.length
      const vectorScore = Number(user.aiScore ?? user.similarity ?? 0)
      const imageCount = Array.isArray(user.images) ? user.images.length : 0

      const rerankScore =
        vectorScore * 100 +
        tagMatchCount * 35 +
        imageCount * 0.5

      return {
        ...user,
        aiScore: rerankScore,
        matchedReasons:
          matchedTags.length > 0
            ? matchedTags
            : user.matchedReasons ?? [],
      }
    })
    .sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0))
}

async function searchDevelopmentMockUsers(parsedQuery: unknown) {
  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.NODE_ENV !== 'test'
  ) {
    return []
  }

  const { searchAIRadarUsers } = await import('@/lib/aiRadar')

  return searchAIRadarUsers(parsedQuery as Parameters<typeof searchAIRadarUsers>[0])
}

export async function POST(req: Request) {
  const startedAt = Date.now()
  const deadlineAt = startedAt + AI_RADAR_ROUTE_DEADLINE_MS

  try {
    console.log('🟣 [AI Radar] API called')

    const ipLimit = checkRateLimits(
      getRequestIp(req),
      AI_RADAR_IP_RULES
    )

    if (!ipLimit.allowed) {
      return rateLimitResponse(ipLimit.retryAfterSeconds)
    }

    const auth = await withRouteDeadline(
      getAuthenticatedSupabaseUser(req),
      deadlineAt
    )

    if (!auth.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: 'UNAUTHORIZED',
          matchedUsers: [],
          aiReply: '請先登入後再使用 AI 雷達。',
        },
        { status: 401 }
      )
    }

    const userLimit = checkRateLimits(
      auth.user.id,
      AI_RADAR_USER_RULES
    )

    if (!userLimit.allowed) {
      return rateLimitResponse(userLimit.retryAfterSeconds)
    }

    const body = await req.json()

    if (body?.warmup) {
      console.log('🟢 [AI Radar] warmup route only')

      return NextResponse.json({
        ok: true,
        warmed: true,
      })
    }

    const query = body?.query?.trim() ?? ''
    const locale = body?.locale ?? 'zh-TW'

    console.log('🟣 [AI Radar] query:', query)

    if (!query) {
      console.warn('🟡 [AI Radar] empty query')

      return NextResponse.json({
        ok: false,
        error: 'EMPTY_QUERY',
        matchedUsers: [],
        aiReply: '請先輸入你想找的人。',
      })
    }

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      start(controller) {
        const send = (event: unknown) => {
          controller.enqueue(
            encoder.encode(encodeAIRadarStreamEvent(event))
          )
        }

        const sendProgress = (stage: AIRadarProgressStage) => {
          send({
            type: 'progress',
            stage,
          })
        }

        const sendResult = (data: unknown) => {
          send({
            type: 'result',
            data,
          })
        }

        void (async () => {
          try {
            sendProgress('searching')
            sendProgress('parsing')

    console.log('🟣 [AI Radar] parsing query...')

    const parseSignal = createDeadlineSignal(
      deadlineAt,
      PARSE_QUERY_TIMEOUT_MS
    )

    if (!parseSignal) {
      throw new Error('AI_RADAR_DEADLINE_EXCEEDED')
    }

    const parsedQuery = await openaiParseQuery(query, parseSignal)

    console.log('🟢 [AI Radar] parsedQuery:', parsedQuery)

    const tags = parsedQuery?.tags ?? []

    const supabaseUsers = await withRouteDeadline(
      searchAIRadarUsersSupabase({
        tags,
      }),
      deadlineAt
    )

    const transformedSupabaseUsers = transformSupabaseAIRadarUsers(
      supabaseUsers
    )
      .map((user: any) => {
        const userTags = user.tags ?? []

        const matchScore = tags.reduce(
          (score: number, tag: string) => {
            return userTags.includes(tag) ? score + 40 : score
          },
          0
        )

        return {
          ...user,
          aiScore: matchScore,
          matchedReasons: tags.filter((tag: string) =>
            userTags.includes(tag)
          ),
        }
      })
      .sort((a: any, b: any) => {
        const scoreA =
          (a.aiScore ?? 0) +
          (a.matchCount ?? 0) * 0.5 +
          (a.images?.length ?? 0) * 1

        const scoreB =
          (b.aiScore ?? 0) +
          (b.matchCount ?? 0) * 0.5 +
          (b.images?.length ?? 0) * 1

        return scoreB - scoreA
      })

    console.log(
      '🟢 [AI Radar] transformedSupabaseUsers:',
      transformedSupabaseUsers
    )

    let matchedUsers: any[] = []

    try {
      const vectorSignal = createDeadlineSignal(
        deadlineAt,
        VECTOR_SEARCH_TIMEOUT_MS
      )

      if (!vectorSignal) {
        throw new Error('AI_RADAR_DEADLINE_EXCEEDED')
      }

      const vectorRows = await withRouteDeadline(
        searchVectorUsers(query, vectorSignal),
        deadlineAt
      )

      const vectorUsers = transformVectorResults(vectorRows)
      const rerankedVectorUsers = rerankVectorUsersByTags(vectorUsers, tags)

      matchedUsers =
        rerankedVectorUsers.length > 0
          ? rerankedVectorUsers
          : transformedSupabaseUsers.length > 0
          ? transformedSupabaseUsers
          : await searchDevelopmentMockUsers(parsedQuery)
    } catch (vectorError) {
      console.error(
        'AI Radar vector search failed, fallback:',
        vectorError
      )

      matchedUsers =
        transformedSupabaseUsers.length > 0
          ? transformedSupabaseUsers
          : await searchDevelopmentMockUsers(parsedQuery)
    }

    console.log('🟢 [AI Radar] search tags:', tags)

    console.log(
      '🟢 [AI Radar] supabaseUsers count:',
      supabaseUsers.length
    )

    console.log(
      '🟢 [AI Radar] final matchedUsers count:',
      matchedUsers.length
    )

    sendProgress('generating')

    console.log('🟣 [AI Radar] generating human feeling...')

    const humanFeelingSignal =
      hasDeadlineTime(deadlineAt, HUMAN_FEELING_TIMEOUT_MS) &&
      createDeadlineSignal(deadlineAt, HUMAN_FEELING_TIMEOUT_MS)

    const topUsersWithFeeling = humanFeelingSignal
      ? await Promise.all(
          matchedUsers.slice(0, 2).map(async (user: any) => {
            const aiCaption =
              user.aiCaption ||
              user.ai_caption ||
              user.caption ||
              user.text ||
              ''

            const captions = [
              ...(Array.isArray(user.captions) ? user.captions : []),
              ...(Array.isArray(user.recentCaptions)
                ? user.recentCaptions
                : []),
              ...(Array.isArray(user.recent_captions)
                ? user.recent_captions
                : []),
              user.caption,
              user.text,
              user.aiCaption,
              user.ai_caption,
            ].filter(Boolean)

            const humanFeeling = await generateHumanFeeling({
              locale,
              username:
                user.displayName ||
                user.display_name ||
                user.username ||
                user.name,
              aiTags:
                user.aiTags ||
                user.ai_tags ||
                user.tags ||
                user.vibe_tags ||
                [],
              aiStyleTags:
                user.aiStyleTags ||
                user.ai_style_tags ||
                user.styleTags ||
                [],
              aiCaption,
              captions,
              signal: humanFeelingSignal,
            })

            return {
              ...user,
              humanFeeling,
            }
          })
        )
      : []

    const displayUsers =
      topUsersWithFeeling.length > 0
        ? [
            ...topUsersWithFeeling,
            ...matchedUsers.slice(topUsersWithFeeling.length),
          ]
        : matchedUsers

    console.log('🟣 [AI Radar] generating reply...')

    const aiReply =
      displayUsers.length > 0
        ? await (async () => {
            const replySignal = createDeadlineSignal(
              deadlineAt,
              REPLY_TIMEOUT_MS
            )

            if (!replySignal) {
              return locale === 'en'
                ? `I found ${displayUsers.length} people who seem to match.`
                : `我幫你篩選出 ${displayUsers.length} 位較符合條件的人。`
            }

            return generateAIRadarReply({
              query,
              parsedQuery,
              users: displayUsers,
              locale,
              signal: replySignal,
            })
          })()
        : locale === 'en'
          ? `I couldn't find anyone matching "${query}" yet. Try a shorter or broader description.`
          : `目前沒有找到符合「${query}」的用戶，你可以換成更簡短或更寬鬆的描述再試一次。`

    const rewriteSignal =
      hasDeadlineTime(deadlineAt, REWRITE_TIMEOUT_MS) &&
      createDeadlineSignal(deadlineAt, REWRITE_TIMEOUT_MS)
    const rewritePrompts = rewriteSignal
      ? await generateAIRadarRewritePrompts({
          query,
          parsedQuery,
          matchedUsers: displayUsers,
          locale,
          signal: rewriteSignal,
        })
      : []

    console.log('🟢 [AI Radar] aiReply:', aiReply)
    console.log(
      '✅ [AI Radar] success in',
      Date.now() - startedAt,
      'ms'
    )

    sendResult({
      ok: true,
      parsedQuery,
      matchedUsers: displayUsers,
      aiReply,
      rewritePrompts,
    })
          } catch (error) {
            console.error('🔴 [AI Radar] API route failed:', error)
            console.error(
              '🔴 [AI Radar] failed after',
              Date.now() - startedAt,
              'ms'
            )

            sendResult({
              ok: false,
              error: 'AI_RADAR_API_FAILED',
              matchedUsers: [],
              aiReply: 'AI 雷達目前暫時無法完成，請再試一次。',
            })
          } finally {
            controller.close()
          }
        })()
      },
    })

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('🔴 [AI Radar] API route failed:', error)
    console.error(
      '🔴 [AI Radar] failed after',
      Date.now() - startedAt,
      'ms'
    )

    return NextResponse.json(
      {
        ok: false,
        error: 'AI_RADAR_API_FAILED',
        matchedUsers: [],
        aiReply: 'AI 雷達目前連線不穩，請再試一次。',
      },
      { status: 200 }
    )
  }
}
