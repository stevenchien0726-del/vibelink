'use client'

import { useRef } from 'react'
import { AnimatePresence, motion, animate, useMotionValue, useTransform } from 'framer-motion'
import { Trash2 } from 'lucide-react'

type PeopleFolderPageProps = {
  title: string
  onClose: () => void
}

const mockUsers = Array.from({ length: 16 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: '(用戶名)',
}))

export default function PeopleFolderPage({
  title,
  onClose,
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

    // 只有往下拉，而且垂直意圖明確時才跟手指移動
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
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
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
              {mockUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="flex flex-col items-center"
                >
                  <div className="h-[62px] w-[62px] rounded-full bg-[#c893cf]" />
                  <div className="mt-3 text-[13px] text-[#555]">{user.name}</div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}