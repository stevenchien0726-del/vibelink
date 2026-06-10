'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Play } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { PostItem } from '@/components/home/sections/feed/FeedGrid'
import { uiText } from '@/lib/uiText'

type Props = {
  posts?: PostItem[]
  onClose: () => void
  onOpenPost: (post: PostItem) => void
}

export default function FavoriteFeedPage({ onClose, onOpenPost }: Props) {
  const [items, setItems] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)
  const text = {
    title: uiText('最愛', 'Favorites'),
    loading: uiText('讀取中', 'Loading'),
    empty: uiText('目前還沒有新的內容', 'No new content yet'),
  }
  function withTimeout<T>(
    promise: PromiseLike<T>,
    ms = 6000,
    label = 'favorite_feed_request'
  ): Promise<T | null> {
    let timeoutId: number | null = null

    return Promise.race([
      Promise.resolve(promise),
      new Promise<null>((resolve) => {
        timeoutId = window.setTimeout(() => {
          console.warn(`${label} timeout`)
          resolve(null)
        }, ms)
      }),
    ]).finally(() => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    })
  }

  useEffect(() => {
    let cancelled = false

    async function loadFavoriteFeed() {
      try {
        if (!cancelled) {
          setLoading(true)
        }

      const userResult = await withTimeout(
  supabase.auth.getUser(),
  6000,
  'favorite_feed_user'
)

const user = userResult?.data.user

if (!user) {
  if (!cancelled) {
    setItems([])
  }
  return
}

const favoriteResult = await withTimeout(
  supabase
    .from('favorite_users')
    .select(`
    favorite_user_id,
    profiles:favorite_user_id (
      id,
      username,
      display_name,
      avatar_url
    )
  `)
    .eq('user_id', user.id),
  6000,
  'favorite_feed_favorite_users'
)

const favoriteRows = favoriteResult?.data

const favoriteUsers = favoriteRows ?? []
const favoriteUserIds = favoriteUsers.map(
  (row: any) => row.favorite_user_id
)

if (favoriteUserIds.length === 0) {
  if (!cancelled) {
    setItems([])
  }
  return
}

const favoriteNameMap = new Map<string, string>()

favoriteUsers.forEach((row: any) => {
  favoriteNameMap.set(
    row.favorite_user_id,
    row.profiles?.display_name ||
      row.profiles?.username ||
      'Vibelink User'
  )
})

      const postsResult = await withTimeout(
        supabase
          .from('posts')
          .select(`
          id,
          caption,
          created_at,
          user_id,
          post_images (
            image_url
          )
        `)
          .in('user_id', favoriteUserIds)
          .order('created_at', { ascending: false })
          .limit(60),
        6000,
        'favorite_feed_posts'
      )

      const videoResult = await withTimeout(
        supabase
          .from('short_videos')
          .select(`
          id,
          caption,
          video_url,
          created_at,
          user_id
        `)
          .in('user_id', favoriteUserIds)
          .order('created_at', { ascending: false })
          .limit(60),
        6000,
        'favorite_feed_short_videos'
      )

      const postsData = postsResult?.data ?? []
      const videoData = videoResult?.data ?? []

        const postIds = (postsData ?? []).map((post: any) => post.id)
const videoIds = (videoData ?? []).map((video: any) => video.id)

const likeResult =
  postIds.length > 0
    ? await withTimeout(
        supabase
          .from('likes')
          .select('post_id, user_id')
          .in('post_id', postIds),
        6000,
        'favorite_feed_likes'
      )
    : { data: [] }

const videoLikeResult =
  videoIds.length > 0
    ? await withTimeout(
        supabase
          .from('short_video_likes')
          .select('short_video_id, user_id')
          .in('short_video_id', videoIds),
        6000,
        'favorite_feed_video_likes'
      )
    : { data: [] }

const likeRows = likeResult?.data ?? []
const videoLikeRows = videoLikeResult?.data ?? []

const likeCountMap = new Map<string, number>()
const videoLikeCountMap = new Map<string, number>()

;(likeRows ?? []).forEach((like: any) => {
  likeCountMap.set(
    like.post_id,
    (likeCountMap.get(like.post_id) ?? 0) + 1
  )
})

;(videoLikeRows ?? []).forEach((like: any) => {
  videoLikeCountMap.set(
    like.short_video_id,
    (videoLikeCountMap.get(like.short_video_id) ?? 0) + 1
  )
})

      const photoItems: PostItem[] = (postsData ?? [])
        .map((post: any) => ({
          id: post.id,
          user_id: post.user_id,
          author: favoriteNameMap.get(post.user_id) || 'Vibelink User',
          text: post.caption || '',
          likes: likeCountMap.get(post.id) ?? 0,
          images: (post.post_images ?? []).map((img: any) => img.image_url),
          type: 'post' as const,
          aiTags: ['最愛用戶'],
          isMine: false,
        }))
        .filter((post) => post.images.length > 0)

      const videoItems: PostItem[] = (videoData ?? []).map((video: any) => ({
        id: video.id,
        user_id: video.user_id,
        author: favoriteNameMap.get(video.user_id) || 'Vibelink User',
        text: video.caption || '',
        likes: videoLikeCountMap.get(video.id) ?? 0,
        images: [],
        videoUrl: video.video_url,
        type: 'video' as const,
        aiTags: ['最愛用戶短影音'],
        isMine: false,
      }))

      if (!cancelled) {
        setItems([...videoItems, ...photoItems])
      }
    } catch (error) {
      console.warn('favorite feed load failed:', error)

      if (!cancelled) {
        setItems([])
      }
    } finally {
      if (!cancelled) {
        setLoading(false)
      }
    }
    }

    loadFavoriteFeed()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <motion.div
      data-block-page-swipe="true"
      data-no-page-swipe="true"
      className="fixed inset-0 z-[900] bg-[var(--app-bg)]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
    >
      <div className="mx-auto h-full w-full max-w-[430px] overflow-y-auto bg-[var(--app-surface)] px-3 pb-[120px] pt-3">
        <div className="mb-4 flex h-[36px] items-center">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 text-[13px] text-[var(--app-text)] active:scale-95"
          >
            <ChevronLeft size={16} />
            <span>{text.title}</span>
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center text-[14px] text-[var(--app-muted)]">
            {text.loading}
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center text-[14px] text-[var(--app-muted)]">
            {text.empty}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1">
            {items.map((post) => {
              const isVideo = post.type === 'video' || !!post.videoUrl
              const cover = post.images?.[0]

              return (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => onOpenPost(post)}
                  className="relative h-[280px] w-full overflow-hidden rounded-[6px] bg-[var(--app-card)] active:scale-[0.98]"
                >
                  {isVideo ? (
                    <>
                      {post.videoUrl ? (
                        <video
                          src={post.videoUrl}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <div className="h-full w-full bg-[var(--app-card)]" />
                      )}

                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <Play size={30} fill="white" color="white" />
                      </div>
                    </>
                  ) : (
                    cover && (
                      <img
                        src={cover}
                        className="h-full w-full object-cover"
                      />
                    )
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
