'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ensureUserProfile } from '@/lib/profile'
import { mockPosts } from '@/lib/mockPosts'
import type { PostItem } from '@/components/home/sections/feed/FeedGrid'

type UseHomeFeedArgs = {
  setIsAuthModalOpen: (open: boolean) => void
  setCurrentUserId: (userId: string | null) => void
  setToast: (toast: string | null) => void
}

const FEED_FIRST_BATCH = 18
const FEED_SECOND_BATCH = 36
const FEED_FULL_BATCH = 60

const SHORT_VIDEO_FIRST_BATCH = 6
const SHORT_VIDEO_SECOND_BATCH = 12
const SHORT_VIDEO_FULL_BATCH = 24

export function useHomeFeed({
  setIsAuthModalOpen,
  setCurrentUserId,
  setToast,
}: UseHomeFeedArgs) {
  const [realPosts, setRealPosts] = useState<PostItem[]>([])
  const [realVideos, setRealVideos] = useState<PostItem[]>([])
  const [mockSavedPostIds, setMockSavedPostIds] = useState<string[]>([])
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)

  const isLoadingShortVideosRef = useRef(false)

  useEffect(() => {
    const saved = localStorage.getItem('vibelink_mock_saved_posts')

    if (saved) {
      setMockSavedPostIds(JSON.parse(saved))
    }
  }, [])

  function withTimeout<T>(
    promise: Promise<T>,
    ms = 8000,
    label = 'request'
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        window.setTimeout(() => {
          reject(new Error(`${label} timeout`))
        }, ms)
      }),
    ])
  }

  async function safeTask<T>(
    task: () => PromiseLike<T>,
    label: string
  ): Promise<T | null> {
    try {
      return await withTimeout(Promise.resolve(task()), 5000, label)
    } catch (error) {
      console.warn(`${label} failed:`, error)
      return null
    }
  }

  function delay(ms: number) {
    return new Promise((resolve) => window.setTimeout(resolve, ms))
  }

  async function loadPosts(user?: any, limit = FEED_FIRST_BATCH, retry = 0) {
  try {
    const response = await withTimeout(
      fetch(`/api/feed?limit=${limit}`, {
        method: 'GET',
        cache: 'no-store',
      }),
      8000,
      'feed'
    )

    const data = await response.json()

    if (!data?.ok) {
      throw new Error('feed failed')
    }

    const mappedPosts: PostItem[] = (data.feed ?? [])
      .map((post: any) => {
        const images = (post.post_images ?? []).map(
          (img: any) => img.image_url
        )

        return {
          id: post.id,
          user_id: post.user_id,
          author:
            post.profiles?.display_name ||
            post.profiles?.username ||
            'Vibelink User',
          avatarUrl: post.profiles?.avatar_url || '',
          text: post.caption || '',
          likes: post.likes ?? 0,
          isLiked: !!post.isLiked,
          isSaved: !!post.isSaved,
          images,
          aiTags: post.ai_tags ?? [],
          type: 'post' as const,
          isMine: post.user_id === user?.id,
          feedScore: post.feedScore,
          feedReasons: post.feedReasons,
        }
      })
      .filter((post: PostItem) => post.images.length > 0)

    setRealPosts(mappedPosts)
  } catch (error) {
    console.error('loadPosts /api/feed failed:', error)

    if (retry < 1) {
      window.setTimeout(() => {
        loadPosts(user, limit, retry + 1)
      }, 600)
      return
    }

    setToast('Feed 載入失敗，請稍後再試')
  }
}

  async function loadShortVideos(
    user?: any,
    limit = SHORT_VIDEO_FIRST_BATCH,
    retry = 0
  ) {
    try {
      const { data, error } = await withTimeout(
        Promise.resolve(
          supabase
            .from('short_videos')
            .select(`
              id,
              caption,
              video_url,
              thumbnail_url,
              created_at,
              user_id
            `)
            .order('created_at', { ascending: false })
            .limit(limit)
        ),
        8000,
        'short_videos'
      )

      if (error) throw error

      const mappedVideos: PostItem[] = (data ?? []).map((video: any) => ({
        id: video.id,
        user_id: video.user_id,
        author: 'Vibelink User',
        text: video.caption || '',
        likes: 0,
        images: video.thumbnail_url
          ? [video.thumbnail_url]
          : video.video_url
            ? [video.video_url]
            : [],
        thumbnailUrl: video.thumbnail_url || '',
        thumbnail_url: video.thumbnail_url || '',
        videoUrl: video.video_url,
        type: 'video',
        aiTags: ['短影片'],
        isMine: video.user_id === user?.id,
        isLiked: false,
        isSaved: false,
      }))

      setRealVideos(mappedVideos)
    } catch (error) {
      console.error('讀取短影片失敗:', error)

      if (retry < 1) {
        window.setTimeout(() => {
          loadShortVideos(user, limit, retry + 1)
        }, 600)
        return
      }

      setToast('短影片載入失敗，請稍後再試')
    }
  }

  async function loadUnreadNotificationCount(userId?: string | null) {
  if (!userId) {
    setUnreadNotificationCount(0)
    return
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('recipient_user_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('讀取未讀通知數失敗:', error)
    return
  }

  setUnreadNotificationCount(count ?? 0)
}

  useEffect(() => {
    async function initHome() {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user ?? null

      console.log('目前 session:', data.session)

      setCurrentUserId(user?.id ?? null)

      void loadUnreadNotificationCount(user?.id ?? null)
      void setupNotificationRealtime(user?.id ?? null)

      if (!data.session) {
        setIsAuthModalOpen(true)
        return
      }

      setIsAuthModalOpen(false)

      void safeTask(
        () => ensureUserProfile(),
        'home_ensure_profile'
      ).then((profile) => {
        console.log('目前登入者 Profile:', profile)
      })

      void safeTask(
  () => loadPosts(user, FEED_FIRST_BATCH),
  'home_load_posts_first'
)

window.setTimeout(() => {
  void safeTask(
    () => loadPosts(user, FEED_SECOND_BATCH),
    'home_load_posts_second'
  )
}, 1200)

window.setTimeout(() => {
  void safeTask(
    () => loadPosts(user, FEED_FULL_BATCH),
    'home_load_posts_full'
  )
}, 8000)

window.setTimeout(() => {
  void safeTask(
    () => loadShortVideos(user, SHORT_VIDEO_FIRST_BATCH),
    'home_load_short_videos_first'
  )
}, 150)

window.setTimeout(() => {
  void safeTask(
    () => loadShortVideos(user, SHORT_VIDEO_SECOND_BATCH),
    'home_load_short_videos_second'
  )
}, 1500)
    }


    let notificationChannel: ReturnType<typeof supabase.channel> | null = null

async function setupNotificationRealtime(userId: string | null) {
  if (!userId) return

  if (notificationChannel) {
    await supabase.removeChannel(notificationChannel)
    notificationChannel = null
  }

  supabase
    .getChannels()
    .filter((channel) =>
      channel.topic.includes(`notifications-${userId}`)
    )
    .forEach((channel) => {
      void supabase.removeChannel(channel)
    })

  notificationChannel = supabase.channel(
    `notifications-${userId}-${Date.now()}`
  )

  notificationChannel.on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `recipient_user_id=eq.${userId}`,
    },
    () => {
      setUnreadNotificationCount((prev) => prev + 1)
    }
  )

  notificationChannel.subscribe()
}

initHome()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('登入狀態變化:', session)

        if (session) {
          setIsAuthModalOpen(false)
          setCurrentUserId(session.user.id)
void loadUnreadNotificationCount(session.user.id)
void setupNotificationRealtime(session.user.id)

          void safeTask(
            () => ensureUserProfile(),
            'home_auth_ensure_profile'
          ).then((profile) => {
            console.log('目前登入者 Profile:', profile)
          })

          void safeTask(
  () => loadPosts(session.user, FEED_FIRST_BATCH),
  'home_auth_load_posts_first'
)

window.setTimeout(() => {
  void safeTask(
    () => loadPosts(session.user, FEED_SECOND_BATCH),
    'home_auth_load_posts_second'
  )
}, 1200)

window.setTimeout(() => {
  void safeTask(
    () => loadPosts(session.user, FEED_FULL_BATCH),
    'home_auth_load_posts_full'
  )
}, 8000)

window.setTimeout(() => {
  void safeTask(
    () => loadShortVideos(session.user, SHORT_VIDEO_FIRST_BATCH),
    'home_auth_load_short_videos_first'
  )
}, 150)

window.setTimeout(() => {
  void safeTask(
    () => loadShortVideos(session.user, SHORT_VIDEO_SECOND_BATCH),
    'home_auth_load_short_videos_second'
  )
}, 1500)
        }
      }
    )

    return () => {
  listener.subscription.unsubscribe()

  if (notificationChannel) {
    void supabase.removeChannel(notificationChannel)
  }
}
  }, [])

  const mergedPosts = useMemo(
    () => [
      ...realVideos,
      ...realPosts,

      ...(realPosts.length < 18
        ? mockPosts.slice(0, 6)
        : []),
    ],
    [realPosts, realVideos]
  )

  const shortVideoPosts = useMemo(
    () => mergedPosts.filter((post) => post.type === 'video' || post.videoUrl),
    [mergedPosts]
  )

  return {
    realPosts,
    setRealPosts,
    realVideos,
    setRealVideos,
    mockSavedPostIds,
    setMockSavedPostIds,
    isLoadingShortVideosRef,
    withTimeout,
    safeTask,
    delay,
    loadPosts,
    loadShortVideos,
    mergedPosts,
    shortVideoPosts,
    unreadNotificationCount,
setUnreadNotificationCount,
loadUnreadNotificationCount,
    SHORT_VIDEO_FIRST_BATCH,
    SHORT_VIDEO_SECOND_BATCH,
    SHORT_VIDEO_FULL_BATCH,
  }
}