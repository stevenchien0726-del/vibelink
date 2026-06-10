'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Link, Upload, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { uiText } from '@/lib/uiText'

export type ShareTarget = {
  id: string
  type: 'post' | 'video'
  title?: string
  author?: string
  text?: string
  image?: string
  url: string
}

type ShareSheetProps = {
  open: boolean
  onClose: () => void
  target?: ShareTarget | null
  onShareToMessage?: (target: ShareTarget) => void
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // iOS WebView and permission-denied cases can fall back here.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.left = '-9999px'
  textarea.style.opacity = '0'

  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)

  if (!copied) {
    throw new Error('Clipboard fallback failed')
  }
}

function getShareUrl(url: string) {
  if (!url) return ''
  return new URL(url, window.location.origin).toString()
}

export default function ShareSheet({
  open,
  onClose,
  target,
  onShareToMessage,
}: ShareSheetProps) {
  const [statusMessage, setStatusMessage] = useState('')

  const text = {
    shareSearchPlaceholder: uiText(
      '分享對象功能即將開放',
      'Sharing targets coming soon'
    ),
    shareTargetsComingSoon: uiText(
      '分享對象功能即將開放',
      'Sharing targets coming soon'
    ),
    copyLink: uiText('複製連結', 'Copy link'),
    shareToMessage: uiText('分享訊息', 'Share to messages'),
    copiedLink: uiText('已複製連結', 'Link copied'),
    copyFailed: uiText('複製失敗', 'Copy failed'),
    messageShareComingSoon: uiText(
      '訊息分享即將開放',
      'Message sharing coming soon'
    ),
    videoLabel: uiText('短影片', 'Video'),
    postLabel: uiText('貼文', 'Post'),
  }

  useEffect(() => {
    if (open) setStatusMessage('')
  }, [open, target?.id])

  async function handleCopyLink() {
    try {
      if (!target?.url) throw new Error('Missing share target url')

      await copyTextToClipboard(getShareUrl(target.url))
      setStatusMessage(text.copiedLink)
    } catch (error) {
      console.warn('[ShareSheet] copy failed', error)
      setStatusMessage(text.copyFailed)
    }
  }

  function handleShareToMessage() {
    if (target && onShareToMessage) {
      onShareToMessage(target)
      return
    }

    console.warn('[ShareSheet] message share is not implemented yet', target)
    setStatusMessage(text.messageShareComingSoon)
  }

  const previewTitle = target?.title || target?.author || 'Vibelink'
  const previewText =
    target?.text || (target?.type === 'video' ? text.videoLabel : text.postLabel)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[10060] bg-black/25 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed bottom-0 left-1/2 z-[10070] w-full max-w-[430px] -translate-x-1/2 rounded-t-[28px] border border-[var(--app-card-border)] bg-[var(--app-surface)] px-4 pt-5 pb-7 text-[var(--app-text)] shadow-[0_-12px_34px_rgba(0,0,0,0.16)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-[48px] flex-1 items-center rounded-[18px] border border-[var(--app-card-border)] bg-[var(--app-card)] px-4">
                <span className="text-[var(--app-text)]">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
                    <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  disabled
                  value=""
                  placeholder={text.shareSearchPlaceholder}
                  className="ml-3 min-w-0 flex-1 bg-transparent text-[14px] text-[var(--app-muted)] outline-none placeholder:text-[var(--app-muted)] disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="button"
                disabled
                className="flex h-[48px] w-[92px] items-center justify-center rounded-[18px] border border-[var(--app-card-border)] bg-[var(--app-card)] text-[var(--app-text)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-55"
                aria-label={text.shareTargetsComingSoon}
              >
                <Users size={29} strokeWidth={2} />
              </button>
            </div>

            {target && (
              <div className="mb-4 flex items-center gap-3 rounded-[18px] border border-[var(--app-card-border)] bg-[var(--app-card)] p-3">
                <div className="h-[54px] w-[54px] shrink-0 overflow-hidden rounded-[14px] bg-[var(--app-bg)]">
                  {target.image ? (
                    <img
                      src={target.image}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold text-[var(--app-text)]">
                    {previewTitle}
                  </div>
                  <div className="mt-1 line-clamp-2 text-[13px] leading-[1.35] text-[var(--app-muted)]">
                    {previewText}
                  </div>
                </div>
              </div>
            )}

            <div
              className="mb-4 flex gap-6 overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'none' }}
            >
              <div className="w-full rounded-[18px] border border-[var(--app-card-border)] bg-[var(--app-card)] px-4 py-5 text-center text-[14px] text-[var(--app-muted)]">
                {text.shareTargetsComingSoon}
              </div>
            </div>

            {statusMessage && (
              <div className="mb-4 text-center text-[13px] font-medium text-[var(--app-text)]">
                {statusMessage}
              </div>
            )}

            <div className="mx-4 mb-4 h-px bg-[var(--app-card-border)]" />

            <div className="grid grid-cols-2 gap-2 text-[var(--app-text)]">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 rounded-[16px] py-2 active:scale-95"
              >
                <Link size={38} strokeWidth={2} />
                <span className="text-center text-[14px] leading-tight">
                  {text.copyLink}
                </span>
              </button>

              <button
                type="button"
                onClick={handleShareToMessage}
                className="flex flex-col items-center gap-2 rounded-[16px] py-2 active:scale-95"
              >
                <Upload size={39} strokeWidth={2} />
                <span className="text-center text-[14px] leading-tight">
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
