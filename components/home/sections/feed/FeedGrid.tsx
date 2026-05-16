'use client'

import WideMenuSheet from '@/components/WideMenuSheet'
import { useEffect, useRef, useState } from 'react'
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Bookmark,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { supabase } from '@/lib/supabase'

export type PostItem = {
  id: string
  author: string
  text: string
  likes: number
  images: string[]
  videoUrl?: string
  aiTags: string[]
  isMine?: boolean
  isLiked?: boolean
isSaved?: boolean
user_id?: string
type?: 'post' | 'video'
isMock?: boolean
}

type FeedGridProps = {
  posts?: PostItem[]
  onOpenPost?: (post: PostItem) => void
  onOpenComments?: (post: PostItem) => void
onOpenShare?: (post: PostItem) => void
onDeletePost?: (post: PostItem) => void
onOpenProfile?: (post: PostItem) => void
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'

const LIKE_COLOR = '#c86cff'

export default function FeedGrid({
  posts = [],
  onOpenPost,
  onOpenComments,
  onOpenShare,
  onDeletePost,
  onOpenProfile,
}: FeedGridProps) {
  const [slideMap, setSlideMap] = useState<Record<string, number>>({})
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null)
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({})
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({})
  const [bigHeartPostId, setBigHeartPostId] = useState<string | null>(null)

  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({})

  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const isHorizontalGestureRef = useRef(false)
  const activeTouchPostIdRef = useRef<string | null>(null)

  const lastTapPostIdRef = useRef<string | null>(null)
const lastTapTimeRef = useRef(0)


  useEffect(() => {
  const nextCounts: Record<string, number> = {}
const nextLiked: Record<string, boolean> = {}
const nextSaved: Record<string, boolean> = {}

  posts.forEach((post) => {
    nextCounts[post.id] = post.likes ?? 0
    nextLiked[post.id] = !!post.isLiked
    nextSaved[post.id] = !!post.isSaved
  })

  setLikeCountMap(nextCounts)
  setLikedMap(nextLiked)
  setSavedMap(nextSaved)
}, [posts])

  const getPostImages = (post: PostItem) => {
    return post.images && post.images.length > 0 ? post.images : [FALLBACK_IMAGE]
  }

  const getCurrentSlide = (postId: string) => {
    return slideMap[postId] ?? 0
  }

  const getLikeCount = (post: PostItem) => {
    return likeCountMap[post.id] ?? post.likes ?? 0
  }

  async function toggleLike(post: PostItem) {
  const isLiked = !!likedMap[post.id]
  const nextLiked = !isLiked

  setLikedMap((prev) => ({
    ...prev,
    [post.id]: nextLiked,
  }))

  setLikeCountMap((prev) => ({
    ...prev,
    [post.id]: Math.max(
      0,
      (prev[post.id] ?? post.likes ?? 0) + (nextLiked ? 1 : -1)
    ),
  }))

  // fake post 不打 Supabase
  if (post.isMock) return

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const isVideo = post.videoUrl || post.type === 'video'

  if (isLiked) {
    const { error } = await supabase
      .from(isVideo ? 'short_video_likes' : 'likes')
      .delete()
      .eq(isVideo ? 'short_video_id' : 'post_id', post.id)
      .eq('user_id', user.id)

    if (error) console.error('取消 like 失敗:', error)
    return
  }

  const { error } = await supabase
    .from(isVideo ? 'short_video_likes' : 'likes')
    .insert({
      [isVideo ? 'short_video_id' : 'post_id']: post.id,
      user_id: user.id,
    })

  if (error) console.error('新增 like 失敗:', error)
}

async function toggleSave(post: PostItem) {
  const isSaved = !!savedMap[post.id]
  const nextSaved = !isSaved

  setSavedMap((prev) => ({
    ...prev,
    [post.id]: nextSaved,
  }))

  if (post.isMock) {
    const saved = JSON.parse(
      localStorage.getItem('vibelink_mock_saved_posts') || '[]'
    )

    const nextSavedIds = nextSaved
      ? [...new Set([...saved, post.id])]
      : saved.filter((id: string) => id !== post.id)

    localStorage.setItem(
      'vibelink_mock_saved_posts',
      JSON.stringify(nextSavedIds)
    )

    return
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const isVideo = post.videoUrl || post.type === 'video'

  if (isSaved) {
    const { error } = await supabase
      .from(isVideo ? 'saved_short_videos' : 'saved_posts')
      .delete()
      .eq(isVideo ? 'short_video_id' : 'post_id', post.id)
      .eq('user_id', user.id)

    if (error) console.error('取消收藏失敗:', error)
    return
  }

  const { error } = await supabase
    .from(isVideo ? 'saved_short_videos' : 'saved_posts')
    .insert({
      [isVideo ? 'short_video_id' : 'post_id']: post.id,
      user_id: user.id,
    })

  if (error) console.error('新增收藏失敗:', error)
}

  const goToSlide = (postId: string, nextIndex: number, imageLength: number) => {
    const safeIndex = Math.max(0, Math.min(nextIndex, imageLength - 1))
    setSlideMap((prev) => ({
      ...prev,
      [postId]: safeIndex,
    }))
  }

  function handleCarouselTouchStart(
    e: React.TouchEvent<HTMLDivElement>,
    postId: string
  ) {
    const touch = e.touches[0]
    touchStartXRef.current = touch.clientX
    touchStartYRef.current = touch.clientY
    isHorizontalGestureRef.current = false
    activeTouchPostIdRef.current = postId
  }

  function handleCarouselTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const startX = touchStartXRef.current
    const startY = touchStartYRef.current
    if (startX == null || startY == null) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (!isHorizontalGestureRef.current) {
      const passedHorizontalGate = absX > 10 && absX > absY * 1.15
      if (passedHorizontalGate) {
        isHorizontalGestureRef.current = true
      }
    }

    if (isHorizontalGestureRef.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  function handleCarouselTouchEnd(
  e: React.TouchEvent<HTMLDivElement>,
  post: PostItem,
  imageLength: number
) {
  const postId = post.id
    const startX = touchStartXRef.current
    const startY = touchStartYRef.current

    if (startX == null || startY == null) {
      touchStartXRef.current = null
      touchStartYRef.current = null
      isHorizontalGestureRef.current = false
      activeTouchPostIdRef.current = null
      return
    }

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    const shouldSlide = absX > 36 && absX > absY * 1.1
    const currentSlide = getCurrentSlide(postId)

    const isTap = absX < 12 && absY < 12
const now = Date.now()

if (isTap) {
  if (
    lastTapPostIdRef.current === postId &&
    now - lastTapTimeRef.current < 280
  ) {
    if (!likedMap[postId]) {
      toggleLike(post)
    }

    setBigHeartPostId(postId)

    setTimeout(() => {
      setBigHeartPostId(null)
    }, 700)

    lastTapPostIdRef.current = null
    lastTapTimeRef.current = 0
  } else {
    lastTapPostIdRef.current = postId
    lastTapTimeRef.current = now
  }
}

    if (shouldSlide) {
      if (deltaX < 0) {
        goToSlide(postId, currentSlide + 1, imageLength)
      } else {
        goToSlide(postId, currentSlide - 1, imageLength)
      }
    }

    touchStartXRef.current = null
    touchStartYRef.current = null
    isHorizontalGestureRef.current = false
    activeTouchPostIdRef.current = null
  }

  if (!posts || posts.length === 0) return null
  
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="feed-2x2"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="grid grid-cols-2 gap-2"
        >
          {posts.map((post) => {
  const image = getPostImages(post)[0]

  return (
    <motion.button
      type="button"
      layout
      key={post.id}
      onClick={() => onOpenPost?.(post)}
      className="relative h-[280px] w-full overflow-hidden rounded-[20px] bg-[#dddddd]"
    >
      {post.videoUrl ? (
        <video
  src={post.videoUrl}
  muted
  playsInline
  preload="auto"
  autoPlay
  loop
  className="h-full w-full object-cover bg-black"
  onLoadedData={(e) => {
    e.currentTarget.currentTime = 0.1
  }}
/>
      ) : (
        <img
          src={image}
          alt={post.author}
          className="h-full w-full object-cover"
          draggable={false}
        />
      )}
    </motion.button>
  )
})}
        </motion.div>
      </AnimatePresence>
    )
  }
