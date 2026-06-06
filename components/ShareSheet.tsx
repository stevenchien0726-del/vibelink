'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Link, PlusCircle, Upload, Users } from 'lucide-react'
import { uiText } from '@/lib/uiText'

type ShareSheetProps = {
  open: boolean
  onClose: () => void
}

export default function ShareSheet({ open, onClose }: ShareSheetProps) {
  const text = {
    copyLink: uiText('複製連結', 'Copy Link'),
    addToStory: uiText('加到限時動態', 'Add to Story'),
    shareToMessage: uiText('分享到訊息', 'Share to Message'),
    noTargets: uiText('暫無可分享對象', 'No sharing targets yet'),
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[10060] bg-black/25"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed bottom-0 left-1/2 z-[10070] w-full max-w-[430px] -translate-x-1/2 rounded-t-[28px] bg-[#d9d9d9] px-4 pt-5 pb-7 shadow-[0_-12px_34px_rgba(0,0,0,0.16)]"
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
              <div className="w-full rounded-[18px] bg-[#f3f3f3] px-4 py-5 text-center text-[14px] text-[#666]">
                {text.noTargets}
              </div>
            </div>

            <div className="mx-4 mb-4 h-[2px] bg-[#b7b7b7]" />

            <div className="grid grid-cols-3 gap-2">
              <button className="flex flex-col items-center gap-2 active:scale-95">
                <Link size={38} strokeWidth={2} />
                <span className="text-center text-[14px] leading-tight text-[#111]">
                  {text.copyLink}
                </span>
              </button>

              <button className="flex flex-col items-center gap-2 active:scale-95">
                <PlusCircle size={39} strokeWidth={2} />
                <span className="text-center text-[14px] leading-tight text-[#111]">
                  {text.addToStory}
                </span>
              </button>

              <button className="flex flex-col items-center gap-2 active:scale-95">
                <Upload size={39} strokeWidth={2} />
                <span className="text-center text-[14px] leading-tight text-[#111]">
                  {text.shareToMessage}
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
