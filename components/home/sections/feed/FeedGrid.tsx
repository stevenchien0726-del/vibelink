'use client'

import WideMenuSheet from '@/components/WideMenuSheet'
import { useEffect, useRef, useState } from 'react'
import {
  Heart,
  MessageCircle,
  Mail,
  MoreHorizontal,
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'

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

  const sliderRef = useRef<HTMLDivElement | null>(null)
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchMovedXRef = useRef(0)
  const isHorizontalGestureRef = useRef(false)

  const firstPost = posts[0]

  const postImages =
    firstPost?.images && firstPost.images.length > 0
      ? firstPost.images
      : ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80']

  useEffect(() => {
    setCurrentSlide(0)

    const slider = sliderRef.current
    if (!slider) return

    slider.scrollTo({
      left: 0,
      behavior: 'auto',
    })
  }, [firstPost?.id, feedMode])

  const goToSlide = (index: number) => {
    const slider = sliderRef.current
    if (!slider) return

    const safeIndex = Math.max(0, Math.min(index, postImages.length - 1))
    const slideWidth = slider.clientWidth

    slider.scrollTo({
      left: safeIndex * slideWidth,
      behavior: 'smooth',
    })

    setCurrentSlide(safeIndex)
  }

  const handleSliderScroll = () => {
    const slider = sliderRef.current
    if (!slider) return

    const slideWidth = slider.clientWidth
    if (slideWidth === 0) return

    const index = Math.round(slider.scrollLeft / slideWidth)
    const safeIndex = Math.max(0, Math.min(index, postImages.length - 1))

    if (safeIndex !== currentSlide) {
      setCurrentSlide(safeIndex)
    }
  }

  function handleSliderTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0]
    touchStartXRef.current = touch.clientX
    touchStartYRef.current = touch.clientY
    touchMovedXRef.current = 0
    isHorizontalGestureRef.current = false
  }

  function handleSliderTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const startX = touchStartXRef.current
    const startY = touchStartYRef.current
    if (startX == null || startY == null) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    touchMovedXRef.current = deltaX

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (absX > absY && absX > 8) {
      isHorizontalGestureRef.current = true
      e.stopPropagation()
    }
  }

  function handleSliderTouchEnd() {
    const slider = sliderRef.current
    if (!slider) {
      touchStartXRef.current = null
      touchStartYRef.current = null
      touchMovedXRef.current = 0
      isHorizontalGestureRef.current = false
      return
    }

    const slideWidth = slider.clientWidth
    const deltaX = touchMovedXRef.current
    const threshold = Math.min(50, slideWidth * 0.12)

    let nextIndex = currentSlide

    if (isHorizontalGestureRef.current) {
      if (deltaX < -threshold) {
        nextIndex = Math.min(currentSlide + 1, postImages.length - 1)
      } else if (deltaX > threshold) {
        nextIndex = Math.max(currentSlide - 1, 0)
      } else {
        nextIndex = Math.round(slider.scrollLeft / slideWidth)
      }
    } else {
      nextIndex = Math.round(slider.scrollLeft / slideWidth)
    }

    nextIndex = Math.max(0, Math.min(nextIndex, postImages.length - 1))
    goToSlide(nextIndex)

    touchStartXRef.current = null
    touchStartYRef.current = null
    touchMovedXRef.current = 0
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

        <div className="overflow-hidden rounded-[18px]">
          <div
            ref={sliderRef}
            onScroll={handleSliderScroll}
            onTouchStart={handleSliderTouchStart}
            onTouchMove={handleSliderTouchMove}
            onTouchEnd={handleSliderTouchEnd}
            data-horizontal-scroll="true"
            className="scrollbar-hide flex overflow-x-auto overscroll-x-contain snap-x snap-mandatory"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: 'x mandatory',
            }}
          >
            {postImages.map((image, index) => (
              <div
                key={index}
                className="relative h-[446px] min-w-full shrink-0 snap-center select-none overflow-hidden rounded-[18px] bg-[#dddddd]"
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
          </div>
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