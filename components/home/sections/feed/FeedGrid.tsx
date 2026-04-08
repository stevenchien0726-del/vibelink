'use client'

import { ChevronUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  Heart,
  MessageCircle,
  Mail,
  Bookmark,
  Send,
  EyeOff,
  OctagonAlert,
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

  const handleSliderScroll = () => {
    const slider = sliderRef.current
    if (!slider) return

    const slideWidth = slider.clientWidth
    if (slideWidth === 0) return

    const index = Math.round(slider.scrollLeft / slideWidth)
    setCurrentSlide(index)
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
        {/* Author row */}
        <div className="mb-3 flex items-center gap-2">
          <div className="h-[30px] w-[30px] rounded-full bg-[#d6a6e3]" />
          <div className="text-[15px] text-[#555]">{firstPost.author}</div>
        </div>

        {/* Image slider */}
        <div className="overflow-hidden rounded-[18px]">
          <div
            ref={sliderRef}
            onScroll={handleSliderScroll}
            data-horizontal-scroll="true"
            className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto touch-pan-x overscroll-x-contain"
          >
            {slideColors.map((color, index) => (
              <div
                key={index}
                className="relative h-[446px] min-w-full shrink-0 snap-center select-none"
                style={{ backgroundColor: color }}
              >
                <div className="absolute right-4 top-4 rounded-full bg-black/15 px-3 py-1 text-[14px] text-[#555]">
                  {index + 1}/3
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots row */}
        <div className="mt-3 flex justify-center gap-2">
          {slideColors.map((_, index) => (
            <div
              key={index}
              className={`h-[8px] w-[8px] rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'scale-110 bg-[#d77eea]'
                  : 'bg-[#cfcfcf]'
              }`}
            />
          ))}
        </div>

        {/* Action row */}
        <div className="relative mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Like */}
            <div className="flex items-center gap-1 text-[16px] text-[#555]">
              <Heart size={20} className="text-[#d77eea]" />
              <span>{firstPost.likes}</span>
            </div>

            {/* Comment */}
            <div className="flex items-center gap-1 text-[16px] text-[#555]">
              <MessageCircle size={20} />
            </div>

            {/* More */}
            <div className="relative" ref={moreMenuRef}>
              <button
  onClick={() => setIsMoreMenuOpen((prev) => !prev)}
  className="flex h-[40px] w-[40px] translate-y-[-1px] items-center justify-center rounded-full text-[#555] hover:bg-[#eaeaea] active:scale-95 transition"
>
  <ChevronUp
    size={23}
    strokeWidth={2}
    className={`transition-transform duration-300 ${
      isMoreMenuOpen ? 'rotate-180' : ''
    }`}
  />
</button>

              <AnimatePresence>
                {isMoreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.82, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.88, y: 8 }}
                    transition={{
                      type: 'spring',
                      stiffness: 360,
                      damping: 28,
                      mass: 0.9,
                    }}
                    className="absolute bottom-[34px] left-1/2 z-20 w-[164px] -translate-x-1/2 rounded-[20px] border-[4px] border-[#d79adf] bg-[#f8f8f8] px-5 py-5 shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
                  >
                    <div className="flex flex-col gap-5">
                      <button
                        type="button"
                        className="flex items-center gap-3 text-[16px] text-[#222]"
                      >
                        <Bookmark size={20} strokeWidth={2} />
                        <span>收藏</span>
                      </button>

                      <button
                        type="button"
                        className="flex items-center gap-3 text-[16px] text-[#222]"
                      >
                        <Send size={20} strokeWidth={2} />
                        <span>分享</span>
                      </button>

                      <button
                        type="button"
                        className="flex items-center gap-3 text-[16px] text-[#222]"
                      >
                        <EyeOff size={20} strokeWidth={2} />
                        <span>隱藏</span>
                      </button>

                      <button
                        type="button"
                        className="flex items-center gap-3 text-[16px] text-[#222]"
                      >
                        <OctagonAlert size={20} strokeWidth={2} />
                        <span>檢舉</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Send Invite Button */}
          <button className="flex items-center gap-2 rounded-full border border-[#d0d0d0] bg-[#ededed] px-4 py-2 text-[15px] text-[#555]">
            <Mail size={20} />
            <span>發送邀請</span>
          </button>
        </div>

        {/* Text */}
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
            className="aspect-square w-full rounded-[16px] bg-[#dddddd]"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {posts.slice(0, 9).map((post) => (
        <div key={post.id}>
          <div className="aspect-square w-full rounded-[14px] bg-[#dddddd]" />
        </div>
      ))}
    </div>
  )
}