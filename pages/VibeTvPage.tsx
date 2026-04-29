'use client'

import { useRef, useState } from 'react'
import { Ticket, ChevronRight } from 'lucide-react'

const bannerColors = ['#d9d9d9', '#cfcfcf', '#c4c4c4']
const MEMBERSHIP_URL = 'https://vibelink-j9m5-kd3ozcfwg-stevenchien0726-dels-projects.vercel.app/'
const VIBETV_APP_URL = 'https://vibetv-app-qrq4-mslailoeg-stevenchien0726-dels-projects.vercel.app/'

function openMembershipSite() {
  window.open(MEMBERSHIP_URL, '_blank')
}
function openVibeTvApp() {
  window.open(VIBETV_APP_URL, '_blank')
}

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
    <div className="min-h-screen bg-[#f3f3f3] pb-[110px]">
      <div className="mx-auto w-full max-w-[430px]">
        {/* Fixed Top Actions */}
        <div className="fixed top-0 left-1/2 z-[100] w-full max-w-[430px] -translate-x-1/2 bg-[#f3f3f3]/95 px-3 pt-4 pb-3 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={openMembershipSite}
              className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#d9d9d9] px-4 text-[18px] font-medium text-[#111]"
            >
              <Ticket className="h-[18px] w-[18px]" strokeWidth={2.2} />
              <span>Vibe會員</span>
            </button>

            <button
  type="button"
  onClick={openVibeTvApp}
  className="flex h-10 items-center justify-center rounded-full bg-[#d9d9d9] px-5 text-[18px] font-medium text-[#111]"
>
  <span>VibeTV APP</span>
  <ChevronRight className="ml-1 h-[18px] w-[18px]" strokeWidth={2.4} />
</button>
          </div>
        </div>

        {/* Scroll Content */}
        <div className="px-3 pt-[72px]">
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
<div className="mb-4">
  <div className="overflow-hidden rounded-[20px]">
    <div
      ref={bannerRef}
      onScroll={handleBannerScroll}
      data-horizontal-scroll="true"
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

  <div className="mt-2 flex justify-center gap-2">
  {bannerColors.map((_, index) => (
    <div
      key={index}
      className={`h-[6px] w-[6px] rounded-full transition-all duration-300 ${
        currentBanner === index
          ? 'bg-[#8b5cf6]'   // 紫色
          : 'bg-[#d1d1d1]'   // 灰色
      }`}
    />
  ))}
</div>
</div>

          {/* Section */}
          <section className="mt-6">
            <h2 className="mb-3 text-[20px] font-semibold text-[#222]">Vibe TV精選</h2>

            <div
              data-horizontal-scroll="true"
              className="scrollbar-hide flex gap-2 overflow-x-auto pb-1"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map
              ((item) => (
                <div
                  key={item}
                  className="h-[150px] min-w-[110px] shrink-0 rounded-[10px] bg-[#d9d9d9]"
                />
              ))}
            </div>
          </section>

          {/* Section */}
          <section className="mt-6">
            <h2 className="mb-3 text-[20px] font-semibold text-[#222]">Top10影集</h2>

            <div
              data-horizontal-scroll="true"
              className="scrollbar-hide flex gap-2 overflow-x-auto pb-1"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                <div
                  key={item}
                  className="h-[150px] min-w-[110px] shrink-0 rounded-[10px] bg-[#d9d9d9]"
                />
              ))}
            </div>
          </section>

          {/* Section */}
          <section className="mt-6">
            <h2 className="mb-3 text-[20px] font-semibold text-[#222]">Top10電影</h2>

            <div
              data-horizontal-scroll="true"
              className="scrollbar-hide flex gap-2 overflow-x-auto pb-1"
            >
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
    </div>
  )
}