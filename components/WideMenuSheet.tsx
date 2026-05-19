'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  Pin,
  MessageCircleMore,
  Archive,
  Trash2,
  UserPlus,
  AlertCircle,
  Ban,
} from 'lucide-react'

type Props = {
  onClose: () => void
  variant?: 'mine' | 'other'
  onArchive?: () => void
  onDelete?: () => void
  onOpenInsights?: () => void
}

export default function WideMenuSheet({
  onClose,
  variant = 'other',
  onArchive,
  onDelete,
  onOpenInsights,
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [closing, setClosing] = useState(false)
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 250)
  }

  return (
    <div
      className={`fixed inset-0 z-[99999] flex justify-center transition-all duration-300 ${
        mounted && !closing ? 'bg-black/40' : 'bg-black/0'
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute bottom-0 w-full max-w-[430px] rounded-t-[28px] bg-[#f2f2f2] px-5 pb-8 pt-4 transition-all duration-300 ${
          mounted && !closing ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mb-8 flex justify-center">
          <div className="h-[4px] w-[40px] rounded-full bg-gray-400/60" />
        </div>

        {variant === 'mine' ? (
          <div className="rounded-[18px] bg-white px-5 py-6 shadow-sm">
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
  <span className="text-[16px] text-[#111]">流量與互動</span>
</button>

              <button type="button" className="flex items-center gap-7">
                <Pin size={20} />
                <span className="text-[16px] text-[#111]">釘選</span>
              </button>

              <button type="button" className="flex items-center gap-7">
                <MessageCircleMore size={20} />
                <span className="text-[16px] text-[#111]">變更可回復對象</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmArchiveOpen(true)}
                className="flex items-center gap-7"
              >
                <Archive size={20} />
                <span className="text-[16px] text-[#111]">典藏貼文</span>
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
          <>
            <div className="mb-8">
              <button
                type="button"
                className="flex w-full items-center gap-1 rounded-[18px] bg-white px-5 py-8 shadow-sm"
              >
                <span className="flex h-[30px] w-[63px] items-center justify-center">
                  <UserPlus size={18} />
                </span>
                <span className="text-[16px] leading-none text-[#111]">
                  追蹤
                </span>
              </button>
            </div>

            <div className="rounded-[18px] bg-white px-5 py-6 shadow-sm">
              <div className="flex flex-col gap-6">
                <button type="button" className="flex items-center gap-7">
                  <AlertCircle size={18} />
                  <span className="text-[16px] text-[#111]">檢舉</span>
                </button>

                <button type="button" className="flex items-center gap-7">
                  <Ban size={18} />
                  <span className="text-[16px] text-[#111]">封鎖</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmArchiveOpen}
        title="確定典藏這篇貼文？"
        description="典藏後會從個人頁貼文牆隱藏，可到典藏內容頁恢復。"
        confirmText="確定典藏"
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
    </div>
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
            className="w-full max-w-[320px] overflow-hidden rounded-[24px] bg-white text-center shadow-xl"
            initial={{ opacity: 0, scale: 0.86, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >
            <div className="px-6 pb-5 pt-6">
              <div className="text-[18px] font-semibold text-[#111]">
                {title}
              </div>

              <div className="mt-2 text-[14px] leading-relaxed text-[#777]">
                {description}
              </div>
            </div>

            <button
              type="button"
              onClick={onConfirm}
              className={`h-[48px] w-full border-t border-[#eee] text-[16px] font-medium ${confirmClassName}`}
            >
              {confirmText}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="h-[48px] w-full border-t border-[#eee] text-[16px] text-[#333]"
            >
              取消
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}