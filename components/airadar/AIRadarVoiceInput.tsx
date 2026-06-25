'use client'

import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Mic, Send, X } from 'lucide-react'
import type { Locale } from '@/i18n'

type Props = {
  open: boolean
  locale: Locale
  transcript: string
  isListening: boolean
  errorMessage: string
  showPermissionSettingsButton: boolean
  onOpenPermissionSettings: () => void
  onClose: () => void
  onStart: () => void
  onSend: () => void
}

function AIRadarVoiceInput({
  open,
  locale,
  transcript,
  isListening,
  errorMessage,
  showPermissionSettingsButton,
  onOpenPermissionSettings,
  onClose,
  onStart,
  onSend,
}: Props) {
  const text =
    locale === 'en'
      ? {
          titleListening: 'AI Radar is listening',
          titleIdle: 'Voice Search',
          startHint: 'Tap the mic and say what kind of vibe you want to find...',
          listeningHint:
            'Say what kind of person, vibe, lifestyle, or energy you want to find...',
          retry: 'Tap the mic to try again',
          send: 'Send voice search',
          ready: 'Voice captured. Send it to AI Radar.',
          permissionSettings: 'Open Permission Settings',
        }
      : {
          titleListening: 'AI 雷達正在聽',
          titleIdle: '語音搜尋',
          startHint: '點擊麥克風，說出你想找什麼樣 Vibe 的人...',
          listeningHint: '說出你想找的人、vibe、生活感或能量...',
          retry: '點擊麥克風重新辨識',
          send: '送出語音搜尋',
          ready: '已辨識到內容，可以送出給 AI 雷達搜尋',
          permissionSettings: '開啟權限設定',
        }
  const hasTranscript = transcript.trim().length > 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/45 px-4 pb-[120px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-[390px] rounded-[34px] bg-[var(--app-card)] px-5 py-6 text-center shadow-[0_10px_34px_rgba(0,0,0,0.22)] will-change-transform [backface-visibility:hidden] [transform:translateZ(0)]"
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
                {isListening ? text.titleListening : text.titleIdle}
              </p>

              <div className="h-10 w-10" />
            </div>

            <button
              type="button"
              onClick={onStart}
              className={`mx-auto mb-6 flex h-[74px] w-[74px] items-center justify-center rounded-full bg-[#9b2cff] text-white transition active:scale-95 ${
                isListening
                  ? 'ring-2 ring-[#c084fc] shadow-[0_0_0_8px_rgba(192,132,252,0.16),0_16px_42px_rgba(155,44,255,0.58)]'
                  : 'shadow-[0_12px_34px_rgba(155,44,255,0.45)]'
              }`}
            >
              <Mic size={30} className="text-white" />
            </button>

            <div className="mx-auto mb-5 flex h-[52px] w-full items-center justify-center gap-1.5 rounded-full bg-[var(--app-surface)] px-6">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 rounded-full bg-[#b85cff]"
                  animate={
                    isListening
                      ? {
                          height: [10, 28, 14, 34, 12],
                          opacity: [0.45, 1, 0.65, 1, 0.45],
                        }
                      : {
                          height: [8, 12, 9, 13, 8],
                          opacity: [0.22, 0.36, 0.28, 0.34, 0.22],
                        }
                  }
                  transition={{
                    duration: isListening ? 1 : 1.8,
                    repeat: Infinity,
                    delay: i * 0.08,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            <div className="min-h-[58px] rounded-[22px] bg-[var(--app-surface)] px-4 py-4 text-left text-[15px] leading-[1.55] text-[var(--app-text)]">
              {errorMessage ? (
                <span className="text-red-400">{errorMessage}</span>
              ) : transcript ? (
                transcript
              ) : (
                <span className="text-[var(--app-muted)]">
                  {isListening ? text.listeningHint : text.startHint}
                </span>
              )}
            </div>

            {errorMessage && !isListening && !hasTranscript && (
              <p className="mt-3 text-[12px] text-[var(--app-muted)]">
                {text.retry}
              </p>
            )}

            {showPermissionSettingsButton && (
              <button
                type="button"
                onClick={onOpenPermissionSettings}
                className="mt-4 flex h-[46px] w-full items-center justify-center rounded-full bg-[#9b2cff] text-[15px] font-semibold text-white shadow-[0_10px_28px_rgba(155,44,255,0.28)] transition active:scale-95"
              >
                {text.permissionSettings}
              </button>
            )}

            {hasTranscript && (
              <p className="mt-3 text-[12px] text-[var(--app-muted)]">
                {text.ready}
              </p>
            )}

            <button
              type="button"
              onClick={onSend}
              disabled={!hasTranscript}
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
                  hasTranscript
                    ? 'bg-[#9b2cff] text-white shadow-[0_10px_28px_rgba(155,44,255,0.34)]'
                    : 'bg-[var(--app-surface)] text-[var(--app-muted)]'
                }
              `}
            >
              <Send
                size={18}
                className={
                  hasTranscript ? 'text-white' : 'text-[var(--app-muted)]'
                }
              />
              {text.send}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(AIRadarVoiceInput)
