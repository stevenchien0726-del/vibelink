'use client'

import { useEffect, useState } from 'react'
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

export default function TrafficReportPage({ onClose }: Props) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<TrafficStats>({
    views: 0,
    likes: 0,
    comments: 0,
    followers: 0,
  })

  useEffect(() => {
    loadTrafficStats()
  }, [])

  async function loadTrafficStats() {
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
        .eq('user_id', user.id)

      if (postsError) {
        console.error('讀取自己的貼文失敗:', postsError)
        return
      }

      const postIds = myPosts?.map((post) => post.id) ?? []

      const { count: followersCount, error: followersError } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', user.id)
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
  }

  const rows = [
    { label: uiText('觸及次數', 'Reach'), value: stats.views },
    { label: uiText('按讚次數', 'Likes'), value: stats.likes },
    { label: uiText('留言數', 'Comments'), value: stats.comments },
    { label: uiText('新增粉絲數', 'New Followers'), value: stats.followers },
  ]

  return (
    <div className="fixed inset-0 z-[700] bg-[var(--app-bg)] text-[var(--app-text)]">
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
    </div>
  )
}
