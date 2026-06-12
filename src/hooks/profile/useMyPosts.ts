'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  AUTH_TIMEOUT_MS,
  SUPABASE_TIMEOUT_MS,
  withTimeout,
} from '@/lib/asyncTimeout'

type UseMyPostsParams = {
  activeTab: number
  archivedPosts: any[]
  safeTask: <T>(task: () => PromiseLike<T>, label: string) => Promise<T | null>
}

export function useMyPosts({
  activeTab,
  archivedPosts,
  safeTask,
}: UseMyPostsParams) {
  const [myPosts, setMyPosts] = useState<any[]>([])

  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const loadMorePostsRef = useRef<HTMLDivElement | null>(null)
  const isLoadingPostsRef = useRef(false)

  const gridItems = [...myPosts]
    .filter(
      (post) =>
        post.post_images?.length > 0 &&
        !archivedPosts.some((archived) => archived.id === post.id)
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      const aTime = new Date(
        a.pinned_at || a.created_at || 0
      ).getTime()

      const bTime = new Date(
        b.pinned_at || b.created_at || 0
      ).getTime()

      return bTime - aTime
    })

  async function loadMyPosts(start = 0, end = 11, append = false) {
    if (isLoadingPostsRef.current) return

    isLoadingPostsRef.current = true

    try {
    const {
      data: { user },
      error: userError,
    } = await withTimeout(
      supabase.auth.getUser(),
      AUTH_TIMEOUT_MS,
      'profile_posts_auth_user'
    )

    if (userError || !user) {
      console.error('撠?餃')
      return
    }

    const { data, error } = await withTimeout(
      supabase
        .from('posts')
        .select(`
  id,
  caption,
  created_at,
  user_id,
  is_pinned,
  pinned_at,
  reply_permission,
  post_images (
    image_url
  )
`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(start, end),
      SUPABASE_TIMEOUT_MS,
      'profile_posts_load'
    )

    if (error) {
      console.error('霈???票?仃??', error)
      throw error
    }

    const postIds = (data ?? []).map((post: any) => post.id)

    if (postIds.length === 0) {
      setMyPosts([])
      setHasMorePosts(false)
      return
    }

    const { data: likeRows } =
      postIds.length > 0
        ? await withTimeout(
            supabase
              .from('likes')
              .select('post_id, user_id')
              .in('post_id', postIds),
            SUPABASE_TIMEOUT_MS,
            'profile_posts_likes'
          )
        : { data: [] }

    const likeCountMap = new Map<string, number>()
    const likedSet = new Set<string>()

    ;(likeRows ?? []).forEach((like: any) => {
      likeCountMap.set(
        like.post_id,
        (likeCountMap.get(like.post_id) ?? 0) + 1
      )

      if (like.user_id === user.id) {
        likedSet.add(like.post_id)
      }
    })

    const postsWithLikes = (data ?? []).map((post: any) => ({
      ...post,
      likes: likeCountMap.get(post.id) ?? 0,
      isLiked: likedSet.has(post.id),
      isPinned: post.is_pinned,
      pinned_at: post.pinned_at,
      reply_permission:
        post.reply_permission || 'everyone',
    }))

    setMyPosts((prev) =>
      append ? [...prev, ...postsWithLikes] : postsWithLikes
    )

    setHasMorePosts((data ?? []).length === end - start + 1)
    } finally {
      isLoadingPostsRef.current = false
    }
  }

  async function loadMoreMyPosts() {
    if (isLoadingMorePosts || !hasMorePosts) return

    setIsLoadingMorePosts(true)

    try {
      const start = myPosts.length
      const end = start + 11

      await safeTask(
        () => loadMyPosts(start, end, true),
        'load_more_my_posts'
      )
    } finally {
      setIsLoadingMorePosts(false)
    }
  }

  useEffect(() => {
    if (activeTab !== 0) return
    if (myPosts.length === 0) return
    if (!hasMorePosts || isLoadingMorePosts) return

    const node = loadMorePostsRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]

        if (entry.isIntersecting) {
          void loadMoreMyPosts()
        }
      },
      {
        root: null,
        rootMargin: '300px',
        threshold: 0.1,
      }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [activeTab, myPosts.length, hasMorePosts, isLoadingMorePosts])

  return {
    myPosts,
    setMyPosts,
    gridItems,
    isLoadingMorePosts,
    setIsLoadingMorePosts,
    hasMorePosts,
    setHasMorePosts,
    loadMorePostsRef,
    loadMyPosts,
    loadMoreMyPosts,
  }
}
