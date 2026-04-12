'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Heart,
  MessageCircle,
  Mail,
  Bookmark,
  Send,
  EyeOff,
  OctagonAlert,
  MoreHorizontal,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export type FeedMode = '1x1' | '2x2' | '3x3'

export type PostItem = {
  id: string
  author: string
  text: string
  likes: number
  image: string
}

type FeedGridProps = {
  posts?: PostItem[]
  feedMode?: FeedMode
  setFeedMode?: (mode: FeedMode) => void
}

const slideColors = ['#dddddd', '#d2d2d2', '#c7c7c7']

export default function FeedGrid({
  posts = [],
  feedMode = '1x1',
}: FeedGridProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)

  const sliderRef = useRef<HTMLDivElement | null>(null)
  const moreMenuRef = useRef<HTMLDivElement | null>(null)
  const sliderTouchStartXRef = useRef<number | null>(null)
  const sliderTouchStartYRef = useRef<number | null>(null)

  const handleSliderScroll = () => {
    const slider = sliderRef.current
    if (!slider) return

    const slideWidth = slider.clientWidth
    if (slideWidth === 0) return

    const index = Math.round(slider.scrollLeft / slideWidth)
    setCurrentSlide(index)
  }

  function handleSliderTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0]
    sliderTouchStartXRef.current = touch.clientX
    sliderTouchStartYRef.current = touch.clientY
  }

  function handleSliderTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const startX = sliderTouchStartXRef.current
    const startY = sliderTouchStartYRef.current
    if (startX == null || startY == null) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (absX > absY && absX > 8) {
      e.stopPropagation()
    }
  }

  function handleSliderTouchEnd() {
    sliderTouchStartXRef.current = null
    sliderTouchStartYRef.current = null
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node

      if (
        isMoreMenuOpen &&
        moreMenuRef.current &&
        !moreMenuRef.current.contains(target)
      ) {
        setIsMoreMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMoreMenuOpen])

  if (feedMode === '1x1') {
    const firstPost = posts[0]

    if (!firstPost) return null

    return (
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-[34px] w-[34px] rounded-full bg-[#d6d6d6]" />
            <div className="text-[15px] font-medium text-[#222]">
              {firstPost.author}
            </div>
          </div>

          <div className="relative" ref={moreMenuRef}>
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
                <motion.div
                  initial={{ opacity: 0, scale: 0.82, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 8 }}
                  transition={{
                    type: 'spring',
                    stiffness: 360,
                    damping: 28,
                    mass: 0.9,
                  }}
                  className="absolute right-0 top-[48px] z-20 w-[174px] rounded-[20px] border-[3px] border-[#d79adf] bg-[#f8f8f8] px-5 py-5 shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex flex-col gap-6">
                    <button
                      type="button"
                      className="flex items-center gap-3 text-[16px] text-[#222]"
                    >
                      <Bookmark size={19} strokeWidth={2} />
                      <span>收藏</span>
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-3 text-[16px] text-[#222]"
                    >
                      <Send size={19} strokeWidth={2} />
                      <span>分享</span>
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-3 text-[16px] text-[#222]"
                    >
                      <EyeOff size={19} strokeWidth={2} />
                      <span>隱藏</span>
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-3 text-[16px] text-[#222]"
                    >
                      <OctagonAlert size={19} strokeWidth={2} />
                      <span>檢舉</span>
                    </button>
                  </div>
                </motion.div>
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
            className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {slideColors.map((color, index) => (
              <div
                key={index}
                className="relative h-[446px] min-w-full shrink-0 snap-center select-none rounded-[18px]"
                style={{ backgroundColor: color }}
              >
                <div className="absolute right-4 top-4 rounded-full bg-black/10 px-3 py-1 text-[14px] text-[#555]">
                  {index + 1}/3
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 flex justify-center gap-1.5">
          {slideColors.map((_, index) => (
            <div
              key={index}
              className={`h-[6px] w-[6px] rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'scale-125 bg-[#d77eea]'
                  : 'bg-[#d6d6d6]'
              }`}
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
      </div>
    )
  }

  if (feedMode === '2x2') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {posts.slice(0, 4).map((post) => (
          <div
  key={post.id}
  className="h-[280px] w-full rounded-[20px] bg-[#dddddd]"
/>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {posts.slice(0, 9).map((post) => (
        <div key={post.id}>
  <div className="h-[190px] w-full rounded-[18px] bg-[#dddddd]" />
</div>
      ))}
    </div>
  )
}