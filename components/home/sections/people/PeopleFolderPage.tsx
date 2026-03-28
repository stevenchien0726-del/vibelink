'use client'

import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'

type PeopleFolderPageProps = {
  title: string
  onClose: () => void
}

export default function PeopleFolderPage({
  title,
  onClose,
}: PeopleFolderPageProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex justify-center bg-[rgba(243,243,243,0.92)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
    >
      <motion.div
        className="relative min-h-screen w-full max-w-[430px] bg-[#f3f3f3]"
        initial={{ scale: 0.86, opacity: 0, y: 28 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 12 }}
        transition={{
          duration: 0.28,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 pt-5">
          <div className="flex items-center gap-2 text-[16px] font-medium text-[#333]">
            <span>{title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="text-[#666]">
              <Trash2 size={20} strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#d9d9d9] px-3 py-1 text-[13px] text-[#444]"
            >
              CLOSE
            </button>
          </div>
        </div>

        {/* User Grid */}
        <div className="px-4 pt-6 pb-[120px]">
          <div className="grid grid-cols-4 gap-y-6 text-center">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-[52px] w-[52px] rounded-full bg-[#c893cf]" />
                <div className="text-[12px] text-[#666]">(用戶名)</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}