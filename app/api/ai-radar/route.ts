import { NextResponse } from 'next/server'

import { openaiParseQuery } from '@/lib/ai-radar/openaiParseQuery'
import { generateAIRadarReply } from '@/lib/ai-radar/generateAIRadarReply'
import { searchAIRadarUsers } from '@/lib/aiRadar'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const query = body?.query ?? ''

    if (!query) {
      return NextResponse.json({ ok: false })
    }

    const parsedQuery = await openaiParseQuery(query)
    const matchedUsers = searchAIRadarUsers(parsedQuery)

    const aiReply = await generateAIRadarReply({
      query,
      parsedQuery,
      users: matchedUsers,
    })

    return NextResponse.json({
      ok: true,
      parsedQuery,
      matchedUsers,
      aiReply,
    })
  } catch (error) {
    console.error('AI Radar API route failed:', error)

    return NextResponse.json(
      {
        ok: false,
        matchedUsers: [],
        aiReply: 'AI 雷達目前連線不穩，請再試一次。',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'AI Radar API is alive',
  })
}