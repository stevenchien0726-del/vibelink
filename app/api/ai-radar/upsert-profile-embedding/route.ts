import { NextResponse } from 'next/server'
import { upsertProfileEmbedding } from '@/lib/ai-radar/upsertProfileEmbedding'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = body?.userId

    if (!userId) {
      return NextResponse.json({
        ok: false,
        error: 'MISSING_USER_ID',
      })
    }

    const result = await upsertProfileEmbedding(userId)

    return NextResponse.json({
      ok: true,
      result,
    })
  } catch (error: any) {
    console.error('upsert profile embedding API failed:', error)

    return NextResponse.json(
      {
        ok: false,
        error: error?.message ?? 'UPSERT_PROFILE_EMBEDDING_FAILED',
      },
      { status: 200 }
    )
  }
}