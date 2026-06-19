'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  Pin,
  MessageCircleMore,
  Archive,
  Trash2,
  AlertCircle,
  Ban,
} from 'lucide-react'
import { uiText } from '@/lib/uiText'

type Props = {
  onClose: () => void
  variant?: 'mine' | 'other'
  onArchive?: () => void
  onDelete?: () => void
  onOpenInsights?: () => void
  onTogglePin?: () => void
  onBlock?: () => void
  onReport?: () => void
  isReported?: boolean

  isPinned?: boolean

  replyPermission?: 'everyone' | 'following' | 'off'

  onChangeReplyPermission?: (
    value: 'everyone' | 'following' | 'off'
  ) => void
}

export default function WideMenuSheet({
  onClose,
  variant = 'other',
  onArchive,
  onDelete,
  onOpenInsights,
  onTogglePin,
  onBlock,
  onReport,
  isReported = false,
  isPinned = false,
  replyPermission = 'everyone',
  onChangeReplyPermission,
}: Props) {
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [replyMenuOpen, setReplyMenuOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)

    setTimeout(() => {
      onClose()
    }, 260)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[99999] flex justify-center bg-black/40"
        onClick={handleClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: isClosing ? 0 : 1 }}
        transition={{ duration: 0.22 }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 w-full max-w-[430px] rounded-t-[28px] bg-[var(--app-bg)] px-5 pb-8 pt-4"
          initial={{ y: '100%' }}
          animate={{ y: isClosing ? '100%' : 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        >
          <div className="mb-8 flex justify-center">
            <div className="h-[4px] w-[40px] rounded-full bg-gray-400/60" />
          </div>

          {variant === 'mine' ? (
            <div className="rounded-[18px] bg-[var(--app-card)] px-5 py-6 shadow-sm">
              <div className="flex flex-col gap-6">
                <button
                  type="button"
                  onClick={() => {
                    handleClose()

                    setTimeout(() => {
                      onOpenInsights?.()
                    }, 220)
                  }}
                  className="flex items-center gap-7"
                >
                  <BarChart3 size={20} />
                  <span className="text-[16px] text-[var(--app-text)]">
                    {uiText('流量與互動', 'Traffic & Interactions')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onTogglePin?.()
                    handleClose()
                  }}
                  className="flex items-center gap-7"
                >
                  <Pin size={20} />

                  <span className="text-[16px] text-[var(--app-text)]">
                    {isPinned ? uiText('取消釘選', 'Unpin') : uiText('釘選', 'Pin')}
                  </span>
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setReplyMenuOpen((prev) => !prev)}
                    className="flex items-center gap-7"
                  >
                    <MessageCircleMore size={20} />
                    <span className="text-[16px] text-[var(--app-text)]">
                      變更可回復對象
                    </span>
                  </button>

                  <AnimatePresence>
                    {replyMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{
                          duration: 0.18,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="ml-[18px] mt-4 overflow-hidden rounded-[18px] border border-[var(--app-card-border)] bg-[var(--app-surface)] shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
                      >
                        {[
                          { value: 'everyone', label: uiText('所有人', 'Everyone') },
                          { value: 'following', label: uiText('你跟隨的用戶', 'People you follow') },
                          { value: 'off', label: uiText('關閉回復功能', 'Turn off replies') },
                        ].map((item) => {
                          const active = replyPermission === item.value

                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => {
                                onChangeReplyPermission?.(
                                  item.value as
                                    | 'everyone'
                                    | 'following'
                                    | 'off'
                                )

                                setReplyMenuOpen(false)
                              }}
                              className={`flex h-[46px] w-full items-center justify-between px-4 text-left text-[15px] ${
                                active
                                  ? 'bg-purple-500/15 text-purple-400'
                                  : 'text-[var(--app-text)] active:bg-black/5'
                              }`}
                            >
                              <span>{item.label}</span>
                              {active && <span className="text-[14px]">✓</span>}
                            </button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmArchiveOpen(true)}
                  className="flex items-center gap-7"
                >
                  <Archive size={20} />
                  <span className="text-[16px] text-[var(--app-text)]">
                    典藏貼文
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="flex items-center gap-7 text-red-500"
                >
                  <Trash2 size={20} />
                  <span className="text-[16px]">刪除貼文</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-[18px] bg-[var(--app-card)] px-5 py-6 shadow-sm">
              <div className="flex flex-col gap-6">
                <button
                  type="button"
                  onClick={() => {
                    onReport?.()
                    handleClose()
                  }}
                  className="flex items-center gap-7"
                >
                  <AlertCircle
  size={18}
  color={isReported ? '#f97316' : undefined}
/>
                  <span
  className={`text-[16px] ${
    isReported
      ? 'text-orange-500'
      : 'text-[var(--app-text)]'
  }`}
>
  {isReported ? '取消檢舉' : '檢舉'}
</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onBlock?.()
                    handleClose()
                  }}
                  className="flex items-center gap-7"
                >
                  <Ban size={18} />
                  <span className="text-[16px] text-[var(--app-text)]">
                    封鎖
                  </span>
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <ConfirmDialog
          open={confirmArchiveOpen}
          title={uiText('確定典藏這篇貼文？', 'Archive this post?')}
          description={uiText('典藏後會從個人頁貼文牆隱藏，可到典藏內容頁恢復。', 'Archived posts will be hidden from your profile grid and can be restored from Archived Content.')}
          confirmText={uiText('確定典藏', 'Archive')}
          confirmClassName="text-[#8B5CF6]"
          onConfirm={() => {
            onArchive?.()
            handleClose()
          }}
          onCancel={() => setConfirmArchiveOpen(false)}
        />

        <ConfirmDialog
          open={confirmDeleteOpen}
          title="確定刪除這篇貼文？"
          description="刪除後這篇貼文會永久移除，這個動作無法復原。"
          confirmText="確定刪除"
          confirmClassName="text-red-500"
          onConfirm={() => {
            onDelete?.()
            handleClose()
          }}
          onCancel={() => setConfirmDeleteOpen(false)}
        />
      </motion.div>
    </AnimatePresence>
  )
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  confirmClassName,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description: string
  confirmText: string
  confirmClassName: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/35 px-8"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="w-full max-w-[320px] overflow-hidden rounded-[24px] bg-[var(--app-card)] text-center shadow-xl"
            initial={{ opacity: 0, scale: 0.86, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >
            <div className="px-6 pb-5 pt-6">
              <div className="text-[18px] font-semibold text-[var(--app-text)]">
                {title}
              </div>

              <div className="mt-2 text-[14px] leading-relaxed text-[var(--app-text-muted)]">
                {description}
              </div>
            </div>

            <button
              type="button"
              onClick={onConfirm}
              className={`h-[48px] w-full border-t border-[var(--app-border)] text-[16px] font-medium ${confirmClassName}`}
            >
              {confirmText}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="h-[48px] w-full border-t border-[var(--app-border)] text-[16px] text-[var(--app-text)]"
            >
              取消
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
