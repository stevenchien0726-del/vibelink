'use client'

import { useEffect, useState } from 'react'
import { Heart, CircleHelp, X } from 'lucide-react'
import { motion } from 'framer-motion'

type RightNowItem = {
  id: string
  text: string
  distance: string
}

type RightNowPageProps = {
  onClose: () => void
}

const rightNowItems: RightNowItem[] = [
  { id: '1', text: '想找人聊天', distance: '5公里' },
  { id: '2', text: '一起喝酒嗎', distance: '1公里' },
  { id: '3', text: '剛失戀找抱抱', distance: '2公里' },
  { id: '4', text: '附近有gay嗎', distance: '4公里' },
  { id: '5', text: '想找健身朋友', distance: '300公尺' },
  { id: '6', text: '信義區喝酒中', distance: '小於200公尺' },
  { id: '7', text: '夜店包廂還很空，要來私我', distance: '2公里' },
  { id: '8', text: '找人晚上6點一起看同人達', distance: '9公里' },
]

export default function RightNowPage({ onClose }: RightNowPageProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [isRightNowEnabled, setIsRightNowEnabled] = useState(true)
  const [composerText, setComposerText] = useState('')

  const [mounted, setMounted] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      onClose()
    }, 260)
  }

  return (
    <div
      className={`fixed inset-0 z-[130] flex justify-center transition-all duration-[260ms] ease-out ${
        mounted && !closing ? 'bg-black/30 opacity-100' : 'bg-black/0 opacity-0'
      }`}
    >
      <motion.div
        drag={isComposerOpen ? false : 'y'}
        dragDirectionLock
        dragElastic={{ top: 0, bottom: 0.18 }}
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={(_, info) => {
          if (isComposerOpen) return

          const draggedDownEnough = info.offset.y > 140
          const fastEnough = info.velocity.y > 700

          if (draggedDownEnough || fastEnough) {
            handleClose()
          }
        }}
        className={`relative min-h-screen w-full max-w-[430px] origin-bottom bg-[#f3f3f3] touch-pan-y transition-all duration-[260ms] ease-out ${
          mounted && !closing
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-6 scale-[0.92] opacity-0'
        }`}
      >
        <div className="sticky top-0 z-[10] flex items-center justify-between bg-[#f3f3f3] px-4 pb-3 pt-4">
          <div className="flex items-center gap-2">
            <Heart size={22} className="fill-[#d89ad0] text-black" />
            <span className="text-[18px] font-semibold">Right now</span>
            <CircleHelp size={16} className="text-black/70" />
          </div>

          <button
            onClick={handleClose}
            className="rounded-full bg-[#e5e5e5] px-4 py-1.5 text-[13px]"
          >
            CLOSE
          </button>
        </div>

        <div className="px-4 pb-[110px]">
          <div className="flex flex-col gap-4">
            {rightNowItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex items-start gap-3 text-left"
              >
                <div className="mt-1 h-[42px] w-[42px] rounded-full bg-[#d9d9d9]" />

                <div className="flex-1">
                  <div className="text-[16px] leading-[1.25] text-[#222]">
                    {item.text}
                  </div>
                  <div className="mt-1 text-[14px] text-[#555]">
                    {item.distance}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {!isComposerOpen && (
          <div className="fixed bottom-[90px] left-1/2 z-[131] w-full max-w-[430px] -translate-x-1/2 px-4">
            <button
              type="button"
              onClick={() => setIsComposerOpen(true)}
              className="flex w-full items-center justify-between rounded-full bg-[#d9d9d9] px-4 py-3 text-left"
            >
              <span className="text-[15px] text-[#222]">我的Right now</span>

              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#222]">
                  {isRightNowEnabled ? '開啟中' : '關閉中'}
                </span>

                <div
                  className={`flex h-[24px] w-[44px] items-center rounded-full px-[3px] transition-colors ${
                    isRightNowEnabled ? 'bg-[#d89ad0]' : 'bg-[#bdbdbd]'
                  }`}
                >
                  <div
                    className={`h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
                      isRightNowEnabled ? 'translate-x-[20px]' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </button>
          </div>
        )}

        {isComposerOpen && (
          <div className="fixed inset-0 z-[140] flex justify-center bg-black/10">
            <div className="relative w-full max-w-[430px]">
              <div className="absolute bottom-[82px] left-0 right-0 rounded-t-[24px] bg-[#d9d9d9] px-4 pb-3 pt-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="absolute right-4 top-4"
                >
                  <X size={24} className="text-black" />
                </button>

                <textarea
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  placeholder="輸入即時短句"
                  className="mt-10 h-[86px] w-full resize-none rounded-[14px] border border-[#d5a8d2] bg-[#f3f3f3] px-4 py-3 text-[16px] text-black placeholder:text-black/65 focus:outline-none"
                />

                <div className="mb-3 mt-5 flex items-center gap-2 text-[14px] text-[#333]">
                  <span>⏱</span>
                  <span>今日Right now: 剩餘25分鐘</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[15px] text-[#222]">我的Right now</span>

                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-[#222]">
                      {isRightNowEnabled ? '開啟中' : '關閉中'}
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsRightNowEnabled((prev) => !prev)}
                      className={`flex h-[24px] w-[44px] items-center rounded-full px-[3px] transition-colors ${
                        isRightNowEnabled ? 'bg-[#d89ad0]' : 'bg-[#bdbdbd]'
                      }`}
                    >
                      <div
                        className={`h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
                          isRightNowEnabled ? 'translate-x-[20px]' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}