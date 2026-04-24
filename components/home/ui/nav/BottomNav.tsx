'use client'

import { useEffect, useState } from 'react'
import { House, Bot, MessageSquare, SquareUserRound, Tv } from 'lucide-react'
import type { AppPage } from '@/app/page'

type Props = {
  current: AppPage
  setPage: (page: AppPage) => void
}

const items: {
  key: AppPage
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { key: 'home', icon: House },
  { key: 'ai', icon: Bot },
  { key: 'message', icon: MessageSquare },
  { key: 'profile', icon: SquareUserRound },
  { key: 'tv', icon: Tv },
]

export default function BottomNav({ current, setPage }: Props) {
  const activeIndex = items.findIndex((item) => item.key === current)

  // 動畫階段：idle / press / pop
  const [pressState, setPressState] = useState<'idle' | 'press' | 'pop'>('idle')
  const [refreshingPage, setRefreshingPage] = useState<AppPage | null>(null)

  function handlePress(page: AppPage) {
  // 點目前所在頁面的 icon：回到頂部 + 模擬刷新
  if (current === page) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    setRefreshingPage(page)

    window.dispatchEvent(
      new CustomEvent('vibelink-refresh-page', {
        detail: { page },
      })
    )

    setTimeout(() => {
      setRefreshingPage(null)
    }, 700)
  } else {
    setPage(page)
  }

  setPressState('press')

  setTimeout(() => {
    setPressState('pop')
  }, 80)

  setTimeout(() => {
    setPressState('idle')
  }, 260)
}

  // scale控制（關鍵）
  const scale =
    pressState === 'press'
      ? 0.97
      : pressState === 'pop'
      ? 1.04
      : 1

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[40] flex justify-center pb-5">
      <div
        className="pointer-events-auto relative h-[58px] w-[330px] rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.10)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* 滑動膠囊 */}
        <div className="absolute inset-0 grid grid-cols-5 px-2">
          <div
            className="flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          >
            <div className="h-[46px] w-[60px] rounded-full bg-[#d9d9d9]/55" />
          </div>
        </div>

        {/* icon */}
        <div className="relative z-10 grid h-full grid-cols-5 px-2">
          {items.map(({ key, icon: Icon }) => {
            const active = current === key

            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePress(key)}
                className="flex h-full items-center justify-center"
              >
                <Icon
  className={`h-[24px] w-[24px] transition-all duration-300 ${
    active ? 'text-[#a855f7]' : 'text-black'
  } ${refreshingPage === key ? 'scale-110 rotate-[-8deg]' : 'scale-100 rotate-0'}`}
/>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}