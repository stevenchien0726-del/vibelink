'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
}

const stats = [
  { label: '觸及次數', value: 0 },
  { label: '按讚次數', value: 0 },
  { label: '留言數', value: 0 },
  { label: '新增粉絲數', value: 0 },
]

export default function AnalyticsPage({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-block-page-swipe="true"
          className="fixed inset-0 z-[1200] bg-[var(--app-bg)] text-[var(--app-text)]"
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
          <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[var(--app-bg)]">
            {/* Top Bar */}
            <div className="sticky top-0 z-20 flex h-[44px] items-center justify-between border-b border-[var(--app-card-border)] bg-[var(--app-surface)] px-3">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1 text-[var(--app-text)]"
              >
                <ChevronLeft size={18} strokeWidth={2.4} />
                <span className="text-[15px]">流量報告</span>
              </button>

              <div className="pr-1 text-[14px] text-[var(--app-muted)]">
                過去30天記錄
              </div>
            </div>

            {/* Content */}
            <div className="px-5 pt-3">
              <div className="rounded-[14px] border border-[var(--app-card-border)] bg-[var(--app-card)] px-5 py-5">
                <div className="flex flex-col gap-7">
                  {stats.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between"
                    >
                      <div className="text-[16px] text-[var(--app-text)]">
                        {item.label}
                      </div>

                      <div className="text-[16px] text-[var(--app-text)]">
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