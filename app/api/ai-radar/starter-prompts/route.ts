// src/app/api/ai-radar/starter-prompts/route.ts

import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 1,
      messages: [
        {
          role: 'system',
          content: `
你是 Vibelink 的 AI 雷達首頁提示詞生成器。

Vibelink AI 雷達的核心是：
「幫使用者找不同 vibe 的人」。

請生成 3 個：
- 真正像 AI 搜尋人的提示詞
- 要明確描述想找的人
- 要包含 vibe、外貌、生活風格、個性、社交感、夜生活感、IG感、氣質等方向
- 要像真人會打的搜尋句子
- 不要變成聊天問題
- 不要像心理測驗
- 不要像約會訪談
- 不要太長
- 繁體中文
- 每句 10~25 字左右

好的方向例如：
- 想找有韓系奶狗感的男生
- 幫我找夜生活感比較重的人
- 找很像 IG 小網紅 vibe 的女生

只回傳 JSON array。
不要解釋。
`,
        },
      ],
    })

    const text =
      response.choices[0]?.message?.content ?? '[]'

    const cleanedText = text
  .replace(/```json/g, '')
  .replace(/```/g, '')
  .trim()

let prompts: string[] = []

try {
  prompts = JSON.parse(cleanedText)
} catch (error) {
  console.error(
    'starter prompts JSON parse failed:',
    error
  )
}

    console.log('🟢 starter prompts raw:', text)
console.log('🟢 starter prompts parsed:', prompts)

    return NextResponse.json({
      ok: true,
      prompts: Array.isArray(prompts)
        ? prompts.slice(0, 3)
        : [],
    })
  } catch (error) {
    console.error(
      'starter-prompts route failed:',
      error
    )

    return NextResponse.json({
      ok: false,
      prompts: [
        '幫我找可愛奶狗弟弟',
        '喜歡大自然的女生',
        '身材性感內建男模特',
      ],
    })
  }
}