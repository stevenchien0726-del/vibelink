import type { AIRadarParsedQuery } from './aiRadarParser'
import { AI_RADAR_SEMANTIC_ALIAS } from './aiRadarSemanticMap'

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

function expandSemanticAlias(raw: string, keywords: string[]) {
  const expandedTags: string[] = []

  const sourceText = [raw, ...keywords].join(' ').toLowerCase()

  Object.entries(AI_RADAR_SEMANTIC_ALIAS).forEach(
    ([trigger, aliases]) => {
      if (sourceText.includes(trigger.toLowerCase())) {
        expandedTags.push(...aliases)
      }
    }
  )

  return expandedTags
    .map((tag) => tag.toLowerCase().trim())
    .filter(Boolean)
}

function normalizeParsedQuery(
  parsed: OpenAIParsedQuery | null,
  raw: string
): AIRadarParsedQuery {
  const fallback = createEmptyParsedQuery(raw)

  if (!parsed) return fallback

  const normalizedKeywords =
    normalizeStringArray(parsed.keywords).length > 0
      ? normalizeStringArray(parsed.keywords)
      : fallback.keywords

  const semanticTags = expandSemanticAlias(raw, normalizedKeywords)

  const mergedTags = [
    ...normalizeStringArray(parsed.tags),
    ...semanticTags,
  ]

  const uniqueTags = [...new Set(mergedTags)]

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

    tags: uniqueTags,

    vibes: normalizeStringArray(parsed.vibes),

    keywords: normalizedKeywords,
  }
}

export async function openaiParseQuery(
  query: string,
  signal?: AbortSignal
): Promise<AIRadarParsedQuery> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.warn('Missing OPENAI_API_KEY')
    return createEmptyParsedQuery(query)
  }

  const messages: OpenAIChatMessage[] = [
    {
      role: 'system',
      content: `
You are the multilingual query understanding engine for Vibelink AI Radar.

Your job:
- Understand multilingual social discovery intent
- Support Traditional Chinese + English mixed language
- Extract tags, vibes, gender, city, and lifestyle intent
- Return ONLY valid JSON
- Never explain anything

JSON schema:
{
  "gender": "male" | "female" | null,
  "city": string | null,
  "tags": string[],
  "vibes": string[],
  "keywords": string[]
}

Core Rules:
- Output JSON only
- tags must always be lowercase English
- vibes must always be lowercase English
- city should be lowercase English if possible
- keywords can preserve original language
- Understand mixed Chinese + English input
- Infer personality/lifestyle/social energy when possible

City normalization:
- 台北 -> taipei
- 台中 -> taichung
- 高雄 -> kaohsiung
- 東京 -> tokyo
- 首爾 -> seoul
- 洛杉磯 -> los angeles
- 紐約 -> new york

Gender rules:
- 男生 / 男孩 / 帥哥 / male / guy / boy -> male
- 女生 / 女孩 / 姐姐 / female / girl / woman -> female

Tag understanding:
- 健身 / workout / fitness / gym -> gym
- 海邊 / 沙灘 / beach / ocean -> beach
- 街舞 / dance -> dance
- 韓系 / kpop / korean -> kpop
- 可愛 / cute / softboy -> cute
- 性感 / hot / sexy -> sexy
- 咖啡 / cafe / coffee -> coffee
- 夜生活 / nightlife / rave / clubbing -> nightlife
- 潮流 / fashion / streetwear -> streetwear
- 文青 / artsy / indie -> art
- 跑車 / supercar / ferrari / bugatti -> supercar
- 科技感 / futuristic / cyberpunk -> futuristic
- 音樂祭 / festival -> festival
- chill / 放鬆 -> chill
- house music / techno / edm -> edm

Vibe understanding:
- outgoing
- sporty
- softboy
- luxury
- futuristic
- lifestyle
- korean
- chill
- party
- artsy
- elegant
- classy
- mysterious
- sunny
- energetic

Examples:

Input:
"找喜歡健身和海邊的女生"

Output:
{
  "gender": "female",
  "city": null,
  "tags": ["gym", "beach"],
  "vibes": ["sporty", "outgoing"],
  "keywords": ["健身", "海邊"]
}

Input:
"Find me cute cafe girls in Taipei"

Output:
{
  "gender": "female",
  "city": "taipei",
  "tags": ["coffee", "cute"],
  "vibes": ["softboy", "lifestyle"],
  "keywords": ["cute", "cafe", "girls"]
}

Input:
"想找有未來感、科技感的男生"

Output:
{
  "gender": "male",
  "city": null,
  "tags": ["futuristic"],
  "vibes": ["modern", "sleek"],
  "keywords": ["科技感", "未來感"]
}
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
      signal,
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
