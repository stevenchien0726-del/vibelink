'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react'

type UseArchivedContentParams = {
  selectedPost: any
  setSelectedPost: (post: any) => void
  setIsPostMenuOpen: (value: boolean) => void
}

export function useArchivedContent({
  selectedPost,
  setSelectedPost,
  setIsPostMenuOpen,
}: UseArchivedContentParams) {
  const [archivedPosts, setArchivedPosts] = useState<any[]>([])
  const [archivedShortVideos, setArchivedShortVideos] = useState<any[]>([])

  useEffect(() => {
    const savedPosts = localStorage.getItem(
      'vibelink_archived_posts'
    )

    if (savedPosts) {
      try {
        setArchivedPosts(JSON.parse(savedPosts))
      } catch (error) {
        console.error('霈??票?仃??', error)
      }
    }

    const savedVideos = localStorage.getItem(
      'vibelink_archived_short_videos'
    )

    if (savedVideos) {
      try {
        setArchivedShortVideos(JSON.parse(savedVideos))
      } catch (error) {
        console.error('霈??敶梁?憭望?:', error)
      }
    }
  }, [])

  function archiveSelectedPost() {
    if (!selectedPost?.id) return

    const nextArchivedPosts = [
      selectedPost,
      ...archivedPosts.filter((post) => post.id !== selectedPost.id),
    ]

    setArchivedPosts(nextArchivedPosts)

    localStorage.setItem(
      'vibelink_archived_posts',
      JSON.stringify(nextArchivedPosts)
    )

    setIsPostMenuOpen(false)

    setTimeout(() => {
      setSelectedPost(null)
    }, 180)
  }

  function unarchivePost(postId: string) {
    const nextArchivedPosts = archivedPosts.filter((post) => post.id !== postId)

    setArchivedPosts(nextArchivedPosts)

    localStorage.setItem(
      'vibelink_archived_posts',
      JSON.stringify(nextArchivedPosts)
    )
  }

  return {
    archivedPosts,
    setArchivedPosts,
    archivedShortVideos,
    setArchivedShortVideos,
    archiveSelectedPost,
    unarchivePost,
  }
}
