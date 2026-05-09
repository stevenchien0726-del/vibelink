// src/app/api/ai-radar/parse/route.ts

import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const query = body.query

    if (!query) {
      return NextResponse.json(
        { error: 'Missing query' },
        { status: 400 }
      )
    }

    const response = await openai.responses.create({
      model: 'gpt-5.4-mini',

      input: [
        {
          role: 'system',
          content: `
你是 Vibelink AI Radar 的 Query Parser。

請把使用者自然語言轉成搜尋 JSON。

只回傳 JSON。

格式：

{
  "raw": string,
  "city": string | null,
  "genderHint": "male" | "female" | null,
  "tags": string[],
  "vibes": string[],
  "keywords": string[]
}
`,
        },
        {
          role: 'user',
          content: query,
        },
      ],
    })

    const text = response.output_text

    return NextResponse.json({
      success: true,
      rawText: text,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        error: 'OpenAI parse failed',
      },
      { status: 500 }
    )
  }
}