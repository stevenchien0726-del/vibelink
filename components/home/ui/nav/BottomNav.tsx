'use client'

import { House, Bot, MessageSquare, SquareUserRound, Tv } from 'lucide-react'
import type { AppPage } from '@/app/page'

type Props = {
  current: AppPage
  setPage: React.Dispatch<React.SetStateAction<AppPage>>
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

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex justify-center pb-5">
      <div className="pointer-events-auto relative h-[58px] w-[330px] rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.10)]">
        {/* 這層專門拿來放滑動膠囊，5 等分，每格真實置中 */}
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

        {/* icon buttons */}
        <div className="relative z-10 grid h-full grid-cols-5 px-2">
          {items.map(({ key, icon: Icon }) => {
            const active = current === key

            return (
              <button
                key={key}
                type="button"
                onClick={() => setPage(key)}
                className="flex h-full items-center justify-center"
              >
                <Icon
                  className={`h-[24px] w-[24px] transition-colors duration-300 ${
                    active ? 'text-[#a855f7]' : 'text-black'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}