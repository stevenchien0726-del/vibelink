'use client'

import WideMenuSheet from '@/components/WideMenuSheet'
import { useEffect, useRef, useState } from 'react'
import {
  Heart,
  MessageCircle,
  Mail,
  MoreHorizontal,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export type FeedMode = '1x1' | '2x2' | '3x3'

export type PostItem = {
  id: string
  author: string
  text: string
  likes: number
  images: string[]
  aiTags: string[]
}

type FeedGridProps = {
  posts?: PostItem[]
  feedMode?: FeedMode
  setFeedMode?: (mode: FeedMode) => void
}

export default function FeedGrid({
  posts = [],
  feedMode = '1x1',
}: FeedGridProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)

  const gestureStartRef = useRef<{ x: number; y: number } | null>(null)
  const isHorizontalGestureRef = useRef(false)

  const firstPost = posts[0]

  const postImages =
    firstPost?.images && firstPost.images.length > 0
      ? firstPost.images
      : ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80']

  useEffect(() => {
    setCurrentSlide(0)
  }, [firstPost?.id, feedMode])

  const goToSlide = (index: number) => {
    const safeIndex = Math.max(0, Math.min(index, postImages.length - 1))
    setCurrentSlide(safeIndex)
  }

  function handleTouchStartCapture(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0]
    gestureStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    }
    isHorizontalGestureRef.current = false
  }

  function handleTouchMoveCapture(e: React.TouchEvent<HTMLDivElement>) {
    if (!gestureStartRef.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - gestureStartRef.current.x
    const deltaY = touch.clientY - gestureStartRef.current.y

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    // 一旦確認是水平手勢，就阻止它冒泡到外層 page swipe
    if (absX > absY && absX > 6) {
      isHorizontalGestureRef.current = true
      e.stopPropagation()
    }
  }

  function handleTouchEndCapture() {
    gestureStartRef.current = null
    isHorizontalGestureRef.current = false
  }

  if (feedMode === '1x1') {
    if (!firstPost) return null

    const postTags =
      firstPost.aiTags && firstPost.aiTags.length > 0
        ? firstPost.aiTags
        : ['自然感', '療癒', '戶外']

    return (
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-[34px] w-[34px] rounded-full bg-[#d6d6d6]" />
            <div className="text-[15px] font-medium text-[#222]">
              {firstPost.author}
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen((prev) => !prev)}
              className="flex h-[38px] items-center gap-2 rounded-full bg-[#e3e3e3] px-4 text-[#222] transition active:scale-[0.96]"
            >
              <MoreHorizontal size={17} strokeWidth={2.3} />
              <span className="text-[14px] font-medium tracking-[0.2px]">
                MENU
              </span>
            </button>

            <AnimatePresence>
              {isMoreMenuOpen && (
                <WideMenuSheet onClose={() => setIsMoreMenuOpen(false)} />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div
          className="overflow-hidden rounded-[18px]"
          onTouchStartCapture={handleTouchStartCapture}
          onTouchMoveCapture={handleTouchMoveCapture}
          onTouchEndCapture={handleTouchEndCapture}
          onPointerDownCapture={(e) => {
            e.stopPropagation()
          }}
          onPointerMoveCapture={(e) => {
            if (isHorizontalGestureRef.current) {
              e.stopPropagation()
            }
          }}
        >
          <motion.div
            className="flex"
            animate={{ x: `-${currentSlide * 100}%` }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 38,
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0}
            dragMomentum={false}
            style={{ touchAction: 'pan-y' }}
            onDragStart={(e) => {
              e.stopPropagation()
            }}
            onDrag={(_, info) => {
              if (Math.abs(info.offset.x) > 4) {
                isHorizontalGestureRef.current = true
              }
            }}
            onDragEnd={(e, info) => {
              e.stopPropagation()

              const offset = info.offset.x
              const velocity = info.velocity.x

              if (offset < -45 || velocity < -320) {
                goToSlide(currentSlide + 1)
                return
              }

              if (offset > 45 || velocity > 320) {
                goToSlide(currentSlide - 1)
                return
              }

              goToSlide(currentSlide)
            }}
          >
            {postImages.map((image, index) => (
              <div
                key={index}
                className="relative h-[446px] w-full shrink-0 grow-0 basis-full select-none overflow-hidden rounded-[18px] bg-[#dddddd]"
              >
                <img
                  src={image}
                  alt={`${firstPost.author} ${index + 1}`}
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
        </div>

        <div className="mt-2 flex justify-center gap-1.5">
          {postImages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className={`h-[6px] w-[6px] rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'scale-125 bg-[#d77eea]'
                  : 'bg-[#d6d6d6]'
              }`}
              aria-label={`前往第 ${index + 1} 張圖片`}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-[16px] text-[#555]">
              <Heart size={22} className="text-[#d77eea]" />
              <span>{firstPost.likes}</span>
            </div>

            <button
              type="button"
              className="flex items-center text-[#222] transition active:scale-95"
            >
              <MessageCircle size={22} />
            </button>
          </div>

          <button
            type="button"
            className="flex h-[38px] items-center gap-2 rounded-full bg-[#e3e3e3] px-4 text-[14px] font-medium text-[#222] transition active:scale-[0.96]"
          >
            <Mail size={18} strokeWidth={2.1} />
            <span>發送邀請</span>
          </button>
        </div>

        <div className="mt-3 text-[16px] text-[#444]">{firstPost.text}</div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-semibold text-[#666]">
            AI判讀標籤
          </span>

          {postTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#eeeeee] px-3 py-[7px] text-[12px] font-medium text-[#666] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (feedMode === '2x2') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {posts.slice(0, 4).map((post) => {
          const image =
            post.images && post.images.length > 0
              ? post.images[0]
              : 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'

          return (
            <div
              key={post.id}
              className="relative h-[280px] w-full overflow-hidden rounded-[20px] bg-[#dddddd]"
            >
              <img
                src={image}
                alt={post.author}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {posts.slice(0, 9).map((post) => {
        const image =
          post.images && post.images.length > 0
            ? post.images[0]
            : 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'

        return (
          <div key={post.id}>
            <div className="relative h-[190px] w-full overflow-hidden rounded-[18px] bg-[#dddddd]">
              <img
                src={image}
                alt={post.author}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}