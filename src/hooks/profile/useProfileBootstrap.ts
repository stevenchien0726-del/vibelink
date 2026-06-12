'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  AUTH_TIMEOUT_MS,
  logNativeLifecycle,
  withTimeout,
} from '@/lib/asyncTimeout'

type UseProfileBootstrapParams = {
  ensureMyProfile: () => Promise<void>
  loadMyShortVideos: () => Promise<void>
  myShortVideos: any[]
  setProfileWarmVideoUrls: (urls: string[]) => void
  lazyLoadSavedPosts: () => Promise<void>
  savedPosts: any[]
  setProfileWarmSavedImages: (images: string[]) => void
  loadMyPosts: () => Promise<void>
  loadMyFollowerCount: () => Promise<void>
  safeTask: <T>(task: () => PromiseLike<T>, label: string) => Promise<T | null>
}

export function useProfileBootstrap({
  ensureMyProfile,
  loadMyShortVideos,
  myShortVideos,
  setProfileWarmVideoUrls,
  lazyLoadSavedPosts,
  savedPosts,
  setProfileWarmSavedImages,
  loadMyPosts,
  loadMyFollowerCount,
  safeTask,
}: UseProfileBootstrapParams) {
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const bootstrappedUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    let alive = true
    const loadingGuardId = window.setTimeout(() => {
      if (!alive) return

      setProfileLoading(false)
    }, 3500)

    async function init(retry = 0) {
      try {
        setProfileLoading(true)
        setProfileError('')

        logNativeLifecycle('auth_session_start')

        const {
          data: { session },
        } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_TIMEOUT_MS,
          'auth_session'
        )

        logNativeLifecycle('auth_session_success', {
          hasSession: Boolean(session),
        })

        const user = session?.user

        if (!alive) return

        if (!user) {
          setCurrentUserId(null)
          setProfileLoading(false)
          return
        }

        setCurrentUserId(user.id)
        bootstrappedUserIdRef.current = user.id

        const firstLoadResults = await Promise.allSettled([
          safeTask(
            () => ensureMyProfile(),
            'auth_ensure_profile'
          ),
          safeTask(() => loadMyPosts(), 'my_posts'),
          safeTask(
            () => loadMyFollowerCount(),
            'followers'
          ),
        ])

        logNativeLifecycle('profile_load_success', {
          settled: firstLoadResults.map((result) => result.status),
        })

        if (alive) {
          setProfileLoading(false)
        }

        window.setTimeout(async () => {
          try {
            await loadMyShortVideos()

            const topVideos =
              (myShortVideos ?? [])
                .map((video: any) => video.video_url)
                .filter(Boolean)
                .slice(0, 4)

            setProfileWarmVideoUrls(topVideos)
          } catch (err) {
            console.warn('profile short video warmup failed', err)
          }
        }, 1200)

        window.setTimeout(async () => {
          try {
            await lazyLoadSavedPosts()

            const images =
              (savedPosts ?? [])
                .flatMap((post: any) =>
                  post.post_images?.map((img: any) => img.image_url) ?? []
                )
                .filter(Boolean)
                .slice(0, 12)

            setProfileWarmSavedImages(images)
          } catch (err) {
            console.warn('profile saved warmup failed', err)
          }
        }, 2000)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        logNativeLifecycle(
          message.includes('timeout')
            ? 'auth_session_timeout'
            : 'profile_load_error',
          { message }
        )
        console.error('Profile bootstrap failed:', error)

        if (retry < 1) {
          window.setTimeout(() => {
            init(retry + 1)
          }, 600)

          return
        }

        if (!alive) return

        setProfileError('Profile 載入失敗')
        setProfileLoading(false)
      }
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user

      if (!user) {
        setCurrentUserId(null)
        bootstrappedUserIdRef.current = null
        return
      }

      if (bootstrappedUserIdRef.current === user.id) {
        return
      }

      setCurrentUserId(user.id)
      bootstrappedUserIdRef.current = user.id

      window.setTimeout(async () => {
        if (!alive) return

        await Promise.allSettled([
          safeTask(
            () => ensureMyProfile(),
            'auth_ensure_profile'
          ),
          safeTask(
            () => loadMyPosts(),
            'auth_my_posts'
          ),
          safeTask(
            () => loadMyFollowerCount(),
            'auth_followers'
          ),
        ])
      }, 300)
    })

  return () => {
    alive = false
    window.clearTimeout(loadingGuardId)
    subscription.unsubscribe()
  }
  }, [])

  return {
    profileLoading,
    setProfileLoading,
    profileError,
    setProfileError,
    currentUserId,
    setCurrentUserId,
  }
}
