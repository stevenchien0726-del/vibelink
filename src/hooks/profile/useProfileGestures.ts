'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from 'react'

type UseProfileGesturesParams = {
  activeTab: number
  setActiveTab: (value: number) => void
  selectedPost: any
  setSelectedPost: (post: any) => void
  setIsPostMenuOpen: (value: boolean) => void
  setSelectedPostImageIndex: React.Dispatch<React.SetStateAction<number>>
  toggleSelectedPostLike: () => void
  loadMyShortVideos: () => Promise<void>
  lazyLoadSavedPosts: () => Promise<void>
  safeTask: <T>(task: () => PromiseLike<T>, label: string) => Promise<T | null>
}

export function useProfileGestures({
  activeTab,
  setActiveTab,
  selectedPost,
  setSelectedPost,
  setIsPostMenuOpen,
  setSelectedPostImageIndex,
  toggleSelectedPostLike,
  loadMyShortVideos,
  lazyLoadSavedPosts,
  safeTask,
}: UseProfileGesturesParams) {
  const [tabDragX, setTabDragX] = useState(0)

  const tabTouchStartX = useRef<number | null>(null)
  const tabTouchDeltaX = useRef(0)

  const postImageTouchStartX = useRef<number | null>(null)
  const postImageTouchDeltaX = useRef(0)
  const postImageLastTapTimeRef = useRef(0)

  const postDetailTouchStartX = useRef<number | null>(null)
  const postDetailTouchStartY = useRef<number | null>(null)

  function handlePostDetailTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    e.stopPropagation()

    const target = e.target as HTMLElement

    if (target.closest('[data-post-image-area="true"]')) {
      postDetailTouchStartX.current = null
      postDetailTouchStartY.current = null
      return
    }

    const touch = e.touches[0]
    postDetailTouchStartX.current = touch.clientX
    postDetailTouchStartY.current = touch.clientY
  }

  function handlePostDetailTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    e.stopPropagation()
  }

  function handlePostDetailTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    e.stopPropagation()

    const startX = postDetailTouchStartX.current
    const startY = postDetailTouchStartY.current

    if (startX == null || startY == null) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    if (Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY)) {
      setIsPostMenuOpen(false)
      setSelectedPost(null)
    }

    postDetailTouchStartX.current = null
    postDetailTouchStartY.current = null
  }

  function handlePostImageTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    e.stopPropagation()

    const touch = e.touches[0]
    postImageTouchStartX.current = touch.clientX
    postImageTouchDeltaX.current = 0
  }

  function handlePostImageTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    e.stopPropagation()

    if (postImageTouchStartX.current == null) return

    const touch = e.touches[0]
    postImageTouchDeltaX.current = touch.clientX - postImageTouchStartX.current
  }

  function handlePostImageTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    e.stopPropagation()

    const deltaX = postImageTouchDeltaX.current
    const total = selectedPost?.post_images?.length || 0

    const absX = Math.abs(deltaX)
    const now = Date.now()

    if (absX < 12) {
      if (now - postImageLastTapTimeRef.current < 280) {
        toggleSelectedPostLike()
        postImageLastTapTimeRef.current = 0
      } else {
        postImageLastTapTimeRef.current = now
      }
    }

    if (absX > 50 && total > 1) {
      if (deltaX < 0) {
        setSelectedPostImageIndex((prev) => Math.min(prev + 1, total - 1))
      } else {
        setSelectedPostImageIndex((prev) => Math.max(prev - 1, 0))
      }
    }

    postImageTouchStartX.current = null
    postImageTouchDeltaX.current = 0
  }

  function goToTab(index: number) {
    if (index < 0 || index > 2) return

    setActiveTab(index)

    if (index === 1) {
      void safeTask(() => loadMyShortVideos(), 'lazy_my_short_videos')
    }

    if (index === 2) {
      void lazyLoadSavedPosts()
    }
  }

  function handleTabTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0]
    tabTouchStartX.current = touch.clientX
    tabTouchDeltaX.current = 0
  }

  function handleTabTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (tabTouchStartX.current == null) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - tabTouchStartX.current

    tabTouchDeltaX.current = deltaX

    if (
      (activeTab === 0 && deltaX > 0) ||
      (activeTab === 2 && deltaX < 0)
    ) {
      setTabDragX(deltaX * 0.25)
    } else {
      setTabDragX(deltaX)
    }

    if (Math.abs(deltaX) > 8) {
      e.stopPropagation()
    }
  }

  function handleTabTouchEnd() {
    const deltaX = tabTouchDeltaX.current

    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        goToTab(activeTab + 1)
      } else {
        goToTab(activeTab - 1)
      }
    }

    setTabDragX(0)

    tabTouchStartX.current = null
    tabTouchDeltaX.current = 0
  }

  return {
    tabDragX,
    setTabDragX,
    goToTab,
    handleTabTouchStart,
    handleTabTouchMove,
    handleTabTouchEnd,
    handlePostImageTouchStart,
    handlePostImageTouchMove,
    handlePostImageTouchEnd,
    handlePostDetailTouchStart,
    handlePostDetailTouchMove,
    handlePostDetailTouchEnd,
  }
}
