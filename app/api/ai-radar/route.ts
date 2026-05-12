import { NextResponse } from 'next/server'

import { openaiParseQuery } from '@/lib/ai-radar/openaiParseQuery'
import { generateAIRadarReply } from '@/lib/ai-radar/generateAIRadarReply'
import { searchAIRadarUsers } from '@/lib/aiRadar'
import { searchAIRadarUsersSupabase } from '@/lib/ai-radar/searchAIRadarUsersSupabase'
import { transformSupabaseAIRadarUsers } from '@/lib/ai-radar/transformSupabaseAIRadarUsers'

export async function POST(req: Request) {
  const startedAt = Date.now()

  try {
    console.log('🟣 [AI Radar] API called')

    const body = await req.json()
    const query = body?.query?.trim() ?? ''

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

    console.log('🟣 [AI Radar] parsing query...')

    const parsedQuery = await openaiParseQuery(query)

    console.log('🟢 [AI Radar] parsedQuery:', parsedQuery)

    const tags =
  parsedQuery?.tags ?? []

const supabaseUsers =
  await searchAIRadarUsersSupabase({
    tags,
  })

const transformedSupabaseUsers =
  transformSupabaseAIRadarUsers(
    supabaseUsers
  ).map((user: any) => {
    const userTags = user.vibe_tags ?? user.tags ?? []

    const matchScore = tags.reduce((score: number, tag: string) => {
      return userTags.includes(tag) ? score + 20 : score
    }, 0)

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
    (a.matchCount ?? 0) * 2 +
    (a.images?.length ?? 0) * 3

  const scoreB =
    (b.aiScore ?? 0) +
    (b.matchCount ?? 0) * 2 +
    (b.images?.length ?? 0) * 3

  return scoreB - scoreA
})

  console.log(
  '🟢 [AI Radar] transformedSupabaseUsers:',
  transformedSupabaseUsers
)

const matchedUsers =
  transformedSupabaseUsers.length > 0
    ? transformedSupabaseUsers
    : searchAIRadarUsers(parsedQuery)

console.log('🟢 [AI Radar] search tags:', tags)

console.log(
  '🟢 [AI Radar] supabaseUsers count:',
  supabaseUsers.length
)

console.log(
  '🟢 [AI Radar] final matchedUsers count:',
  matchedUsers.length
)

    console.log('🟣 [AI Radar] generating reply...')

    const aiReply = await generateAIRadarReply({
      query,
      parsedQuery,
      users: matchedUsers,
    })

    console.log('🟢 [AI Radar] aiReply:', aiReply)
    console.log('✅ [AI Radar] success in', Date.now() - startedAt, 'ms')

    return NextResponse.json({
      ok: true,
      parsedQuery,
      matchedUsers,
      aiReply,
    })
  } catch (error) {
    console.error('🔴 [AI Radar] API route failed:', error)
    console.error('🔴 [AI Radar] failed after', Date.now() - startedAt, 'ms')

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