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

type PickedUser = {
  id: string
  name: string
  avatar: string
}

type PickUserPayload = {
  user: PickedUser
  sourceRect: DOMRect
}

type PeopleFolderPageProps = {
  title: string
  folderId: string
  onClose: () => void
  onPickUser?: (payload: PickUserPayload) => void
}

const RECENT_PRIMARY_USER: PickedUser = {
  id: 'user-1',
  name: 'Sky_07_21',
  avatar:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
}

const mockUsers = Array.from({ length: 16 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: '(用戶名)',
}))

export default function PeopleFolderPage({
  title,
  folderId,
  onClose,
  onPickUser,
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

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-[260] bg-[rgba(243,243,243,0.96)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ opacity: overlayOpacity }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          className="relative min-h-screen w-full bg-[#f3f3f3]"
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
          <div className="flex items-center justify-between px-5 pb-3 pt-4">
            <div className="truncate text-[16px] font-medium text-[#222]">
              {title}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                className="grid h-[28px] w-[28px] place-items-center text-[#111]"
              >
                <Trash2 size={21} strokeWidth={2.2} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-[14px] font-medium text-[#111]"
              >
                CLOSE
              </button>
            </div>
          </div>

          <div className="px-5 pb-[120px]">
            <div className="grid grid-cols-4 gap-x-5 gap-y-8">
              <button
                type="button"
                onClick={(e) => {
                  if (folderId === 'recent') {
                    const sourceRect = (
                      e.currentTarget as HTMLButtonElement
                    ).getBoundingClientRect()

                    onPickUser?.({
                      user: RECENT_PRIMARY_USER,
                      sourceRect,
                    })
                  }
                }}
                className="flex flex-col items-center active:scale-95"
              >
                {folderId === 'recent' ? (
                  <img
                    src={RECENT_PRIMARY_USER.avatar}
                    alt={RECENT_PRIMARY_USER.name}
                    className="h-[62px] w-[62px] rounded-full object-cover"
                  />
                ) : (
                  <div className="h-[62px] w-[62px] rounded-full bg-[#c893cf]" />
                )}

                <div className="mt-3 text-[13px] text-[#555]">
                  {folderId === 'recent'
                    ? RECENT_PRIMARY_USER.name
                    : '(用戶名)'}
                </div>
              </button>

              {mockUsers.slice(1).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="flex flex-col items-center active:scale-95"
                >
                  <div className="h-[62px] w-[62px] rounded-full bg-[#c893cf]" />
                  <div className="mt-3 text-[13px] text-[#555]">
                    {user.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}