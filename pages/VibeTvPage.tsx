'use client'

import { Ticket, ChevronRight } from 'lucide-react'
import { VIBETV_APP_URL, openLink } from '@/lib/links'
import { uiText } from '@/lib/uiText'

export default function VibeTvPage() {
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
            <button
              type="button"
              onClick={() => {
                window.open('https://vibe-membership-web.vercel.app', '_blank')
              }}
              className="flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--app-card-border)] bg-[var(--app-card)] px-4 text-[18px] font-medium text-[var(--app-text)] active:scale-[0.98]"
            >
              <Ticket className="h-[18px] w-[18px]" strokeWidth={2.2} />
              <span>{text.membership}</span>
            </button>

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
          <div className="mb-5 w-full">
            <h1 className="text-[36px] font-black italic leading-[1.18] tracking-[-0.03em]">
              <span className="inline-block bg-gradient-to-r from-[#c86ad9] to-[#7a4fd1] bg-clip-text pr-[10px] text-transparent">
                VIBE
              </span>
              <span className="ml-1 inline-block text-[var(--app-text)]">
                TV
              </span>
            </h1>
          </div>

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
