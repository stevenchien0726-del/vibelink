'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { delay } from './useProfileTasks'

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

        const {
          data: { session },
        } = await supabase.auth.getSession()

        const user = session?.user

        if (!alive) return

        if (!user) {
          setCurrentUserId(null)
          setProfileLoading(false)
          return
        }

        setCurrentUserId(user.id)
        bootstrappedUserIdRef.current = user.id

        void safeTask(
          () => ensureMyProfile(),
          'ensure_my_profile'
        )

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

        await delay(500)

        if (!alive) return

        void safeTask(() => loadMyPosts(), 'my_posts')

        await delay(700)

        if (!alive) return

        void safeTask(
          () => loadMyFollowerCount(),
          'followers'
        )
      } catch (error) {
        console.error('?芸楛 Profile ???仃??', error)

        if (retry < 1) {
          window.setTimeout(() => {
            init(retry + 1)
          }, 600)

          return
        }

        if (!alive) return

        setProfileError('Profile 霈?仃??')
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

        await safeTask(
          () => ensureMyProfile(),
          'auth_ensure_profile'
        )

        await delay(500)

        if (!alive) return

        void safeTask(
          () => loadMyPosts(),
          'auth_my_posts'
        )

        await delay(700)

        if (!alive) return

        void safeTask(
          () => loadMyFollowerCount(),
          'auth_followers'
        )
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
