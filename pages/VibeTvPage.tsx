'use client'

import { useRef, useState } from 'react'
import { Ticket, ChevronRight } from 'lucide-react'

import { VIBETV_APP_URL, openLink } from '@/lib/links'

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
    <div className="min-h-screen bg-[var(--app-bg)] pb-[110px] text-[var(--app-text)]">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="fixed top-0 left-1/2 z-[100] w-full max-w-[430px] -translate-x-1/2 border-b border-[var(--app-card-border)] bg-[var(--app-bg)]/95 px-3 pt-4 pb-3 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                window.open('https://vibe-membership-web.vercel.app', '_blank')
              }}
              className="flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--app-card-border)] bg-[var(--app-card)] px-4 text-[18px] font-medium text-[var(--app-text)] active:scale-[0.98]"
            >
              <Ticket className="h-[18px] w-[18px]" strokeWidth={2.2} />
              <span>Vibe會員</span>
            </button>

            <button
              type="button"
              onClick={() => openLink(VIBETV_APP_URL)}
              className="flex h-10 items-center justify-center rounded-full border border-[var(--app-card-border)] bg-[var(--app-card)] px-5 text-[18px] font-medium text-[var(--app-text)] active:scale-[0.98]"
            >
              <span>VibeTV APP</span>
              <ChevronRight className="ml-1 h-[18px] w-[18px]" strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <div className="px-3 pt-[72px]">
          <div className="mb-4 pt-[2px]">
            <h1 className="text-[36px] font-black italic leading-[1.18] tracking-[-0.03em]">
              <span className="inline-block bg-gradient-to-r from-[#c86ad9] to-[#7a4fd1] bg-clip-text pr-[10px] text-transparent">
                VIBE
              </span>
              <span className="ml-1 inline-block text-[var(--app-text)]">
                TV
              </span>
            </h1>
          </div>

          <div className="mb-4">
            <div className="overflow-hidden rounded-[20px] border border-[var(--app-card-border)]">
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
                    <div className="absolute right-4 top-4 rounded-full bg-black/20 px-3 py-1 text-[14px] text-white backdrop-blur-sm">
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
                      ? 'bg-[#8b5cf6]'
                      : 'bg-[var(--app-card)]'
                  }`}
                />
              ))}
            </div>
          </div>

          <VibeTvSection title="Vibe TV精選" count={20} />
          <VibeTvSection title="Top10影集" count={10} />
          <VibeTvSection title="Top10電影" count={10} />
        </div>
      </div>
    </div>
  )
}

function VibeTvSection({
  title,
  count,
}: {
  title: string
  count: number
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-[20px] font-semibold text-[var(--app-text)]">
        {title}
      </h2>

      <div
        data-horizontal-scroll="true"
        className="scrollbar-hide flex gap-2 overflow-x-auto pb-1"
      >
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="h-[150px] min-w-[110px] shrink-0 rounded-[10px] border border-[var(--app-card-border)] bg-[var(--app-card)]"
          />
        ))}
      </div>
    </section>
  )
}