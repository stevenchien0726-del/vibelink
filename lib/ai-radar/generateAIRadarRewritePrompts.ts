import OpenAI from 'openai'
import type { Locale } from '@/i18n'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateAIRadarRewritePrompts({
  query,
  parsedQuery,
  matchedUsers,
  locale = 'zh-TW',
}: {
  query: string
  parsedQuery: any
  matchedUsers: any[]
  locale?: Locale
}) {
  try {
    const systemPrompt =
      locale === 'en'
        ? `
You are Vibelink AI Radar's rewrite suggestion system.

Generate 3 short, natural English search prompts for a social discovery app.

Rules:
- Sound casual and social
- Feel like real app users
- Keep each prompt short
- Focus on vibe, personality, lifestyle, social energy
- Return ONLY a JSON array
`
        : `
你是 Vibelink 的 AI 雷達提示詞推薦系統。

請根據使用者原始搜尋與搜尋結果，
產生 3 個更自然、更像社交 App 使用者會問的繁體中文提示詞。

規則：
- 要像真實用戶會打的句子
- 不要太正式
- 保持簡短
- 偏生活感、人格特質、社交 vibe
- 只回傳 JSON array
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: JSON.stringify({
            locale,
            originalQuery: query,
            parsedQuery,
            matchedUsers: matchedUsers.slice(0, 5),
          }),
        },
      ],
    })

    const text = response.choices[0]?.message?.content ?? '[]'

    const prompts = JSON.parse(text)

    if (!Array.isArray(prompts)) return []

    return prompts
      .filter((item) => typeof item === 'string')
      .slice(0, 3)
  } catch (error) {
    console.error('generateAIRadarRewritePrompts failed:', error)

    return []
  }
}