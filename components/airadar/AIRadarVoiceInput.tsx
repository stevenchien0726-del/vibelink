'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Mic, Send, X } from 'lucide-react'

type Props = {
  open: boolean
  transcript: string
  onClose: () => void
  onStart: () => void
  onSend: () => void
}

export default function AIRadarVoiceInput({
  open,
  transcript,
  onClose,
  onStart,
  onSend,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/45 px-4 pb-[120px] backdrop-blur-[10px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-[390px] rounded-[34px] bg-[var(--app-card)] px-5 py-6 text-center shadow-[0_18px_60px_rgba(0,0,0,0.32)]"
            initial={{ y: 40, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--app-surface)] text-[var(--app-text)] active:scale-95"
              >
                <X size={20} />
              </button>

              <p className="text-[15px] font-semibold text-[var(--app-text)]">
                AI 雷達正在聽
              </p>

              <div className="h-10 w-10" />
            </div>

            <button
              type="button"
              onClick={onStart}
              className="mx-auto mb-6 flex h-[74px] w-[74px] items-center justify-center rounded-full bg-[#9b2cff] text-white shadow-[0_12px_34px_rgba(155,44,255,0.45)] active:scale-95"
            >
              <Mic size={30} className="text-white" />
            </button>

            <div className="mx-auto mb-5 flex h-[52px] w-full items-center justify-center gap-1.5 rounded-full bg-[var(--app-surface)] px-6">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 rounded-full bg-[#b85cff]"
                  animate={{
                    height: [10, 28, 14, 34, 12],
                    opacity: [0.45, 1, 0.65, 1, 0.45],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.08,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            <div className="min-h-[58px] rounded-[22px] bg-[var(--app-surface)] px-4 py-4 text-left text-[15px] leading-[1.55] text-[var(--app-text)]">
              {transcript || (
                <span className="text-[var(--app-muted)]">
                  說出你想找什麼樣 Vibe 的人…
                </span>
              )}
            </div>

            <button
  type="button"
  onClick={onSend}
  disabled={!transcript.trim()}
  className={`
    mt-5
    flex
    h-[52px]
    w-full
    items-center
    justify-center
    gap-2
    rounded-full
    text-[16px]
    font-semibold
    transition
    active:scale-95
    ${
      transcript.trim()
        ? 'bg-[#9b2cff] text-white shadow-[0_10px_28px_rgba(155,44,255,0.34)]'
        : 'bg-[var(--app-surface)] text-[var(--app-muted)]'
    }
  `}
>
  <Send size={18} className={transcript.trim() ? 'text-white' : 'text-[var(--app-muted)]'} />
  送出語音搜尋
</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}