import { NextResponse } from 'next/server'
import OpenAI from 'openai'

import { supabase } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const imageUrl = body?.imageUrl
    const postId = body?.postId

    if (!imageUrl) {
      return NextResponse.json({
        ok: false,
        error: 'NO_IMAGE_URL',
      })
    }

    const response = await openai.responses.create({
  model: 'gpt-4.1-mini',
  input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `
你是 Vibelink 的 AI 圖片判讀系統。

請根據這張社群照片，分析它的社交風格與生活感。
只輸出 JSON，不要輸出 markdown。

格式：
{
  "ai_tags": ["gym", "beach"],
  "ai_style_tags": ["natural", "active"],
  "ai_caption": "一句中文描述"
}

規則：
- ai_tags 用英文小寫
- ai_style_tags 用英文小寫
- 每個陣列最多 8 個
- 不要判斷真實年齡、國籍、種族
- 不要輸出敏感身分推測
`,
            },
            {
              type: 'input_image',
              image_url: imageUrl,
            },
          ],
        },
            ] as any,
    })

    const rawText = response.output_text ?? ''

    let parsed

    try {
      parsed = JSON.parse(rawText)
    } catch {
      return NextResponse.json({
        ok: false,
        error: 'VISION_JSON_PARSE_FAILED',
        rawText,
      })
    }

    if (postId) {
  const { error } = await supabase
    .from('posts')
    .update({
      ai_tags: parsed.ai_tags ?? [],
      ai_style_tags: parsed.ai_style_tags ?? [],
      ai_caption: parsed.ai_caption ?? '',
      ai_analyzed: true,
      ai_analyzed_at: new Date().toISOString(),
    })
    .eq('id', postId)

  if (error) {
    console.error('Update post AI analysis failed:', error)

    return NextResponse.json({
      ok: false,
      error: 'UPDATE_POST_AI_ANALYSIS_FAILED',
      result: parsed,
    })
  }
}

return NextResponse.json({
  ok: true,
  result: parsed,
  updatedPostId: postId ?? null,
})
  } catch (error) {
    console.error('Analyze image failed:', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'ANALYZE_IMAGE_FAILED',
      },
      { status: 200 }
    )
  }
}