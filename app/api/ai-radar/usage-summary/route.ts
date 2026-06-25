import { NextResponse } from 'next/server'

import { getAuthenticatedSupabaseUser } from '@/lib/api/authenticatedSupabaseUser'
import { getAIRadarUsageSummary } from '@/lib/ai-radar/aiRadarUsage'

export async function GET(req: Request) {
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

  const summary = await getAIRadarUsageSummary(auth.user)

  return NextResponse.json({
    ok: true,
    ...summary,
  })
}
