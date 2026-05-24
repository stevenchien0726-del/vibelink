'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Plus,
  LogOut,
  Lock,
  TriangleAlert,
} from 'lucide-react'

type AccountManagePageProps = {
  onClose: () => void
}

export default function AccountManagePage({
  onClose,
}: AccountManagePageProps) {
  const [dragX, setDragX] = useState(0)
  const [isDraggingBack, setIsDraggingBack] = useState(false)

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const draggingEnabled = useRef(false)

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()

    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    draggingEnabled.current = touch.clientX <= 32
    setIsDraggingBack(false)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()

    if (!draggingEnabled.current) return
    if (touchStartX.current == null || touchStartY.current == null) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current

    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
      draggingEnabled.current = false
      setIsDraggingBack(false)
      setDragX(0)
      return
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault()
    }

    if (deltaX > 0) {
      setIsDraggingBack(true)
      setDragX(deltaX)
    } else {
      setIsDraggingBack(false)
      setDragX(0)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()

    if (!draggingEnabled.current) {
      touchStartX.current = null
      touchStartY.current = null
      return
    }

    if (dragX > 90) {
      setDragX(0)
      setIsDraggingBack(false)
      onClose()
    } else {
      setDragX(0)
      setIsDraggingBack(false)
    }

    touchStartX.current = null
    touchStartY.current = null
    draggingEnabled.current = false
  }

  return (
    <motion.div
      className="fixed inset-0 z-[230] flex justify-center bg-[var(--app-bg)] touch-pan-y"
      initial={{ x: '100%' }}
      animate={{ x: dragX }}
      exit={{ x: '100%' }}
      transition={
        isDraggingBack
          ? { duration: 0 }
          : {
              duration: 0.34,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative min-h-screen w-full max-w-[430px] bg-[var(--app-bg)] text-[var(--app-text)]">
        <div className="fixed top-0 left-1/2 z-[30] w-full max-w-[430px] -translate-x-1/2 border-b border-[var(--app-card-border)] bg-[var(--app-bg)]/95 px-4 pt-3 pb-3 backdrop-blur-md">
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              aria-label="返回"
              onClick={onClose}
              className="absolute left-0 flex h-[40px] w-[40px] items-center justify-center rounded-full text-[var(--app-text)] active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="text-[20px] font-medium tracking-[0.01em] text-[var(--app-text)]">
              帳號管理
            </div>
          </div>
        </div>

        <div className="px-4 pt-[78px] pb-10">
          <div className="overflow-hidden rounded-[24px] border border-[var(--app-card-border)] bg-[var(--app-card)] py-[12px]">
            <AccountMainRow
              icon={
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[var(--app-surface)] text-[var(--app-text)]">
                  <CircleUserRound size={25} strokeWidth={1.9} />
                </div>
              }
              title="Sky_07_21"
              subtitle="Vibelink帳號"
              trailing={<ChevronRight size={18} strokeWidth={2.4} className="text-[var(--app-muted)]" />}
            />

            <GroupDivider />

            <AccountMainRow
              icon={
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[var(--app-surface)] text-[var(--app-text)]">
                  <Plus size={25} strokeWidth={2.1} />
                </div>
              }
              title="新增Vibelink帳號"
              subtitle="建立和切換身分"
              trailing={<ChevronRight size={18} strokeWidth={2.4} className="text-[var(--app-muted)]" />}
            />
          </div>

          <div className="mt-[22px] overflow-hidden rounded-[24px] border border-[var(--app-card-border)] bg-[var(--app-card)] py-[20px]">
            <AccountActionRow
              icon={<LogOut size={21} strokeWidth={2.1} />}
              label="登出"
            />

            <GroupDivider />

            

            <AccountActionRow
              icon={<TriangleAlert size={21} strokeWidth={2.1} />}
              label="停用或刪除(危險區)"
              trailing={<Lock size={18} strokeWidth={2.1} className="text-[var(--app-muted)]" />}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AccountMainRow({
  icon,
  title,
  subtitle,
  trailing,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  trailing: React.ReactNode
}) {
  return (
    <button
      type="button"
      className="grid w-full grid-cols-[56px_minmax(0,1fr)_28px] items-center gap-x-4 py-[18px] pl-[50px] pr-[18px] text-left active:bg-white/10"
    >
      <div className="flex items-center justify-center">
        {icon}
      </div>

      <div className="flex min-w-0 flex-col">
        <span className="text-[16px] font-medium text-[var(--app-text)]">
          {title}
        </span>
        <span className="mt-1 text-[13px] text-[var(--app-muted)]">
          {subtitle}
        </span>
      </div>

      <div className="flex items-center justify-center">
        {trailing}
      </div>
    </button>
  )
}

function AccountActionRow({
  icon,
  label,
  trailing,
}: {
  icon: React.ReactNode
  label: string
  trailing?: React.ReactNode
}) {
  return (
    <button
      type="button"
      className="grid w-full grid-cols-[54px_minmax(0,1fr)_28px] items-center gap-x-4 py-[26px] pl-[22px] pr-[18px] text-left active:bg-white/10"
    >
      <div className="flex items-center justify-center text-[var(--app-text)]">
        {icon}
      </div>

      <span className="text-[16px] font-medium text-[var(--app-text)]">
        {label}
      </span>

      <div className="flex items-center justify-center text-[var(--app-muted)]">
        {trailing ?? <span />}
      </div>
    </button>
  )
}

function GroupDivider() {
  return <div className="mx-[30px] my-[15px] h-px bg-[var(--app-card-border)]" />
}