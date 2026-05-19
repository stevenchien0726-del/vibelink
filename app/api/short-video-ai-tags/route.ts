import { NextResponse } from 'next/server'
import OpenAI from 'openai'

import { supabase } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const frames = body?.frames ?? []

    const videoId = body?.videoId ?? null

    if (!Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No frames provided' },
        { status: 400 }
      )
    }

    const input: any[] = [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `
你是 Vibelink 的短影片視覺分析器。
請根據這 3 張短影片 keyframes，輸出 JSON。

格式：
{
  "tags": ["tag1", "tag2"],
  "caption": "一句中文 vibe 描述"
}

tag 請用英文小寫，例如：
dance, kpop, cute, gym, streetwear, beach, coffee, travel, night vibe, party, fashion

請只回傳 JSON，不要使用 markdown。
            `,
          },
          ...frames.slice(0, 3).map((frame: string) => ({
            type: 'input_image',
            image_url: frame,
          })),
        ],
      },
    ]

    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input,
    })

    const outputText = response.output_text || '{}'
    const cleaned = outputText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    const tags = parsed.tags ?? []
const caption = parsed.caption ?? ''

if (videoId) {
  const { error: updateError } = await supabase
    .from('short_videos')
    .update({
      ai_tags: tags,
      ai_caption: caption,
    })
    .eq('id', videoId)

  if (updateError) {
    console.error('更新 short_videos AI tags 失敗:', updateError)
  }
}

return NextResponse.json({
  ok: true,
  tags,
  caption,
})
  } catch (error) {
    console.error('short-video-ai-tags failed:', error)

    return NextResponse.json(
      { ok: false, error: 'Short video AI tags failed' },
      { status: 500 }
    )
  }
}