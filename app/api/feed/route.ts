import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getPersonalizedFeed } from '@/lib/feed/getPersonalizedFeed'

export async function GET() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const currentUserId = session?.user?.id ?? null

    const feed = await getPersonalizedFeed(currentUserId)

    return NextResponse.json({
      ok: true,
      feed,
    })
  } catch (error) {
    console.error('GET /api/feed failed:', error)

    return NextResponse.json({
      ok: false,
      feed: [],
      error: 'GET_FEED_FAILED',
    })
  }
}