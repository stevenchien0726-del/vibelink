import type { AIRadarParsedQuery } from './aiRadarParser'

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

type OpenAIParsedQuery = {
  gender?: 'male' | 'female' | null
  city?: string | null
  tags?: string[]
  vibes?: string[]
  keywords?: string[]
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

function createEmptyParsedQuery(raw: string): AIRadarParsedQuery {
  return {
    raw,
    city: undefined,
    genderHint: undefined,
    tags: [],
    vibes: [],
    keywords: raw
      .replace(/[，、。！？,.]/g, ' ')
      .split(/\s+/)
      .filter(Boolean),
  }
}

function safeJsonParse(text: string): OpenAIParsedQuery | null {
  try {
    return JSON.parse(text) as OpenAIParsedQuery
  } catch {
    const match = text.match(/\{[\s\S]*\}/)

    if (!match) return null

    try {
      return JSON.parse(match[0]) as OpenAIParsedQuery
    } catch {
      return null
    }
  }
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.toLowerCase().trim())
    .filter(Boolean)
}

function normalizeParsedQuery(
  parsed: OpenAIParsedQuery | null,
  raw: string
): AIRadarParsedQuery {
  const fallback = createEmptyParsedQuery(raw)

  if (!parsed) return fallback

  return {
    raw,

    city:
      typeof parsed.city === 'string' && parsed.city.trim()
        ? parsed.city.toLowerCase().trim()
        : undefined,

    genderHint:
      parsed.gender === 'male' || parsed.gender === 'female'
        ? parsed.gender
        : undefined,

    tags: normalizeStringArray(parsed.tags),

    vibes: normalizeStringArray(parsed.vibes),

    keywords: normalizeStringArray(parsed.keywords).length
      ? normalizeStringArray(parsed.keywords)
      : fallback.keywords,
  }
}

export async function openaiParseQuery(
  query: string
): Promise<AIRadarParsedQuery> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY

  if (!apiKey) {
    console.warn('Missing NEXT_PUBLIC_OPENAI_API_KEY')
    return createEmptyParsedQuery(query)
  }

  const messages: OpenAIChatMessage[] = [
    {
      role: 'system',
      content: `
You are the query understanding engine for Vibelink AI Radar.

Convert the user's natural language dating/social discovery request into JSON.

Only return valid JSON. Do not explain.

JSON schema:
{
  "gender": "male" | "female" | null,
  "city": string | null,
  "tags": string[],
  "vibes": string[],
  "keywords": string[]
}

Rules:
- Output JSON only.
- gender should be male, female, or null.
- city should be lowercase English if possible.
- tags should be lowercase English keywords.
- vibes should describe the user's desired feeling or style.
- keywords should include important words from the user request.
- Use tags like: gym, beach, dance, kpop, streetwear, coffee, music, travel, cute, handsome, sexy, chill, hiphop, house, edm, fashion, art, foodie, nightlife.
- Use vibes like: cute, sexy, sunny, outdoor, lifestyle, streetwear, party, chill, korean, softboy.
- If the user says 台北, use city: "taipei".
- If the user says 台中, use city: "taichung".
- If the user says 高雄, use city: "kaohsiung".
- If the user says 男生 / 男孩 / 男性 / 帥哥, use gender: "male".
- If the user says 女生 / 女孩 / 女性 / 姐姐, use gender: "female".
- If the user says 健身 or 重訓, use tag: "gym".
- If the user says 海邊 or 沙灘, use tag: "beach".
- If the user says 街舞, use tag: "dance".
- If the user says 韓系 or KPOP, use tag: "kpop".
- If the user says 可愛 or 奶狗, use tag: "cute".
- If the user says 帥, use tag: "handsome".
- If the user says 性感 or 辣, use tag: "sexy".
      `.trim(),
    },
    {
      role: 'user',
      content: query,
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
        temperature: 0.1,
        messages,
      }),
    })

    if (!response.ok) {
      console.error('OpenAI parse query failed:', response.status)
      return createEmptyParsedQuery(query)
    }

    const data = (await response.json()) as OpenAIChatResponse
    const content = data.choices?.[0]?.message?.content ?? ''
    const parsed = safeJsonParse(content)

    return normalizeParsedQuery(parsed, query)
  } catch (error) {
    console.error('openaiParseQuery error:', error)
    return createEmptyParsedQuery(query)
  }
}