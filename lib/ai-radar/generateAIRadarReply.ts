import type { AIRadarParsedQuery } from './aiRadarParser'

type AIRadarReplyUser = {
  display_name?: string
  username?: string
  bio?: string
  city?: string
  vibe_tags?: string[]
  tags?: string[]
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

function fallbackReply(
  query: string,
  users: AIRadarReplyUser[],
  parsedQuery?: AIRadarParsedQuery
) {
  if (users.length > 0) {
    return `我幫你篩選出幾位符合「${query}」的用戶，並依照你的描述整理出最接近的推薦人選。`
  }

  const fallbackTags = parsedQuery?.tags?.slice(0, 3) ?? []

  if (fallbackTags.length > 0) {
    return `目前沒有完全符合「${query}」的用戶，你可以試著放寬條件，例如：${fallbackTags.join(' / ')}。`
  }

  return `目前沒有找到完全符合「${query}」的用戶。`
}

function compactUserForPrompt(user: AIRadarReplyUser) {
  return {
    name: user.display_name ?? user.username ?? 'Unknown user',
    username: user.username ?? '',
    city: user.city ?? '',
    bio: user.bio ?? '',
    tags: user.vibe_tags ?? user.tags ?? [],
    matchedReasons: user.matchedReasons ?? [],
    score: user.aiScore ?? user.score ?? 0,
  }
}

export async function generateAIRadarReply({
  query,
  parsedQuery,
  users,
}: {
  query: string
  parsedQuery: AIRadarParsedQuery
  users: AIRadarReplyUser[]
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.warn('Missing OPENAI_API_KEY')
    fallbackReply(query, users, parsedQuery)
  }

  const topUsers = users.slice(0, 2).map(compactUserForPrompt)

  const messages: OpenAIChatMessage[] = [
    {
      role: 'system',
      content: `
You are Vibelink AI Radar's social discovery assistant.

Write one short Traditional Chinese reply for the purple AI response bubble.

Goal:
- Summarize the user's search intent.
- Mention the matched users' overall vibe based on matchedReasons, tags, bio, and city.
- If matchedReasons exist, prioritize them when describing why the users match.
- Sound natural, premium, and social-app friendly.
- Do not overpromise.
- Do not say anything sexual or explicit.
- Do not mention internal JSON, tags, score, API, or model.
- Do not list users one by one.
- Keep it within 1 to 2 sentences.
- Use Traditional Chinese.
      `.trim(),
    },
    {
      role: 'user',
      content: JSON.stringify(
        {
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
        temperature: 0.7,
        messages,
      }),
    })

    if (!response.ok) {
      console.error('OpenAI generate AI Radar reply failed:', response.status)
      return fallbackReply(query, users, parsedQuery)
    }

    const data = (await response.json()) as OpenAIChatResponse
    const content = data.choices?.[0]?.message?.content?.trim()

    if (!content) {
      return fallbackReply(query, users, parsedQuery)
    }

    return content
  } catch (error) {
    console.error('generateAIRadarReply error:', error)
    return fallbackReply(query, users, parsedQuery)
  }
}