'use client'

import { Bell, ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'

type Props = {
  onClose: () => void
}

export default function NotificationsPage({
  onClose,
}: Props) {
  return (
    <motion.div
  data-block-page-swipe="true"
  className="fixed inset-0 z-[1200] flex justify-center bg-[var(--app-bg)] text-[var(--app-text)]"
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{
    type: 'spring',
    stiffness: 360,
    damping: 34,
  }}
  onTouchStart={(e) => e.stopPropagation()}
  onTouchMove={(e) => e.stopPropagation()}
  onTouchEnd={(e) => e.stopPropagation()}
  onPointerDown={(e) => e.stopPropagation()}
  onClick={(e) => e.stopPropagation()}
>
      <div className="relative min-h-screen w-full max-w-[430px] bg-[#f3f3f3] text-[#111]">
        {/* Top Bar */}
        <div className="fixed left-1/2 top-0 z-[20] w-full max-w-[430px] -translate-x-1/2 bg-[#f3f3f3]/95 px-4 pb-3 pt-3 backdrop-blur-md">
          <div className="relative flex h-[40px] items-center justify-center">
            <button
              type="button"
              onClick={onClose}
              className="absolute left-0 flex h-[40px] w-[40px] items-center justify-center rounded-full active:scale-95"
            >
              <ChevronLeft size={24} strokeWidth={2.2} />
            </button>

            <div className="text-[20px] font-medium tracking-[0.02em]">
              通知
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex min-h-screen flex-col items-center justify-center px-6 pb-[120px] pt-[90px] text-center">
          <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#d9d9d9]">
            <Bell size={34} strokeWidth={2} />
          </div>

          <div className="mt-5 text-[18px] font-medium">
            目前沒有通知
          </div>

          <div className="mt-2 max-w-[260px] text-[14px] leading-relaxed text-[#777]">
            新的追蹤、按讚、留言與互動通知之後會顯示在這裡。
          </div>
        </div>
      </div>
    </motion.div>
  )
}