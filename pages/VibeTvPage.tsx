'use client'

import { useRef, useState } from 'react'

const bannerColors = ['#d9d9d9', '#cfcfcf', '#c4c4c4']

export default function VibeTvPage() {
  const [currentBanner, setCurrentBanner] = useState(0)
  const bannerRef = useRef<HTMLDivElement | null>(null)

  const handleBannerScroll = () => {
    const slider = bannerRef.current
    if (!slider) return

    const slideWidth = slider.clientWidth
    if (slideWidth === 0) return

    const index = Math.round(slider.scrollLeft / slideWidth)
    setCurrentBanner(index)
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] px-3 pt-4 pb-[110px]">
      <div className="mx-auto w-full max-w-[430px]">
        {/* Top Actions */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <button className="flex h-10 items-center justify-center rounded-full bg-[#d9d9d9] px-4 text-[18px] font-medium text-[#111]">
            Vibe會員
          </button>

          <button className="flex h-10 items-center justify-center rounded-full bg-[#d9d9d9] px-5 text-[18px] font-medium text-[#111]">
            VibeTV APP
            <span className="ml-2 text-[18px]">›</span>
          </button>
        </div>

        {/* Logo */}
        <div className="mb-4 pt-[2px]">
          <h1 className="text-[36px] font-black italic leading-[1.18] tracking-[-0.03em] text-[#2a2a2a]">
            <span className="inline-block bg-gradient-to-r from-[#c86ad9] to-[#7a4fd1] bg-clip-text pr-[10px] text-transparent">
              VIBE
            </span>
            <span className="ml-1 inline-block text-[#2a2a2a]">TV</span>
          </h1>
        </div>

        {/* Hero Banner */}
        <div className="mb-4 overflow-hidden rounded-[20px]">
          <div
            ref={bannerRef}
            onScroll={handleBannerScroll}
            className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto touch-pan-x overscroll-x-contain"
          >
            {bannerColors.map((color, index) => (
              <div
                key={index}
                className="relative h-[200px] min-w-full shrink-0 snap-center"
                style={{ backgroundColor: color }}
              >
                <div className="absolute right-4 top-4 rounded-full bg-black/15 px-3 py-1 text-[14px] text-[#555]">
                  {index + 1}/{bannerColors.length}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="mb-5 flex items-center justify-center gap-2">
          {bannerColors.map((_, index) => (
            <span
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-200 ${
                currentBanner === index ? 'bg-[#d46bcf]' : 'bg-[#cfcfcf]'
              }`}
            />
          ))}
        </div>

        {/* Section 1 */}
        <section className="mb-6">
          <h2 className="mb-3 text-[20px] font-semibold text-[#222]">Vibe TV精選</h2>

          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((item) => (
              <div
                key={item}
                className="h-[150px] min-w-[110px] shrink-0 rounded-[10px] bg-[#d9d9d9]"
              />
            ))}
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-[#222]">台灣Top10</h2>

          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
              <div
                key={item}
                className="h-[150px] min-w-[110px] shrink-0 rounded-[10px] bg-[#d9d9d9]"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}