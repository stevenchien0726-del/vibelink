'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Plus,
  LogOut,
  Lock,
  TriangleAlert,
} from 'lucide-react'

type AccountManagePageProps = {
  onClose: () => void
}

export default function AccountManagePage({
  onClose,
}: AccountManagePageProps) {
  const [dragX, setDragX] = useState(0)
  const [isDraggingBack, setIsDraggingBack] = useState(false)

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const draggingEnabled = useRef(false)

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()

    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    draggingEnabled.current = touch.clientX <= 32
    setIsDraggingBack(false)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()

    if (!draggingEnabled.current) return
    if (touchStartX.current == null || touchStartY.current == null) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current

    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
      draggingEnabled.current = false
      setIsDraggingBack(false)
      setDragX(0)
      return
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault()
    }

    if (deltaX > 0) {
      setIsDraggingBack(true)
      setDragX(deltaX)
    } else {
      setIsDraggingBack(false)
      setDragX(0)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()

    if (!draggingEnabled.current) {
      touchStartX.current = null
      touchStartY.current = null
      return
    }

    if (dragX > 90) {
      setDragX(0)
      setIsDraggingBack(false)
      onClose()
    } else {
      setDragX(0)
      setIsDraggingBack(false)
    }

    touchStartX.current = null
    touchStartY.current = null
    draggingEnabled.current = false
  }

  return (
    <motion.div
      className="fixed inset-0 z-[230] flex justify-center bg-[#f3f3f3] touch-pan-y"
      initial={{ x: '100%' }}
      animate={{ x: dragX }}
      exit={{ x: '100%' }}
      transition={
        isDraggingBack
          ? { duration: 0 }
          : {
              duration: 0.34,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative min-h-screen w-full max-w-[430px] bg-[#f3f3f3] text-[#222]">
        {/* top bar */}
        <div className="fixed top-0 left-1/2 z-[30] w-full max-w-[430px] -translate-x-1/2 bg-[#f3f3f3]/95 px-4 pt-3 pb-3 backdrop-blur-md">
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              aria-label="返回"
              onClick={onClose}
              className="absolute left-0 flex h-[40px] w-[40px] items-center justify-center rounded-full active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="text-[20px] font-medium tracking-[0.01em]">
              帳號管理
            </div>
          </div>
        </div>

        <div className="px-4 pt-[78px] pb-10">
          {/* account block */}
          <div className="rounded-[24px] bg-[#d9d9d9] px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-[18px] px-1 py-2 text-left transition active:scale-[0.985]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#ececec] text-[#111]">
                  <CircleUserRound size={28} strokeWidth={1.9} />
                </div>

                <div className="flex flex-col">
                  <span className="text-[16px] font-medium text-[#222]">
                    Sky_07_21
                  </span>
                  <span className="mt-1 text-[13px] text-[#7a7a7a]">
                    Vibelink帳號
                  </span>
                </div>
              </div>

              <ChevronRight size={20} className="text-[#333]" />
            </button>

            <div className="my-2 h-px bg-[#b8b8b8]" />

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-[18px] px-1 py-2 text-left transition active:scale-[0.985]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#ececec] text-[#111]">
                  <Plus size={28} strokeWidth={2.1} />
                </div>

                <div className="flex flex-col">
                  <span className="text-[16px] font-medium text-[#222]">
                    新增Vibelink帳號
                  </span>
                  <span className="mt-1 text-[13px] text-[#7a7a7a]">
                    建立和切換身分
                  </span>
                </div>
              </div>

              <ChevronRight size={20} className="text-[#333]" />
            </button>
          </div>

          {/* logout */}
          <div className="mt-4">
            <button
              type="button"
              className="flex w-full items-center gap-4 rounded-[20px] bg-[#d9d9d9] px-6 py-[18px] text-left shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition active:scale-[0.985]"
            >
              <LogOut size={21} strokeWidth={2.1} />
              <span className="text-[16px] font-medium text-[#222]">登出</span>
            </button>
          </div>

          {/* security */}
          <div className="mt-4">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-[20px] bg-[#d9d9d9] px-6 py-[18px] text-left shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition active:scale-[0.985]"
            >
              <div className="flex items-center gap-4">
                <Lock size={21} strokeWidth={2.1} />
                <span className="text-[16px] font-medium text-[#222]">
                  密碼和安全
                </span>
              </div>

              <ChevronRight size={20} className="text-[#333]" />
            </button>
          </div>

          {/* danger */}
          <div className="mt-4">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-[20px] bg-[#d9d9d9] px-6 py-[18px] text-left shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition active:scale-[0.985]"
            >
              <div className="flex items-center gap-4">
                <TriangleAlert size={21} strokeWidth={2.1} />
                <span className="text-[16px] font-medium text-[#222]">
                  停用或刪除(危險區)
                </span>
              </div>

              <Lock size={18} strokeWidth={2.1} className="text-[#333]" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}