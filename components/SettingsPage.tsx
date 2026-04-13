'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronDown, Check, ChevronRight } from 'lucide-react'

type CapsulePosition = '左' | '中' | '右'

type SettingsPageProps = {
  onClose: () => void
  initialCapsulePosition?: CapsulePosition
  initialDarkMode?: boolean
  onCapsulePositionChange?: (value: CapsulePosition) => void
  onDarkModeChange?: (value: boolean) => void
  onBlockedClick?: () => void
}

export default function SettingsPage({
  onClose,
  initialCapsulePosition = '中',
  initialDarkMode = false,
  onCapsulePositionChange,
  onDarkModeChange,
  onBlockedClick,
}: SettingsPageProps) {
  const [capsulePosition, setCapsulePosition] =
    useState<CapsulePosition>(initialCapsulePosition)
  const [darkMode, setDarkMode] = useState(initialDarkMode)
  const [positionMenuOpen, setPositionMenuOpen] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [isDraggingBack, setIsDraggingBack] = useState(false)

  const menuRef = useRef<HTMLDivElement | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const draggingEnabled = useRef(false)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) {
        setPositionMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  const handleSelectPosition = (value: CapsulePosition) => {
    setCapsulePosition(value)
    onCapsulePositionChange?.(value)
    setPositionMenuOpen(false)
  }

  const handleToggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    onDarkModeChange?.(next)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY

    draggingEnabled.current = touch.clientX <= 32
    setIsDraggingBack(false)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
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

    if (deltaX > 0) {
      setIsDraggingBack(true)
      setDragX(deltaX)
    } else {
      setIsDraggingBack(false)
      setDragX(0)
    }
  }

  const handleTouchEnd = () => {
    if (!draggingEnabled.current) {
      touchStartX.current = null
      touchStartY.current = null
      return
    }

    if (dragX > 90) {
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
      className="fixed inset-0 z-[220] flex justify-center bg-[#f3f3f3]"
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
      <div className="relative min-h-screen w-full max-w-[430px] bg-[#f3f3f3] text-[#222]">
        <div className="fixed top-0 left-1/2 z-[30] w-full max-w-[430px] -translate-x-1/2 bg-[#f3f3f3]/95 px-4 pt-3 pb-3 backdrop-blur-md">
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              aria-label="返回"
              onClick={onClose}
              className="absolute left-0 flex h-[40px] w-[40px] items-center justify-center rounded-full active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="text-[20px] font-medium tracking-[0.01em]">設定</div>
          </div>
        </div>

        <div className="px-4 pt-[72px] pb-8">
          <div className="space-y-3">
            <div className="rounded-[16px] bg-[#d9d9d9] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[16px] font-medium text-[#222]">
                  自由化版面膠囊位置
                </div>

                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setPositionMenuOpen((prev) => !prev)}
                    className="flex min-w-[78px] items-center justify-between rounded-[14px] bg-[#efefef] px-4 py-[10px] text-[16px] text-[#222] shadow-sm active:scale-[0.98]"
                  >
                    <span>{capsulePosition}</span>
                    <ChevronDown size={16} className="ml-2" />
                  </button>

                  <AnimatePresence>
                    {positionMenuOpen && (
                      <motion.div
                        className="absolute right-0 top-[calc(100%+8px)] z-[40] w-[92px] overflow-hidden rounded-[16px] bg-[#f5f5f5] shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{
                          duration: 0.18,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        {(['左', '中', '右'] as CapsulePosition[]).map((item) => {
                          const selected = capsulePosition === item

                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => handleSelectPosition(item)}
                              className="flex w-full items-center justify-between px-4 py-3 text-[16px] text-[#222] transition hover:bg-[#ececec] active:bg-[#e7e7e7]"
                            >
                              <span>{item}</span>
                              {selected ? <Check size={16} strokeWidth={2.6} /> : <span className="w-4" />}
                            </button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="rounded-[16px] bg-[#d9d9d9] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[16px] font-medium text-[#222]">深色模式</div>

                <div className="flex items-center gap-3">
                  <div className="text-[16px] text-[#222]">
                    {darkMode ? '開' : '關閉中'}
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={darkMode}
                    onClick={handleToggleDarkMode}
                    className={`relative h-[30px] w-[58px] rounded-full transition-colors duration-250 ${
                      darkMode ? 'bg-[#ead5ef]' : 'bg-[#f1f1f1]'
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-[22px] w-[22px] rounded-full bg-[#d89ad0] shadow-sm transition-all duration-250 ${
                        darkMode ? 'left-[32px]' : 'left-[4px]'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onBlockedClick}
              className="flex w-full items-center justify-between rounded-[16px] bg-[#d9d9d9] p-3 text-left text-[16px] font-medium text-[#222] transition active:scale-[0.995]"
            >
              <span>已封鎖</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}