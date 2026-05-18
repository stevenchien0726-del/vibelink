// src/components/profile/PostInsightsPage.tsx
'use client'

import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

type Props = {
  onClose: () => void
  views?: number
  likes?: number
  comments?: number
}

export default function PostInsightsPage({
  onClose,
  views = 0,
  likes = 0,
  comments = 0,
}: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-[1300] flex justify-center bg-[#f3f3f3]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 360, damping: 34 }}
    >
      <div className="relative h-full w-full max-w-[430px] overflow-y-auto bg-[#f3f3f3]">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 flex h-[56px] items-center border-b border-black/5 bg-[#f3f3f3]/95 px-4 backdrop-blur-md">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 text-[#222]"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>

          <span className="ml-1 text-[16px] font-medium text-[#222]">
            貼文流量報告
          </span>
        </div>

        {/* Content */}
        <div className="px-5 pt-5">
          <div className="rounded-[18px] bg-[#dcdcdc] px-5 py-6 shadow-sm">
            {/* 觸及次數 */}
            <div className="mb-6 flex items-center justify-between">
              <span className="text-[15px] font-medium text-[#222]">
                觸及次數
              </span>

              <span className="text-[15px] text-[#222]">
                {views}
              </span>
            </div>

            {/* 按讚次數 */}
            <div className="mb-6 flex items-center justify-between">
              <span className="text-[15px] font-medium text-[#222]">
                按讚次數
              </span>

              <span className="text-[15px] text-[#222]">
                {likes}
              </span>
            </div>

            {/* 留言數 */}
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-medium text-[#222]">
                留言數
              </span>

              <span className="text-[15px] text-[#222]">
                {comments}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}