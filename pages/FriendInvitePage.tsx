'use client'

import { useEffect, useRef, useState } from 'react'
import { Mail, MoreHorizontal } from 'lucide-react'
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
} from 'framer-motion'

type FriendInvitePageProps = {
  onClose: () => void
}

export default function FriendInvitePage({ onClose }: FriendInvitePageProps) {
  const dummyUsers = Array.from({ length: 8 })
  const [closing, setClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isPullingSheet, setIsPullingSheet] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchStartXRef = useRef<number | null>(null)

  const sheetY = useMotionValue(0)
  const overlayOpacity = useTransform(sheetY, [0, 320], [1, 0.72])
  const sheetScale = useTransform(sheetY, [0, 320], [1, 0.97])

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  const closeWithAnimation = () => {
    setClosing(true)
    animate(sheetY, 560, {
      duration: 0.24,
      ease: [0.22, 1, 0.36, 1],
      onComplete: onClose,
    })
  }

  const handleClose = () => {
    closeWithAnimation()
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0]
    touchStartYRef.current = touch.clientY
    touchStartXRef.current = touch.clientX
    setIsPullingSheet(false)
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const startY = touchStartYRef.current
    const startX = touchStartXRef.current
    const scrollEl = scrollRef.current

    if (startY == null || startX == null || !scrollEl) return

    const touch = e.touches[0]
    const deltaY = touch.clientY - startY
    const deltaX = Math.abs(touch.clientX - startX)
    const atTop = scrollEl.scrollTop <= 0

    // 只有在內容已經滑到頂部，且手指明確往下拉時，才開始拖動整頁
    if (atTop && deltaY > 0 && deltaX < 80) {
      setIsPullingSheet(true)
      e.preventDefault()
      sheetY.set(deltaY)
      return
    }

    if (isPullingSheet) {
      e.preventDefault()
    }
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    const startY = touchStartYRef.current
    const startX = touchStartXRef.current

    if (startY == null || startX == null) {
      setIsPullingSheet(false)
      return
    }

    const touch = e.changedTouches[0]
    const deltaY = touch.clientY - startY
    const deltaX = Math.abs(touch.clientX - startX)

    touchStartYRef.current = null
    touchStartXRef.current = null

    if (isPullingSheet && deltaY > 150 && deltaX < 80) {
      setIsPullingSheet(false)
      closeWithAnimation()
      return
    }

    if (isPullingSheet) {
      animate(sheetY, 0, {
        type: 'spring',
        stiffness: 420,
        damping: 34,
        mass: 0.9,
      })
    }

    setIsPullingSheet(false)
  }

  return (
    <motion.div
      className={`fixed inset-0 z-[120] flex justify-center transition-all duration-[260ms] ease-out ${
        mounted && !closing ? 'bg-black/30' : 'bg-black/0'
      }`}
      style={{ opacity: overlayOpacity }}
    >
      <motion.div
        style={{
          y: sheetY,
          scale: sheetScale,
        }}
        className={`relative h-screen w-full max-w-[430px] origin-bottom overflow-hidden bg-[#f3f3f3] transition-all duration-[260ms] ease-out ${
          mounted && !closing
            ? 'translate-y-0 opacity-100'
            : 'translate-y-6 opacity-0'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="sticky top-0 z-[20] flex items-center justify-between bg-[#f3f3f3] px-4 pt-4 pb-3">
          <div className="flex items-center gap-[10px]">
            <Mail size={22} />
            <span className="text-[18px] font-semibold">我的好友邀請</span>

            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-black text-[15px] font-semibold leading-none text-black">
              ?
            </div>
          </div>

          <button
            onClick={handleClose}
            className="rounded-full bg-[#e5e5e5] px-4 py-1.5 text-[13px]"
          >
            CLOSE
          </button>
        </div>

        <div
  ref={scrollRef}
  className="h-[calc(100vh-72px)] overflow-y-auto px-4 pb-[120px] scrollbar-hide"
>
  
          <div className="grid grid-cols-2 gap-x-5 gap-y-6">
            {dummyUsers.map((_, index) => (
              <div
                key={index}
                className="relative h-[280px] rounded-[24px] bg-[#d9c6df] p-3"
              >
                <div className="absolute right-3 top-3 text-[#111]">
                  <MoreHorizontal size={18} strokeWidth={2.2} />
                </div>

                <div className="flex h-full flex-col justify-between">
                  <div />

                  <button className="h-10 rounded-full bg-[#e5dbe9] text-[14px] font-medium">
                    接受邀請
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[10] h-[24px] bg-gradient-to-t from-[#f3f3f3] to-transparent" />
      </motion.div>
    </motion.div>
  )
}