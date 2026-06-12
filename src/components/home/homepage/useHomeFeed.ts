'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { ensureUserProfile } from '@/lib/profile'
import {
  AUTH_TIMEOUT_MS,
  SUPABASE_TIMEOUT_MS,
  logNativeLifecycle,
} from '@/lib/asyncTimeout'

import type { PostItem } from '@/components/home/sections/feed/FeedGrid'

type UseHomeFeedArgs = {
  setIsAuthModalOpen: (open: boolean) => void
  setCurrentUserId: (userId: string | null) => void
  setToast: (toast: string | null) => void
}

const FEED_FIRST_BATCH = 18
const FEED_SECOND_BATCH = 36
const FEED_FULL_BATCH = 60

const SHORT_VIDEO_FIRST_BATCH = 3
const SHORT_VIDEO_SECOND_BATCH = 12
const SHORT_VIDEO_FULL_BATCH = 24

function isVideoPost(post: PostItem) {
  return (
    post.type === 'video' ||
    !!post.videoUrl ||
    !!(post as any).video_url
  )
}

function getNaturalFeedScore(post: PostItem, index: number) {
  const baseScore = post.feedScore ?? 0
  const recencyScore = Math.max(0, 100 - index * 2.8)
  const videoBoost = isVideoPost(post) ? 9 : 0
  const mockPenalty = post.isMock ? -40 : 0

  return baseScore + recencyScore + videoBoost + mockPenalty
}

function buildNaturalBalancedFeed(
  realPosts: PostItem[],
  realVideos: PostItem[]
) {
  const scoredPosts = realPosts.map((post, index) => ({
    post,
    score: getNaturalFeedScore(post, index),
  }))

  const scoredVideos = realVideos.map((post, index) => ({
    post,
    score: getNaturalFeedScore(post, index),
  }))

  const naturallySorted = [...scoredPosts, ...scoredVideos]
    .sort((a, b) => b.score - a.score)
    .map((item) => item.post)

  const balanced: PostItem[] = []
  const deferredVideos: PostItem[] = []

  let consecutiveVideos = 0
  let videoCountInFirstScreen = 0

  for (const post of naturallySorted) {
    const isVideo = isVideoPost(post)
    const isFirstScreen = balanced.length < 12

    if (isVideo) {
      if (consecutiveVideos >= 2) {
        deferredVideos.push(post)
        continue
      }

      if (isFirstScreen && videoCountInFirstScreen >= 4) {
        deferredVideos.push(post)
        continue
      }

      consecutiveVideos += 1
      if (isFirstScreen) videoCountInFirstScreen += 1
    } else {
      consecutiveVideos = 0
    }

    balanced.push(post)
  }

  return [...balanced, ...deferredVideos]
}

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
  const bootstrappedHomeUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('vibelink_mock_saved_posts')

    if (saved) {
      setMockSavedPostIds(JSON.parse(saved))
    }
  }, [])

  function withTimeout<T>(
  promise: PromiseLike<T>,
  ms = SUPABASE_TIMEOUT_MS,
  label = 'request'
): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => {
      window.setTimeout(() => {
        logNativeLifecycle(`${label}_timeout`, { timeoutMs: ms })
        console.warn(`${label} timeout`)
        resolve(null)
      }, ms)
    }),
  ])
}

  async function safeTask<T>(
    task: () => PromiseLike<T>,
    label: string
  ): Promise<T | null> {
    try {
      return await withTimeout(Promise.resolve(task()), SUPABASE_TIMEOUT_MS, label)
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
        SUPABASE_TIMEOUT_MS,
        'feed'
      )

      if (!response) {
  throw new Error('feed timeout')
}

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
    const videosResult = await withTimeout(
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
      SUPABASE_TIMEOUT_MS,
'short_videos'
    )

    if (!videosResult) {
  if (retry < 2) {
    window.setTimeout(() => {
      loadShortVideos(user, limit, retry + 1)
    }, 900)
  }

  return
}

const {
  data: videosData,
  error: videosError,
} = videosResult

if (videosError) throw videosError

    const userIds = Array.from(
      new Set(
        (videosData ?? [])
          .map((video: any) => video.user_id)
          .filter(Boolean)
      )
    )

    let profilesMap = new Map<string, any>()

    if (userIds.length > 0) {
      const profilesResult = await withTimeout(
  Promise.resolve(
    supabase
      .from('profiles')
      .select(`
        id,
        username,
        display_name,
        avatar_url
      `)
      .in('id', userIds)
  ),
  SUPABASE_TIMEOUT_MS,
'short_video_profiles'
)

if (profilesResult) {
  const {
    data: profilesData,
    error: profilesError,
  } = profilesResult

  if (!profilesError) {
    profilesMap = new Map(
      (profilesData ?? []).map((profile: any) => [
        profile.id,
        profile,
      ])
    )
  }
}
    }

    const mappedVideos: PostItem[] = (videosData ?? [])
      .filter((video: any) => !!video.video_url)
      .map((video: any) => {
        const profile = profilesMap.get(video.user_id)

        return {
          id: video.id,
          user_id: video.user_id,

          author:
            profile?.display_name ||
            profile?.username ||
            'Vibelink User',

          avatarUrl: profile?.avatar_url || '',

          text: video.caption || '',
          likes: 0,

          images: video.thumbnail_url ? [video.thumbnail_url] : [],

          thumbnailUrl: video.thumbnail_url || '',
          thumbnail_url: video.thumbnail_url || '',

          videoUrl: video.video_url,
          type: 'video' as const,

          aiTags: ['短影片'],
          isMine: video.user_id === user?.id,
          isLiked: false,
          isSaved: false,
        }
      })

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

    const notificationResult = await withTimeout(
      supabase
        .from('notifications')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('recipient_user_id', userId)
        .eq('is_read', false),
      SUPABASE_TIMEOUT_MS,
      'home_unread_notifications'
    )

    const count = notificationResult?.count ?? 0
    const error = notificationResult?.error ?? null

    if (error) {
      console.error('讀取未讀通知數失敗:', error)
      return
    }

    setUnreadNotificationCount(count ?? 0)
  }

  useEffect(() => {
    let notificationChannel: ReturnType<typeof supabase.channel> | null = null

    async function setupNotificationRealtime(userId: string | null) {
      if (!userId) return

      if (notificationChannel?.topic.includes(`notifications-${userId}-`)) {
        return
      }

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

    function scheduleHomeFollowupLoads(user: User, labelPrefix: string) {
      window.setTimeout(() => {
        void safeTask(
          () => loadPosts(user, FEED_SECOND_BATCH),
          `${labelPrefix}_load_posts_second`
        )
      }, 1200)

      window.setTimeout(() => {
        void safeTask(
          () => loadShortVideos(user, SHORT_VIDEO_SECOND_BATCH),
          `${labelPrefix}_load_short_videos_second`
        )
      }, 1500)

      window.setTimeout(() => {
        void safeTask(
          () => loadPosts(user, FEED_FULL_BATCH),
          `${labelPrefix}_load_posts_full`
        )
      }, 15000)
    }

    async function loadHomeForUser(user: User, labelPrefix: string) {
      logNativeLifecycle('home_feed_load_start', { labelPrefix })

      const firstLoadResults = await Promise.allSettled([
        safeTask(
          () => ensureUserProfile(),
          `${labelPrefix}_ensure_profile`
        ),
        safeTask(
          () => loadShortVideos(user, SHORT_VIDEO_FIRST_BATCH),
          `${labelPrefix}_load_short_videos_first`
        ),
        safeTask(
          () => loadPosts(user, FEED_FIRST_BATCH),
          `${labelPrefix}_load_posts_first`
        ),
        safeTask(
          () => loadUnreadNotificationCount(user?.id ?? null),
          `${labelPrefix}_unread_notifications`
        ),
      ])

      logNativeLifecycle('home_feed_load_success', {
        labelPrefix,
        settled: firstLoadResults.map((result) => result.status),
      })

      scheduleHomeFollowupLoads(user, labelPrefix)
    }

    async function initHome() {
      try {
        logNativeLifecycle('auth_session_start')
        const sessionResult = await withTimeout(
          supabase.auth.getSession(),
          AUTH_TIMEOUT_MS,
          'auth_session'
        )

        if (!sessionResult) {
          logNativeLifecycle('auth_session_timeout')
          setCurrentUserId(null)
          setIsAuthModalOpen(true)
          return
        }

        const session = sessionResult.data.session
        const user = session?.user ?? null

        logNativeLifecycle('auth_session_success', {
          hasSession: Boolean(session),
        })
        console.log('Home session:', session)

        setCurrentUserId(user?.id ?? null)
        void setupNotificationRealtime(user?.id ?? null)

        if (!session || !user) {
          setIsAuthModalOpen(true)
          return
        }

        setIsAuthModalOpen(false)
        bootstrappedHomeUserIdRef.current = user.id
        await loadHomeForUser(user, 'home')
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        logNativeLifecycle(
          message.includes('timeout')
            ? 'home_feed_load_timeout'
            : 'home_feed_load_error',
          { message }
        )
        console.error('Home init failed:', error)
        setIsAuthModalOpen(true)
      }
    }

    initHome()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Home auth state changed:', session)

        if (!session) {
          setCurrentUserId(null)
          bootstrappedHomeUserIdRef.current = null
          setIsAuthModalOpen(true)
          return
        }

        setIsAuthModalOpen(false)
        setCurrentUserId(session.user.id)
        void setupNotificationRealtime(session.user.id)

        if (bootstrappedHomeUserIdRef.current === session.user.id) {
          return
        }

        bootstrappedHomeUserIdRef.current = session.user.id
        await loadHomeForUser(session.user, 'home_auth')
      }
    )

    return () => {
      listener.subscription.unsubscribe()

      if (notificationChannel) {
        void supabase.removeChannel(notificationChannel)
      }
    }
  }, [])

  const mergedPosts = useMemo(() => {
  return buildNaturalBalancedFeed(
    realPosts,
    realVideos
  )
}, [realPosts, realVideos])

  const shortVideoPosts = useMemo(
    () => mergedPosts.filter((post) => isVideoPost(post)),
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
