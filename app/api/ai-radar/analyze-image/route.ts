import { NextResponse } from 'next/server'
import OpenAI from 'openai'

import { getAuthenticatedSupabaseUser } from '@/lib/api/authenticatedSupabaseUser'
import {
  checkRateLimits,
  getRequestIp,
  type RateLimitRule,
} from '@/lib/api/rateLimit'
import { supabaseAdmin } from '@/lib/supabase-admin'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MINUTE = 60 * 1000
const DAY = 24 * 60 * 60 * 1000

const ANALYZE_IMAGE_IP_RULES: RateLimitRule[] = [
  {
    name: 'analyze-image-ip-minute',
    limit: 15,
    windowMs: MINUTE,
  },
]

const ANALYZE_IMAGE_USER_RULES: RateLimitRule[] = [
  {
    name: 'analyze-image-user-minute',
    limit: 3,
    windowMs: MINUTE,
  },
  {
    name: 'analyze-image-user-day',
    limit: 20,
    windowMs: DAY,
  },
]

function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      ok: false,
      error: 'RATE_LIMITED',
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
      },
    }
  )
}

export async function POST(req: Request) {
  try {
    const ipLimit = checkRateLimits(
      getRequestIp(req),
      ANALYZE_IMAGE_IP_RULES
    )

    if (!ipLimit.allowed) {
      return rateLimitResponse(ipLimit.retryAfterSeconds)
    }

    const auth = await getAuthenticatedSupabaseUser(req)

    if (!auth.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: 'UNAUTHORIZED',
        },
        { status: 401 }
      )
    }

    const userLimit = checkRateLimits(
      auth.user.id,
      ANALYZE_IMAGE_USER_RULES
    )

    if (!userLimit.allowed) {
      return rateLimitResponse(userLimit.retryAfterSeconds)
    }

    const body = await req.json()
    const imageUrl = body?.imageUrl
    const postId = body?.postId

    if (!imageUrl || !postId) {
      return NextResponse.json({
        ok: false,
        error: !imageUrl ? 'NO_IMAGE_URL' : 'NO_POST_ID',
      })
    }

    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('id, user_id')
      .eq('id', postId)
      .maybeSingle()

    if (postError) {
      console.error('Load post ownership failed:', postError)

      return NextResponse.json(
        {
          ok: false,
          error: 'POST_LOOKUP_FAILED',
        },
        { status: 500 }
      )
    }

    if (!post) {
      return NextResponse.json(
        {
          ok: false,
          error: 'POST_NOT_FOUND',
        },
        { status: 404 }
      )
    }

    if (post.user_id !== auth.user.id) {
      return NextResponse.json(
        {
          ok: false,
          error: 'FORBIDDEN',
        },
        { status: 403 }
      )
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
  "ai_tags": [],
  "ai_style_tags": [],
  "ai_caption": ""
}

規則：
- ai_tags 用英文小寫
- ai_style_tags 用英文小寫
- 每個陣列最多 8 個
- 不要判斷真實年齡、國籍、種族
- 不要輸出敏感身分推測
- 不要照抄範例；必須根據圖片內容實際判斷
- 如果圖片是車、物品、風景、食物，也要依照實際內容輸出，不要強行輸出人物/健身/海邊標籤
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
    console.log('🟣 [Vision] rawText:', rawText)

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

    const { error } = await supabaseAdmin
      .from('posts')
      .update({
        ai_tags: parsed.ai_tags ?? [],
        ai_style_tags: parsed.ai_style_tags ?? [],
        ai_caption: parsed.ai_caption ?? '',
        ai_analyzed: true,
        ai_analyzed_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .eq('user_id', auth.user.id)

    if (error) {
      console.error('Update post AI analysis failed:', error)

      return NextResponse.json({
        ok: false,
        error: 'UPDATE_POST_AI_ANALYSIS_FAILED',
        result: parsed,
      })
    }

    return NextResponse.json({
      ok: true,
      result: parsed,
      updatedPostId: postId,
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
