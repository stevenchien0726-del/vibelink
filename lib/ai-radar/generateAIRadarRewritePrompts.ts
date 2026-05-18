import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateAIRadarRewritePrompts({
  query,
  parsedQuery,
  matchedUsers,
}: {
  query: string
  parsedQuery: any
  matchedUsers: any[]
}) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content:
            '你是 Vibelink 的 AI 雷達提示詞推薦系統。請根據使用者原始搜尋與搜尋結果，產生 3 個更自然、更像社交 App 使用者會問的繁體中文提示詞。只回傳 JSON array，不要解釋。',
        },
        {
          role: 'user',
          content: JSON.stringify({
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

    return prompts.slice(0, 3)
  } catch (error) {
    console.error('generateAIRadarRewritePrompts failed:', error)

    return []
  }
}