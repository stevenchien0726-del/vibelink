'use client'

import { ChevronLeft, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

type Props = {
  onClose: () => void
}

export default function ArchivedContentPage({ onClose }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-[240] flex justify-center bg-[#f3f3f3]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{
        type: 'spring',
        stiffness: 360,
        damping: 34,
      }}
    >
      <div className="relative min-h-screen w-full max-w-[430px] bg-[#f3f3f3] text-[#111]">
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
              典藏內容
            </div>
          </div>
        </div>

        <div className="px-4 pb-10 pt-[86px]">
          <div className="mt-[140px] flex flex-col items-center text-center">
            <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#d9d9d9]">
              <Clock size={34} strokeWidth={2} />
            </div>

            <div className="mt-5 text-[18px] font-medium">
              目前沒有典藏內容
            </div>

            <div className="mt-2 max-w-[260px] text-[14px] leading-relaxed text-[#777]">
              之後你典藏的內容會集中在這裡，方便快速回看。
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}