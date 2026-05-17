'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
}

const stats = [
  {
    label: '觸及次數',
    value: 0,
  },
  {
    label: '按讚次數',
    value: 0,
  },
  {
    label: '留言數',
    value: 0,
  },
  {
    label: '新增粉絲數',
    value: 0,
  },
]

export default function AnalyticsPage({
  open,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[700] bg-[#f3f3f3]"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{
            type: 'spring',
            stiffness: 360,
            damping: 34,
          }}
        >
          <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#f3f3f3]">
            
            {/* Top Bar */}
            <div className="sticky top-0 z-20 flex h-[44px] items-center justify-between bg-[#bcbcbc] px-3">
              
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1 text-[#111]"
              >
                <ChevronLeft size={18} strokeWidth={2.4} />
                <span className="text-[15px]">流量報告</span>
              </button>

              <div className="pr-1 text-[14px] text-[#222]">
                過去30天記錄
              </div>
            </div>

            {/* Content */}
            <div className="px-5 pt-3">
              
              <div className="rounded-[14px] bg-[#d7d7d7] px-5 py-5">
                <div className="flex flex-col gap-7">
                  
                  {stats.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between"
                    >
                      <div className="text-[16px] text-[#111]">
                        {item.label}
                      </div>

                      <div className="text-[16px] text-[#222]">
                        {item.value}
                      </div>
                    </div>
                  ))}

                </div>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}