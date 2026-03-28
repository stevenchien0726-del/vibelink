'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type MatchCard = {
  id: string
  name: string
  age: number
  bio: string
  distance: string
  tags: string[]
}

const mockCards: MatchCard[] = [
  {
    id: 'm1',
    name: 'Sky',
    age: 21,
    bio: '喜歡聊天、夜生活、奶狗系男生。',
    distance: '1.2 km',
    tags: ['奶狗 vibe', '可愛', '愛聊天'],
  },
  {
    id: 'm2',
    name: 'Ryan',
    age: 23,
    bio: '平常會健身，也喜歡週末出去散步。',
    distance: '2.8 km',
    tags: ['健身', '戶外', '陽光感'],
  },
  {
    id: 'm3',
    name: 'Leo',
    age: 22,
    bio: '喜歡音樂、穿搭、微性感風格。',
    distance: '4.1 km',
    tags: ['穿搭', '音樂', '性感 vibe'],
  },
  {
    id: 'm4',
    name: 'Mason',
    age: 24,
    bio: '想認識會深聊、有世界觀的人。',
    distance: '3.4 km',
    tags: ['深聊', '世界觀', '成熟感'],
  },
]

export default function MatchingPage() {
  const [cards, setCards] = useState<MatchCard[]>(mockCards)
  const [lastAction, setLastAction] = useState<'like' | 'nope' | null>(null)

  const currentCard = useMemo(() => cards[0] ?? null, [cards])
  const nextCard = useMemo(() => cards[1] ?? null, [cards])

  function handleAction(type: 'like' | 'nope') {
    if (!currentCard) return
    setLastAction(type)
    setCards((prev) => prev.slice(1))
  }

  function handleReset() {
    setCards(mockCards)
    setLastAction(null)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f5f5f5]">
      {/* top bar */}
      <div className="fixed top-0 left-1/2 z-[40] flex h-[60px] w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[rgba(245,245,245,0.96)] px-4 backdrop-blur-md">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center bg-transparent text-[#111]"
        >
          <BackIcon />
        </button>

        <div className="text-[22px] font-semibold tracking-[-0.3px] text-[#111]">
          Matching
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-[14px] font-medium text-[#666]"
        >
          重置
        </button>
      </div>

      <main className="min-h-screen px-4 pb-[110px] pt-[76px]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[25px] font-semibold tracking-[-0.4px] text-[#111]">
              今日配對
            </div>
            <div className="mt-1 text-[14px] text-[#777]">
              先做穩定滑卡版，下一步可升級拖曳 swipe
            </div>
          </div>
        </div>

        {!currentCard ? (
          <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 text-[28px]">✨</div>
            <div className="text-[22px] font-semibold text-[#111]">
              今天的卡片看完了
            </div>
            <div className="mt-2 text-[14px] leading-[1.4] text-[#777]">
              你可以先重置假資料，之後我們再接真實推薦邏輯。
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="mt-5 rounded-full bg-[#d88fc4] px-5 py-3 text-[14px] font-medium text-[#111]"
            >
              重新載入卡片
            </button>
          </div>
        ) : (
          <>
            <div className="relative mx-auto h-[620px] w-full max-w-[390px]">
              {/* next card */}
              {nextCard && (
                <div className="absolute inset-x-3 top-3 z-0 h-[600px] rounded-[30px] bg-[#e6e6e6] opacity-80" />
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCard.id}
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    x: lastAction === 'like' ? 120 : lastAction === 'nope' ? -120 : 0,
                    rotate: lastAction === 'like' ? 10 : lastAction === 'nope' ? -10 : 0,
                  }}
                  transition={{ duration: 0.22 }}
                  className="absolute inset-0 z-10 overflow-hidden rounded-[32px] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.10)]"
                >
                  {/* fake photo area */}
                  <div className="relative h-[72%] w-full bg-[#d9d9d9]">
                    <div className="absolute left-4 top-4 rounded-full bg-black/30 px-3 py-1 text-[12px] font-medium text-white">
                      {currentCard.distance}
                    </div>

                    {lastAction === 'like' && (
                      <div className="absolute right-4 top-4 rotate-[10deg] rounded-[12px] border-2 border-[#43d17a] px-3 py-1 text-[18px] font-bold text-[#43d17a]">
                        LIKE
                      </div>
                    )}

                    {lastAction === 'nope' && (
                      <div className="absolute left-4 top-4 -rotate-[10deg] rounded-[12px] border-2 border-[#ff5c7a] px-3 py-1 text-[18px] font-bold text-[#ff5c7a]">
                        NOPE
                      </div>
                    )}
                  </div>

                  {/* content */}
                  <div className="flex h-[28%] flex-col justify-between px-5 py-4">
                    <div>
                      <div className="flex items-end gap-2">
                        <div className="text-[28px] font-semibold tracking-[-0.4px] text-[#111]">
                          {currentCard.name}
                        </div>
                        <div className="pb-[3px] text-[20px] text-[#555]">
                          {currentCard.age}
                        </div>
                      </div>

                      <div className="mt-2 text-[14px] leading-[1.45] text-[#555]">
                        {currentCard.bio}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {currentCard.tags.map((tag) => (
                          <div
                            key={tag}
                            className="rounded-full bg-[#efefef] px-3 py-[7px] text-[12px] font-medium text-[#444]"
                          >
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* action buttons */}
            <div className="mt-5 flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => handleAction('nope')}
                className="grid h-[58px] w-[58px] place-items-center rounded-full bg-white shadow-[0_8px_18px_rgba(0,0,0,0.08)]"
              >
                <CloseIcon />
              </button>

              <button
                type="button"
                className="grid h-[52px] w-[52px] place-items-center rounded-full bg-white shadow-[0_8px_18px_rgba(0,0,0,0.08)]"
              >
                <StarIcon />
              </button>

              <button
                type="button"
                onClick={() => handleAction('like')}
                className="grid h-[58px] w-[58px] place-items-center rounded-full bg-white shadow-[0_8px_18px_rgba(0,0,0,0.08)]"
              >
                <HeartIcon />
              </button>
            </div>

            <div className="mt-5 rounded-[24px] bg-white px-4 py-4 shadow-[0_8px_20px_rgba(0,0,0,0.05)]">
              <div className="text-[14px] font-semibold text-[#111]">
                AI 推薦理由
              </div>
              <div className="mt-2 text-[14px] leading-[1.5] text-[#666]">
                這張卡片可以先用假資料模擬：
                興趣、外型 vibe、聊天風格、距離，之後再接你的 AI 找人幫手邏輯。
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 8l8 8M16 8l-8 8"
        stroke="#ff5c7a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.5L12 16.8 7.2 19l.9-5.5-3.9-3.8 5.4-.8L12 4z"
        stroke="#8d6bff"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-6.5-4.2-8.6-8C1.4 8.5 3.2 5 7 5c2.1 0 3.5 1.1 5 3 1.5-1.9 2.9-3 5-3 3.8 0 5.6 3.5 3.6 7-2.1 3.8-8.6 8-8.6 8z"
        stroke="#ff5c9a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}