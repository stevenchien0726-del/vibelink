'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Link, PlusCircle, Upload, Users } from 'lucide-react'

type ShareSheetProps = {
  open: boolean
  onClose: () => void
}

const mockUsers = ['(用戶名)', '(用戶名)', '(用戶名)', '(用戶名)', '(用戶名)']

export default function ShareSheet({ open, onClose }: ShareSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[880] bg-black/25"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed bottom-0 left-1/2 z-[890] w-full max-w-[430px] -translate-x-1/2 rounded-t-[28px] bg-[#d9d9d9] px-4 pt-5 pb-7 shadow-[0_-12px_34px_rgba(0,0,0,0.16)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-[48px] flex-1 items-center rounded-[18px] bg-[#f3f3f3] px-4">
                <span className="text-[#111]">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
                    <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </span>
              </div>

              <button
                type="button"
                className="flex h-[48px] w-[92px] items-center justify-center rounded-[18px] bg-[#f3f3f3] active:scale-95"
              >
                <Users size={29} strokeWidth={2} />
              </button>
            </div>

            <div
              className="mb-4 flex gap-6 overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {mockUsers.map((name, index) => (
                <button
                  key={index}
                  type="button"
                  className="flex shrink-0 flex-col items-center gap-2 active:scale-95"
                >
                  <div className="h-[68px] w-[68px] rounded-full bg-[#c98ad0]" />
                  <div className="text-[14px] text-[#111]">{name}</div>
                </button>
              ))}
            </div>

            <div className="mx-4 mb-4 h-[2px] bg-[#b7b7b7]" />

            <div className="grid grid-cols-3 gap-2">
              <button className="flex flex-col items-center gap-2 active:scale-95">
                <Link size={38} strokeWidth={2} />
                <span className="text-center text-[14px] leading-tight text-[#111]">
                  複製連結
                </span>
              </button>

              <button className="flex flex-col items-center gap-2 active:scale-95">
                <PlusCircle size={39} strokeWidth={2} />
                <span className="text-center text-[14px] leading-tight text-[#111]">
                  分享到限<br />時動態
                </span>
              </button>

              <button className="flex flex-col items-center gap-2 active:scale-95">
                <Upload size={39} strokeWidth={2} />
                <span className="text-center text-[14px] leading-tight text-[#111]">
                  分享至更<br />多地方
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}