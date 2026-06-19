// src/components/profile/PostInsightsPage.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { uiText } from '@/lib/uiText'

type Props = {
  onClose: () => void
  postId?: string | null
}

type Stats = {
  views: number
  likes: number
  comments: number
}

export default function PostInsightsPage({ onClose, postId }: Props) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    views: 0,
    likes: 0,
    comments: 0,
  })

  useEffect(() => {
    if (!postId) {
      setLoading(false)
      return
    }

    loadPostInsights()
  }, [postId])

  async function loadPostInsights() {
    if (!postId) return

    try {
      setLoading(true)

      const [
        { count: viewsCount, error: viewsError },
        { count: likesCount, error: likesError },
        { count: commentsCount, error: commentsError },
      ] = await Promise.all([
        supabase
          .from('post_views')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', postId),

        supabase
          .from('likes')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', postId),

        supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', postId),
      ])

      if (viewsError) console.error('讀取貼文觸及失敗:', viewsError)
      if (likesError) console.error('讀取貼文按讚失敗:', likesError)
      if (commentsError) console.error('讀取貼文留言失敗:', commentsError)

      setStats({
        views: viewsCount ?? 0,
        likes: likesCount ?? 0,
        comments: commentsCount ?? 0,
      })
    } catch (error) {
      console.error('讀取貼文流量報告失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const rows = [
    { label: uiText('觸及次數', 'Reach'), value: stats.views },
    { label: uiText('按讚次數', 'Likes'), value: stats.likes },
    { label: uiText('留言數', 'Comments'), value: stats.comments },
  ]

  return (
    <motion.div
      className="fixed inset-0 z-[1300] flex justify-center bg-[var(--app-bg)] text-[var(--app-text)]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 360, damping: 34 }}
    >
      <div className="relative h-full w-full max-w-[430px] overflow-y-auto bg-[var(--app-bg)]">
        <div className="sticky top-0 z-20 flex h-[56px] items-center border-b border-black/5 bg-[var(--app-bg)]/95 px-4 backdrop-blur-md dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 active:scale-95"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>

          <span className="ml-1 text-[16px] font-medium">
            {uiText('貼文流量報告', 'Post Insights')}
          </span>
        </div>

        <div className="px-5 pt-5">
          <div className="rounded-[18px] border border-black/5 bg-black/[0.06] px-5 py-6 shadow-sm dark:border-white/10 dark:bg-white/[0.07]">
            {rows.map((row, index) => (
              <div
                key={row.label}
                className={`flex items-center justify-between ${
                  index !== rows.length - 1 ? 'mb-6' : ''
                }`}
              >
                <span className="text-[15px] font-medium">
                  {row.label}
                </span>

                <span className="text-[15px]">
                  {loading ? '—' : row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
