import type { AIRadarParsedQuery } from './aiRadarParser'
import type { Locale } from '@/i18n'

type AIRadarReplyUser = {
  displayName?: string
  username?: string
  bio?: string
  city?: string
  tags?: string[]
  captions?: string[]
  recentCaptions?: string[]
  aiCaption?: string
  caption?: string
  text?: string
  score?: number
  aiScore?: number
  matchedReasons?: string[]
}

type OpenAIChatMessage = {
  role: 'system' | 'user'
  content: string
}

type OpenAIChatResponse = {
  choices?: {
    message?: {
      content?: string
    }
  }[]
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

function getUserName(user: AIRadarReplyUser) {
  return user.displayName || user.username || ''
}

function fallbackReply(
  query: string,
  users: AIRadarReplyUser[],
  parsedQuery?: AIRadarParsedQuery,
  locale: Locale = 'zh-TW'
) {
  const topUsers = users.slice(0, 2)
  const names = topUsers.map(getUserName).filter(Boolean)
  const tags = Array.from(
    new Set(
      topUsers
        .flatMap((user) => user.tags ?? [])
        .filter(Boolean)
        .slice(0, 5)
    )
  )

  if (locale === 'en') {
    if (users.length > 0) {
      const nameText =
        names.length > 0 ? `, including ${names.join(' and ')}` : ''

      const tagText =
        tags.length > 0
          ? ` Their recent content shows signals like ${tags
              .slice(0, 3)
              .join(', ')}, so the match comes from lifestyle and vibe clues.`
          : ` The match is based on profile signals, recent content, and overall vibe.`

      return `I found a few people who are close to “${query}”${nameText}.${tagText}`
    }

    const fallbackTags = parsedQuery?.tags?.slice(0, 3) ?? []

    if (fallbackTags.length > 0) {
      return `I couldn’t find an exact match for “${query}” yet. Try broadening the vibe, such as: ${fallbackTags.join(
        ' / '
      )}.`
    }

    return `I couldn’t find an exact match for “${query}” yet. Try a shorter, broader description.`
  }

  if (users.length > 0) {
    const nameText =
      names.length > 0 ? `，例如 ${names.join('、')}` : ''

    const tagText =
      tags.length > 0
        ? `他們近期內容中有 ${tags
            .slice(0, 3)
            .join('、')} 這類線索，所以推薦更接近生活氛圍與互動感。`
        : `這次推薦主要看貼文內容、個人資料與整體 vibe。`

    return `根據你想找的「${query}」，我找到幾位氛圍接近的人${nameText}。${tagText}`
  }

  const fallbackTags = parsedQuery?.tags?.slice(0, 3) ?? []

  if (fallbackTags.length > 0) {
    return `目前沒有完全符合「${query}」的用戶，你可以試著放寬條件，例如：${fallbackTags.join(
      ' / '
    )}。`
  }

  return `目前沒有找到完全符合「${query}」的用戶，可以換成更簡短或寬鬆的描述。`
}

function compactUserForPrompt(user: AIRadarReplyUser) {
  const captions =
    user.captions ||
    user.recentCaptions ||
    [user.aiCaption, user.caption, user.text].filter(Boolean)

  return {
    name: user.displayName ?? user.username ?? 'Unknown user',
    tags: user.tags ?? [],
    city: user.city ?? '',
    bio: user.bio ?? '',
    captions: captions.slice(0, 3),
    matchedReasons: user.matchedReasons ?? [],
    score: user.aiScore ?? user.score ?? 0,
  }
}

export async function generateAIRadarReply({
  query,
  parsedQuery,
  users,
  locale = 'zh-TW',
  signal,
}: {
  query: string
  parsedQuery: AIRadarParsedQuery
  users: AIRadarReplyUser[]
  locale?: Locale
  signal?: AbortSignal
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.warn('Missing OPENAI_API_KEY')
    return fallbackReply(query, users, parsedQuery, locale)
  }

  const topUsers = users.slice(0, 2).map(compactUserForPrompt)

  const messages: OpenAIChatMessage[] = [
    {
      role: 'system',
      content: `
You are Vibelink AI Radar's multilingual social discovery assistant.

Write a natural recommendation summary for the purple AI response bubble.

Reply language:
- If locale is "zh-TW", use natural Traditional Chinese.
- If locale is "en", use natural English.

Goal:
- Briefly summarize the recommendation results as a group.
- Explain their shared vibe traits and why they may fit the user.
- Use matchedReasons, tags, bio, and city information when available.
- Use captions only to infer the overall vibe; avoid describing photo or post details.
- Make the recommendation feel personal, specific, and premium.
- Avoid generic template language.
- Avoid repeating details that should appear in individual profile cards below.
- Reduce repeated lifestyle descriptions and over-stacked adjectives.
- Do not overpromise.
- Do not say anything sexual or explicit.
- Do not mention internal JSON, tags, score, API, or model.
- Do not list users one by one.
- Sound like an intelligent social discovery assistant.

Length:
- 2 to 3 short sentences.
- For zh-TW, around 60 to 90 Traditional Chinese characters.
- For en, around 45 to 70 English words.
- Keep it concise and mobile-friendly.
- Avoid long paragraphs, long sentences, and over-stacked adjectives.
      `.trim(),
    },
    {
      role: 'user',
      content: JSON.stringify(
        {
          locale,
          userQuery: query,
          parsedQuery,
          matchedUsers: topUsers,
        },
        null,
        2
      ),
    },
  ]

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.75,
        messages,
      }),
      signal,
    })

    if (!response.ok) {
      console.error('OpenAI generate AI Radar reply failed:', response.status)
      return fallbackReply(query, users, parsedQuery, locale)
    }

    const data = (await response.json()) as OpenAIChatResponse
    const content = data.choices?.[0]?.message?.content?.trim()

    if (!content) {
      return fallbackReply(query, users, parsedQuery, locale)
    }

    return content
  } catch (error) {
    console.error('generateAIRadarReply error:', error)
    return fallbackReply(query, users, parsedQuery, locale)
  }
}
