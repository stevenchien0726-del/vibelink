// src/app/api/ai-radar/starter-prompts/route.ts

import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function getFallbackPrompts(locale: string) {
  if (locale === 'en') {
    return [
      'Find cute cafe girls in Taipei',
      'Looking for sporty and sunny people',
      'Find stylish nightlife guys',
    ]
  }

  return [
    '想找有韓系奶狗感的男生',
    '幫我找夜生活感比較重的人',
    '找很像 IG 小網紅 vibe 的女生',
  ]
}

function getSystemPrompt(locale: string) {
  if (locale === 'en') {
    return `
You are Vibelink AI Radar's homepage prompt generator.

Vibelink AI Radar helps users find people with different vibes.

Generate 3 search prompts:
- They must sound like real users searching for people
- Clearly describe the kind of person the user wants to find
- Include vibe, appearance, lifestyle, personality, social energy, nightlife, IG-style energy, or aura
- Do not make them sound like chat questions
- Do not make them sound like personality quizzes
- Do not make them sound like dating interview questions
- Keep them short
- Use natural English
- Around 6 to 14 words each

Good examples:
- Find cute softboy guys with cafe vibes
- Looking for stylish girls with nightlife energy
- Find sporty people with sunny outdoor vibes

Return ONLY a JSON array.
Do not explain.
`.trim()
  }

  return `
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
`.trim()
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale') ?? 'zh-TW'

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 1,
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(locale),
        },
      ],
    })

    const text = response.choices[0]?.message?.content ?? '[]'

    const cleanedText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    let prompts: string[] = []

    try {
      prompts = JSON.parse(cleanedText)
    } catch (error) {
      console.error('starter prompts JSON parse failed:', error)
    }

    console.log('🟢 starter prompts locale:', locale)
    console.log('🟢 starter prompts raw:', text)
    console.log('🟢 starter prompts parsed:', prompts)

    return NextResponse.json({
      ok: true,
      prompts: Array.isArray(prompts)
        ? prompts.slice(0, 3)
        : getFallbackPrompts(locale),
    })
  } catch (error) {
    console.error('starter-prompts route failed:', error)

    return NextResponse.json({
      ok: false,
      prompts: getFallbackPrompts(locale),
    })
  }
}