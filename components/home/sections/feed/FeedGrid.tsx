'use client'

import { useRef, useState } from 'react'

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
  const sliderRef = useRef<HTMLDivElement | null>(null)

  const handleSliderScroll = () => {
    const slider = sliderRef.current
    if (!slider) return

    const slideWidth = slider.clientWidth
    if (slideWidth === 0) return

    const index = Math.round(slider.scrollLeft / slideWidth)
    setCurrentSlide(index)
  }

  if (feedMode === '1x1') {
    const firstPost = posts[0]

    if (!firstPost) return null

    return (
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="h-[30px] w-[30px] rounded-full bg-[#d6a6e3]" />
          <div className="text-[15px] text-[#555]">{firstPost.author}</div>
          <div className="text-[20px] leading-none text-[#666]">···</div>
        </div>

        <div className="overflow-hidden rounded-[18px]">
          <div
            ref={sliderRef}
            onScroll={handleSliderScroll}
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

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-[16px] text-[#555]">
              <span>💗</span>
              <span>{firstPost.likes}</span>
            </div>

            <div className="flex items-center gap-1 text-[16px] text-[#555]">
              <span>💬</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {slideColors.map((_, index) => (
              <span
                key={index}
                className={`block h-[6px] w-[6px] rounded-full transition-all duration-200 ${
                  currentSlide === index ? 'bg-[#d77eea]' : 'bg-[#cfcfcf]'
                }`}
              />
            ))}
          </div>

          <button className="rounded-full border border-[#ddd] bg-[#e9e9e9] px-4 py-2 text-[16px] text-[#666]">
            ✉ 發送邀請
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