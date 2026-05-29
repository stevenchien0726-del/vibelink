'use client'

import { useRef } from 'react'
import {
  AnimatePresence,
  motion,
  animate,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { uiText } from '@/lib/uiText'

export type FolderUser = {
  id: string
  name: string
  avatar: string
}

export type FolderUsersMap = Record<string, FolderUser[]>

type PickUserPayload = {
  user: FolderUser
  sourceRect: DOMRect
}

type PeopleFolderPageProps = {
  title: string
  users: FolderUser[]
  onClose: () => void
  onPickUser?: (payload: PickUserPayload) => void
  onOpenProfile?: (userId: string) => void
}

export default function PeopleFolderPage({
  title,
  users,
  onClose,
  onPickUser,
  onOpenProfile,
}: PeopleFolderPageProps) {
  const touchStartYRef = useRef<number | null>(null)
  const touchStartXRef = useRef<number | null>(null)

  const dragY = useMotionValue(0)
  const overlayOpacity = useTransform(dragY, [0, 260], [1, 0.72])
  const pageScale = useTransform(dragY, [0, 260], [1, 0.975])

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0]
    touchStartYRef.current = touch.clientY
    touchStartXRef.current = touch.clientX
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const startY = touchStartYRef.current
    const startX = touchStartXRef.current
    if (startY == null || startX == null) return

    const touch = e.touches[0]
    const deltaY = touch.clientY - startY
    const deltaX = Math.abs(touch.clientX - startX)

    if (deltaY > 0 && deltaX < 70) {
      e.preventDefault()
      dragY.set(deltaY)
    }
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    const startY = touchStartYRef.current
    const startX = touchStartXRef.current

    if (startY == null || startX == null) return

    const touch = e.changedTouches[0]
    const deltaY = touch.clientY - startY
    const deltaX = Math.abs(touch.clientX - startX)

    touchStartYRef.current = null
    touchStartXRef.current = null

    if (deltaY > 120 && deltaX < 70) {
      animate(dragY, 520, {
        duration: 0.22,
        ease: [0.22, 1, 0.36, 1],
        onComplete: onClose,
      })
      return
    }

    animate(dragY, 0, {
      type: 'spring',
      stiffness: 420,
      damping: 32,
      mass: 0.9,
    })
  }

  function handlePickUser(
    user: FolderUser,
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    const sourceRect = e.currentTarget.getBoundingClientRect()

    if (onPickUser) {
      onPickUser({
        user,
        sourceRect,
      })
      return
    }

    onOpenProfile?.(user.id)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-[260] bg-[var(--app-bg)]/95 text-[var(--app-text)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ opacity: overlayOpacity }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          className="relative min-h-screen w-full bg-[var(--app-bg)]"
          initial={{ y: 28, opacity: 0, scale: 0.985 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 36, opacity: 0, scale: 0.985 }}
          transition={{
            duration: 0.24,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            y: dragY,
            scale: pageScale,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center justify-between border-b border-[var(--app-card-border)] bg-[var(--app-bg)]/95 px-5 pb-3 pt-4 backdrop-blur-md">
            <div className="truncate text-[16px] font-medium text-[var(--app-text)]">
              {title}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                className="grid h-[28px] w-[28px] place-items-center text-[var(--app-text)] active:scale-95"
              >
                <Trash2 size={21} strokeWidth={2.2} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-[14px] font-medium text-[var(--app-text)] active:scale-95"
              >
                {uiText('關閉', 'CLOSE')}
              </button>
            </div>
          </div>

          <div className="px-5 pb-[120px] pt-5">
            {users.length > 0 ? (
              <div className="grid grid-cols-4 gap-x-5 gap-y-8">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={(e) => handlePickUser(user, e)}
                    className="flex flex-col items-center active:scale-95"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-[62px] w-[62px] rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-[62px] w-[62px] rounded-full border border-[var(--app-card-border)] bg-[#b8b8b8]/45" />
                    )}

                    <div className="mt-3 max-w-[72px] truncate text-[13px] text-[var(--app-muted)]">
                      {user.name}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-[18px] border border-[var(--app-card-border)] bg-[var(--app-card)] px-4 py-5 text-center text-[14px] text-[var(--app-muted)]">
                {uiText('目前沒有用戶', 'No users yet')}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
