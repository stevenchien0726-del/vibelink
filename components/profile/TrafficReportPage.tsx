'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { uiText } from '@/lib/uiText'

type Props = {
  onClose: () => void
}

type TrafficStats = {
  views: number
  likes: number
  comments: number
  followers: number
}

const TRAFFIC_REPORT_TIMEOUT_MS = 5000
const EMPTY_TRAFFIC_STATS: TrafficStats = {
  views: 0,
  likes: 0,
  comments: 0,
  followers: 0,
}
const trafficReportCache = new Map<string, TrafficStats>()
const trafficReportInFlight = new Map<string, Promise<TrafficStats>>()

function withTrafficReportTimeout<T>(
  promise: PromiseLike<T>,
  label: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} timeout`))
      }, TRAFFIC_REPORT_TIMEOUT_MS)
    }),
  ]).finally(() => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
  })
}

async function getCurrentTrafficReportUserId() {
  const {
    data: { user },
  } = await withTrafficReportTimeout(
    supabase.auth.getUser(),
    'traffic_report_auth_user'
  )

  return user?.id ?? null
}

function getSettledCount(result: PromiseSettledResult<any>) {
  if (result.status === 'rejected') {
    console.warn('Traffic report count failed:', result.reason)
    return 0
  }

  if (result.value?.error) {
    console.warn('Traffic report count error:', result.value.error)
    return 0
  }

  return result.value?.count ?? 0
}

async function fetchTrafficStatsForUser(userId: string) {
  const inFlight = trafficReportInFlight.get(userId)

  if (inFlight) return inFlight

  const request = (async () => {
    const since = new Date()
    since.setDate(since.getDate() - 30)
    const sinceIso = since.toISOString()

    const postsResult = await withTrafficReportTimeout(
      supabase.from('posts').select('id').eq('user_id', userId),
      'traffic_report_posts'
    )

    if (postsResult.error) throw postsResult.error

    const postIds = postsResult.data?.map((post) => post.id) ?? []

    const followersPromise = withTrafficReportTimeout(
      supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userId)
        .gte('created_at', sinceIso),
      'traffic_report_followers'
    )

    if (postIds.length === 0) {
      const [followersResult] = await Promise.allSettled([followersPromise])
      const stats = {
        ...EMPTY_TRAFFIC_STATS,
        followers: getSettledCount(followersResult),
      }

      trafficReportCache.set(userId, stats)

      return stats
    }

    const [
      followersResult,
      viewsResult,
      likesResult,
      commentsResult,
    ] = await Promise.allSettled([
      followersPromise,
      withTrafficReportTimeout(
        supabase
          .from('post_views')
          .select('id', { count: 'exact', head: true })
          .in('post_id', postIds)
          .gte('created_at', sinceIso),
        'traffic_report_views'
      ),
      withTrafficReportTimeout(
        supabase
          .from('likes')
          .select('id', { count: 'exact', head: true })
          .in('post_id', postIds)
          .gte('created_at', sinceIso),
        'traffic_report_likes'
      ),
      withTrafficReportTimeout(
        supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .in('post_id', postIds)
          .gte('created_at', sinceIso),
        'traffic_report_comments'
      ),
    ])

    const stats = {
      views: getSettledCount(viewsResult),
      likes: getSettledCount(likesResult),
      comments: getSettledCount(commentsResult),
      followers: getSettledCount(followersResult),
    }

    trafficReportCache.set(userId, stats)

    return stats
  })().finally(() => {
    trafficReportInFlight.delete(userId)
  })

  trafficReportInFlight.set(userId, request)

  return request
}

export async function preloadTrafficReportData(userId?: string | null) {
  const resolvedUserId = userId ?? (await getCurrentTrafficReportUserId())

  if (!resolvedUserId) return

  await fetchTrafficStatsForUser(resolvedUserId)
}

export default function TrafficReportPage({ onClose }: Props) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<TrafficStats>(EMPTY_TRAFFIC_STATS)

  useEffect(() => {
    loadTrafficStats()
  }, [])

  async function loadTrafficStats() {
    let hasCache = false

    try {
      const userId = await getCurrentTrafficReportUserId()

      if (!userId) {
        setStats(EMPTY_TRAFFIC_STATS)
        return
      }

      const cachedStats = trafficReportCache.get(userId)
      hasCache = Boolean(cachedStats)

      if (cachedStats) {
        setStats(cachedStats)
        setLoading(false)
      } else {
        setLoading(true)
      }

      const nextStats = await fetchTrafficStatsForUser(userId)

      setStats(nextStats)
    } catch (error) {
      console.error('load traffic report failed:', error)

      if (!hasCache) {
        setStats(EMPTY_TRAFFIC_STATS)
      }
    } finally {
      setLoading(false)
    }

    return
    /*

    try {
      setLoading(true)

      const since = new Date()
      since.setDate(since.getDate() - 30)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('讀取登入用戶失敗:', userError)
        return
      }

      const { data: myPosts, error: postsError } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', user!.id)

      if (postsError) {
        console.error('讀取自己的貼文失敗:', postsError)
        return
      }

      const postIds = myPosts?.map((post) => post.id) ?? []

      const { count: followersCount, error: followersError } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', user!.id)
        .gte('created_at', since.toISOString())

      if (followersError) {
        console.error('讀取新增粉絲數失敗:', followersError)
      }

      if (postIds.length === 0) {
        setStats({
          views: 0,
          likes: 0,
          comments: 0,
          followers: followersCount ?? 0,
        })
        return
      }

      const [
        { count: viewsCount, error: viewsError },
        { count: likesCount, error: likesError },
        { count: commentsCount, error: commentsError },
      ] = await Promise.all([
        supabase
          .from('post_views')
          .select('id', { count: 'exact', head: true })
          .in('post_id', postIds)
          .gte('created_at', since.toISOString()),

        supabase
          .from('likes')
          .select('id', { count: 'exact', head: true })
          .in('post_id', postIds)
          .gte('created_at', since.toISOString()),

        supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .in('post_id', postIds)
          .gte('created_at', since.toISOString()),
      ])

      if (viewsError) console.error('讀取觸及次數失敗:', viewsError)
      if (likesError) console.error('讀取按讚次數失敗:', likesError)
      if (commentsError) console.error('讀取留言數失敗:', commentsError)

      setStats({
        views: viewsCount ?? 0,
        likes: likesCount ?? 0,
        comments: commentsCount ?? 0,
        followers: followersCount ?? 0,
      })
    } catch (error) {
      console.error('讀取流量報告失敗:', error)
    } finally {
      setLoading(false)
    }
    */
  }

  const rows = [
    { label: uiText('觸及次數', 'Reach'), value: stats.views },
    { label: uiText('按讚次數', 'Likes'), value: stats.likes },
    { label: uiText('留言數', 'Comments'), value: stats.comments },
    { label: uiText('新增粉絲數', 'New Followers'), value: stats.followers },
  ]

  return (
  <motion.div
    className="fixed inset-0 z-[700] bg-[var(--app-bg)] text-[var(--app-text)]"
    initial={{ x: '100%' }}
    animate={{ x: 0 }}
    exit={{ x: '100%' }}
    transition={{
      duration: 0.34,
      ease: [0.22, 1, 0.36, 1],
    }}
  >
      <div className="mx-auto min-h-screen w-full max-w-[430px]">
        <div className="sticky top-0 z-10 flex h-[44px] items-center justify-between border-b border-white/10 bg-[var(--app-bg)] px-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 text-[16px] active:scale-95"
          >
            <ChevronLeft size={22} />
            <span>{uiText('流量報告', 'Traffic Report')}</span>
          </button>

          <span className="text-[14px] text-[var(--app-muted)]">
            {uiText('過去30天記錄', 'Past 30 Days')}
          </span>
        </div>

        <div className="px-6 pt-4">
          <div className="rounded-[16px] border border-white/10 bg-white/[0.06] px-6 py-5 shadow-sm">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-4"
              >
                <span className="text-[17px] font-semibold">{row.label}</span>

                <span className="text-[18px] font-semibold">
                  {loading ? '...' : row.value}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-center text-[12px] leading-5 text-[var(--app-muted)]">
            {uiText('目前數據來自 Supabase likes、comments、follows、post_views。', 'Current data comes from Supabase likes, comments, follows, and post_views.')}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
