'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  AUTH_TIMEOUT_MS,
  SUPABASE_TIMEOUT_MS,
  withTimeout,
} from '@/lib/asyncTimeout'

type UseSavedPostsParams = {
  safeTask: <T>(task: () => PromiseLike<T>, label: string) => Promise<T | null>
}

export function useSavedPosts({ safeTask }: UseSavedPostsParams) {
  const [savedPosts, setSavedPosts] = useState<any[]>([])

  const [profileWarmSavedImages, setProfileWarmSavedImages] = useState<string[]>([])

  const [hasLoadedSavedPosts, setHasLoadedSavedPosts] = useState(false)
  const [isLoadingSavedPosts, setIsLoadingSavedPosts] = useState(false)
  const isLoadingSavedPostsRef = useRef(false)

  async function loadSavedPosts() {
    if (isLoadingSavedPostsRef.current) return

    isLoadingSavedPostsRef.current = true

    try {
    const {
      data: { user },
    } = await withTimeout(
      supabase.auth.getUser(),
      AUTH_TIMEOUT_MS,
      'profile_saved_auth_user'
    )

    if (!user) return

    const [photoResult, videoResult] = await Promise.allSettled([
      withTimeout(
        supabase
          .from('saved_posts')
          .select(`
      post_id,
      posts (
        id,
        caption,
        post_images (
          image_url
        )
      )
    `)
          .eq('user_id', user.id),
        SUPABASE_TIMEOUT_MS,
        'profile_saved_posts'
      ),
      withTimeout(
        supabase
          .from('saved_short_videos')
          .select(`
      short_video_id,
      short_videos (
        id,
        caption,
        video_url,
        created_at,
        user_id
      )
    `)
          .eq('user_id', user.id),
        SUPABASE_TIMEOUT_MS,
        'profile_saved_videos'
      ),
    ])

    const photoSavedRows =
      photoResult.status === 'fulfilled' ? photoResult.value.data : []
    const videoSavedRows =
      videoResult.status === 'fulfilled' ? videoResult.value.data : []

    if (photoResult.status === 'fulfilled' && photoResult.value.error) {
      console.error('Saved photo posts failed:', photoResult.value.error)
    }

    if (videoResult.status === 'fulfilled' && videoResult.value.error) {
      console.error('Saved short videos failed:', videoResult.value.error)
    }

    if (photoResult.status === 'rejected') {
      console.warn('Saved photo posts timed out/failed:', photoResult.reason)
    }

    if (videoResult.status === 'rejected') {
      console.warn('Saved short videos timed out/failed:', videoResult.reason)
    }

    const photoPosts = (photoSavedRows ?? [])
      .map((item: any) => item.posts)
      .filter(Boolean)
      .map((post: any) => ({
        ...post,
        type: 'post',
      }))

    const videoPosts = (videoSavedRows ?? [])
      .map((item: any) => item.short_videos)
      .filter(Boolean)
      .map((video: any) => ({
        id: video.id,
        caption: video.caption,
        video_url: video.video_url,
        created_at: video.created_at,
        user_id: video.user_id,
        type: 'video',
      }))

    setSavedPosts([
      ...videoPosts,
      ...photoPosts,
    ])
    } finally {
      isLoadingSavedPostsRef.current = false
    }
  }

  async function lazyLoadSavedPosts() {
    if (hasLoadedSavedPosts || isLoadingSavedPosts || isLoadingSavedPostsRef.current) return

    setIsLoadingSavedPosts(true)

    try {
      await safeTask(() => loadSavedPosts(), 'lazy_saved_posts')
      setHasLoadedSavedPosts(true)
    } finally {
      setIsLoadingSavedPosts(false)
    }
  }

  return {
    savedPosts,
    setSavedPosts,
    profileWarmSavedImages,
    setProfileWarmSavedImages,
    hasLoadedSavedPosts,
    setHasLoadedSavedPosts,
    isLoadingSavedPosts,
    setIsLoadingSavedPosts,
    loadSavedPosts,
    lazyLoadSavedPosts,
  }
}
