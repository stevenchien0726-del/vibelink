'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Ticket, ChevronDown, ChevronRight } from 'lucide-react'
import { uiText } from '@/lib/uiText'

export default function VibeTvPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const text = {
    membership: uiText('Vibe會員', 'Vibe Membership'),
    comingSoon: uiText(
      'Vibe TV 開發中，將隨著 Vibe 會員成長逐步開放，敬請期待!',
      'Vibe TV is in development and will gradually open as Vibe membership grows. Stay tuned!'
    ),
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] pb-[110px] text-[var(--app-text)]">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="fixed left-1/2 top-0 z-[100] w-full max-w-[430px] -translate-x-1/2 border-b border-[var(--app-card-border)] bg-[var(--app-bg)]/95 px-3 pb-3 pt-4 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className="relative">
              <button
                type="button"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--app-card-border)] bg-[var(--app-card)] px-4 active:scale-[0.98]"
              >
                <img
                  src="/image/vibe-tv-logo.png"
                  alt="VIBE TV"
                  className="block h-[22px] w-auto object-contain"
                />

                <ChevronDown
                  className={`h-6 w-6 shrink-0 self-center text-[var(--app-text)] transition-transform duration-200 ${
                    isMenuOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                  strokeWidth={2.4}
                />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -6 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute left-0 top-[calc(100%+8px)] z-[110] rounded-[16px] border border-white/15 bg-black/60 p-2 shadow-[0_12px_32px_rgba(0,0,0,0.24)] backdrop-blur-md"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false)
                        window.open(
                          'https://vibe-membership-web.vercel.app',
                          '_blank'
                        )
                      }}
                      className="flex h-10 min-w-[150px] items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-[16px] font-medium text-white transition active:scale-[0.98]"
                    >
                      <Ticket
                        className="h-[18px] w-[18px]"
                        strokeWidth={2.2}
                      />
                      <span>{text.membership}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
  className="
    flex
    h-10
    items-center
    justify-center
    rounded-full
    border
    border-[var(--app-card-border)]
    bg-[var(--app-card)]
    px-5
    text-[18px]
    font-medium
    text-[var(--app-muted)]
    opacity-55
  "
>
  <span>VibeTV APP</span>
  <ChevronRight
    className="ml-1 h-[18px] w-[18px]"
    strokeWidth={2.4}
  />
</div>
          </div>
        </div>

        <main className="flex min-h-screen flex-col items-center px-4 pt-[86px]">
          <div className="w-full overflow-hidden rounded-[28px] border border-[var(--app-card-border)] bg-[var(--app-card)] shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
            <img
              src="/image/vibetv-coming-soon.png"
              alt="Vibe TV Coming Soon"
              className="block w-full object-cover"
            />
          </div>

          <div className="mt-7 text-center">
            
            <p className="mt-3 px-6 text-[15px] leading-[1.55] text-[var(--app-muted)]">
              {text.comingSoon}
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
