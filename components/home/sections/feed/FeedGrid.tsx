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

export type FeedMode = '1x1' | '2x2'

export type PostItem = {
  id: string
  author: string
  text: string
  likes: number
  images: string[]
  aiTags: string[]
  isMine?: boolean
  isLiked?: boolean
}

type FeedGridProps = {
  posts?: PostItem[]
  feedMode?: FeedMode
  setFeedMode?: (mode: FeedMode) => void
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'

const LIKE_COLOR = '#c86cff'

export default function FeedGrid({
  posts = [],
  feedMode = '1x1',
}: FeedGridProps) {
  const [slideMap, setSlideMap] = useState<Record<string, number>>({})
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null)
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({})
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({})
  const [bigHeartPostId, setBigHeartPostId] = useState<string | null>(null)

  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const isHorizontalGestureRef = useRef(false)
  const activeTouchPostIdRef = useRef<string | null>(null)

  useEffect(() => {
    setSlideMap({})
    setOpenMenuPostId(null)
  }, [feedMode])

  useEffect(() => {
  const nextCounts: Record<string, number> = {}
  const nextLiked: Record<string, boolean> = {}

  posts.forEach((post) => {
    nextCounts[post.id] = post.likes ?? 0
    nextLiked[post.id] = !!post.isLiked
  })

  setLikeCountMap(nextCounts)
  setLikedMap(nextLiked)
}, [posts])

  const getPostImages = (post: PostItem) => {
    return post.images && post.images.length > 0 ? post.images : [FALLBACK_IMAGE]
  }

  const getPostTags = (post: PostItem) => {
    return post.aiTags && post.aiTags.length > 0
      ? post.aiTags
      : ['自然感', '療癒', '戶外']
  }

  const getCurrentSlide = (postId: string) => {
    return slideMap[postId] ?? 0
  }

  const getLikeCount = (post: PostItem) => {
    return likeCountMap[post.id] ?? post.likes ?? 0
  }

  async function toggleLike(postId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const isLiked = !!likedMap[postId]

  setLikedMap((prev) => ({
    ...prev,
    [postId]: !isLiked,
  }))

  setLikeCountMap((prev) => ({
    ...prev,
    [postId]: Math.max(0, (prev[postId] ?? 0) + (isLiked ? -1 : 1)),
  }))

  if (isLiked) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)

    if (error) {
      console.error('取消 like 失敗:', error)
    }

    return
  }

  const { error } = await supabase.from('likes').insert({
    post_id: postId,
    user_id: user.id,
  })

  if (error) {
    console.error('新增 like 失敗:', error)
  }
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
    postId: string,
    imageLength: number
  ) {
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

  if (feedMode === '1x1') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="feed-1x1"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="flex flex-col gap-10"
        >
          {posts.map((post) => {
            const postImages = getPostImages(post)
            const postTags = getPostTags(post)
            const currentSlide = getCurrentSlide(post.id)
            const isLiked = !!likedMap[post.id]
            const likeCount = getLikeCount(post)

            return (
              <motion.div layout key={post.id}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-[34px] w-[34px] rounded-full bg-[#d6d6d6]" />
                    <div className="text-[15px] font-medium text-[#222]">
                      {post.author}
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuPostId((prev) =>
                          prev === post.id ? null : post.id
                        )
                      }
                      className="flex h-[38px] items-center gap-2 rounded-full bg-[#e3e3e3] px-4 text-[#222] transition active:scale-[0.96]"
                    >
                      <MoreHorizontal size={17} strokeWidth={2.3} />
                      <span className="text-[14px] font-medium tracking-[0.2px]">
                        MENU
                      </span>
                    </button>

                    <AnimatePresence>
                      {openMenuPostId === post.id && (
                        <WideMenuSheet
                          variant={post.isMine ? 'mine' : 'other'}
                          onClose={() => setOpenMenuPostId(null)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="relative">
                  <div
                    className="relative isolate overflow-hidden rounded-[18px]"
                    
                    data-horizontal-scroll="true"
                    onDoubleClick={() => {
  if (!likedMap[post.id]) {
  toggleLike(post.id)
}
  setBigHeartPostId(post.id)

  setTimeout(() => {
    setBigHeartPostId(null)
  }, 700)
}}
                    onTouchStartCapture={(e) =>
                      handleCarouselTouchStart(e, post.id)
                    }
                    onTouchMoveCapture={handleCarouselTouchMove}
                    onTouchEndCapture={(e) =>
                      handleCarouselTouchEnd(e, post.id, postImages.length)
                    }
                    style={{ touchAction: 'pan-y' }}
                  >
                    <motion.div
                      className="flex"
                      animate={{ x: `-${currentSlide * 100}%` }}
                      transition={{
                        type: 'spring',
                        stiffness: 360,
                        damping: 34,
                      }}
                    >
                      {postImages.map((image, index) => (
                        <div
                          key={`${post.id}-${index}`}
                          className="relative h-[446px] w-full shrink-0 grow-0 basis-full select-none bg-[#dddddd]"
                        >
                          <img
                            src={image}
                            alt={`${post.author} ${index + 1}`}
                            className="pointer-events-none h-full w-full object-cover"
                            draggable={false}
                          />

                          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/8" />

                          <div className="absolute right-4 top-4 rounded-full bg-black/10 px-3 py-1 text-[14px] text-[#555] backdrop-blur-sm">
                            {index + 1}/{postImages.length}
                          </div>
                        </div>
                      ))}
                    </motion.div>

                    <AnimatePresence>
  {bigHeartPostId === post.id && (
    <motion.div
  initial={{ scale: 0.6, opacity: 0 }}
  animate={{
    scale: [0.6, 1.5, 1.2],
    opacity: [0, 1, 0],
  }}
  transition={{
    duration: 0.6,
    ease: 'easeOut',
  }}
      className="pointer-events-none absolute inset-0 z-[80] flex items-center justify-center"
    >
      <Heart
        size={90}
        color={LIKE_COLOR}
        fill={LIKE_COLOR}
        strokeWidth={2}
      />
    </motion.div>
  )}
</AnimatePresence>
                  </div>

                  {postImages.length > 1 && (
  <div className="absolute -bottom-[18px] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2">
    {postImages.map((_, index) => (
      <button
        key={`${post.id}-dot-${index}`}
        type="button"
        onClick={() => goToSlide(post.id, index, postImages.length)}
        aria-label={`Go to slide ${index + 1}`}
        className="flex h-[10px] items-center justify-center p-0"
      >
        <span
          className={`block h-[7px] w-[7px] rounded-full transition-all duration-250 ${
            currentSlide === index ? 'bg-[#c86cff]' : 'bg-[#d8b4f8]'
          }`}
        />
      </button>
    ))}
  </div>
)}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-6">
                    <button
                      type="button"
                      onClick={() => toggleLike(post.id)}
                      className="flex items-center gap-1.5 text-[16px] text-[#555] transition active:scale-95"
                    >
                      <Heart
                        size={22}
                        color={LIKE_COLOR}
                        fill={isLiked ? LIKE_COLOR : 'none'}
                        strokeWidth={2.2}
                      />
                      <span>{likeCount}</span>
                    </button>

                    <button
                      type="button"
                      className="flex items-center text-[#222] transition active:scale-95"
                    >
                      <MessageCircle size={22} />
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    <button
                      type="button"
                      className="flex items-center text-[#222] transition active:scale-95"
                    >
                      <Send size={22} strokeWidth={2.1} />
                    </button>

                    <button
                      type="button"
                      className="flex items-center text-[#222] transition active:scale-95"
                    >
                      <Bookmark size={22} strokeWidth={2.1} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-[16px] text-[#444]">
                  {post.text}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-semibold text-[#666]">
                    AI標籤
                  </span>

                  {postTags.slice(0, 3).map((tag) => (
                    <span
                      key={`${post.id}-${tag}`}
                      className="rounded-full bg-[#eeeeee] px-3 py-[7px] text-[12px] font-medium text-[#666] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>
    )
  }

  if (feedMode === '2x2') {
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
          {posts.slice(0, 6).map((post) => {
            const image = getPostImages(post)[0]

            return (
              <motion.div
                layout
                key={post.id}
                className="relative h-[280px] w-full overflow-hidden rounded-[20px] bg-[#dddddd]"
              >
                <img
                  src={image}
                  alt={post.author}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>
    )
  }

  return null
}