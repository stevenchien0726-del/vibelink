'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useMyShortVideos() {
  const [myShortVideos, setMyShortVideos] = useState<any[]>([])
  const [selectedShortVideoId, setSelectedShortVideoId] = useState<string | undefined>()
  const [isShortVideoPageOpen, setIsShortVideoPageOpen] = useState(false)
  const [profileWarmVideoUrls, setProfileWarmVideoUrls] = useState<string[]>([])
  const isLoadingShortVideosRef = useRef(false)

  async function loadMyShortVideos() {
    if (isLoadingShortVideosRef.current) return

    isLoadingShortVideosRef.current = true

    try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('short_videos')
      .select(`
      id,
      caption,
      video_url,
      created_at,
      user_id
    `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('霈???敶梁?憭望?:', error)
      throw error
    }

    const videoIds = (data ?? []).map((video: any) => video.id)

    const { data: likeRows } =
      videoIds.length > 0
        ? await supabase
            .from('short_video_likes')
            .select('short_video_id, user_id')
            .in('short_video_id', videoIds)
        : { data: [] }

    const { data: savedRows } =
      videoIds.length > 0
        ? await supabase
            .from('saved_short_videos')
            .select('short_video_id, user_id')
            .in('short_video_id', videoIds)
        : { data: [] }

    const likeCountMap = new Map<string, number>()
    const likedSet = new Set<string>()
    const savedSet = new Set<string>()

    ;(likeRows ?? []).forEach((like: any) => {
      likeCountMap.set(
        like.short_video_id,
        (likeCountMap.get(like.short_video_id) ?? 0) + 1
      )

      if (like.user_id === user.id) {
        likedSet.add(like.short_video_id)
      }
    })

    ;(savedRows ?? []).forEach((saved: any) => {
      if (saved.user_id === user.id) {
        savedSet.add(saved.short_video_id)
      }
    })

    setMyShortVideos(
      (data ?? []).map((video: any) => ({
        ...video,
        likes: likeCountMap.get(video.id) ?? 0,
        isLiked: likedSet.has(video.id),
        isSaved: savedSet.has(video.id),
      }))
    )
    } finally {
      isLoadingShortVideosRef.current = false
    }
  }

  return {
    myShortVideos,
    setMyShortVideos,
    selectedShortVideoId,
    setSelectedShortVideoId,
    isShortVideoPageOpen,
    setIsShortVideoPageOpen,
    profileWarmVideoUrls,
    setProfileWarmVideoUrls,
    loadMyShortVideos,
  }
}
