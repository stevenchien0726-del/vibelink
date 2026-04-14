'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, LayoutGroup } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Grid2x2,
  MapPin,
  Moon,
} from 'lucide-react'
import type { CapsulePosition } from '@/app/page'

type SettingsPageProps = {
  onClose: () => void
  capsulePosition: CapsulePosition
  initialDarkMode?: boolean
  initialShowCity?: boolean
  onCapsulePositionChange: (value: CapsulePosition) => void
  onDarkModeChange?: (value: boolean) => void
  onShowCityChange?: (value: boolean) => void
  onBlockedClick?: () => void
}

export default function SettingsPage({
  onClose,
  capsulePosition,
  initialDarkMode = false,
  initialShowCity = false,
  onCapsulePositionChange,
  onDarkModeChange,
  onShowCityChange,
  onBlockedClick,
}: SettingsPageProps) {
  const [darkMode, setDarkMode] = useState(initialDarkMode)
  const [showCity, setShowCity] = useState(initialShowCity)
  const [dragX, setDragX] = useState(0)
  const [isDraggingBack, setIsDraggingBack] = useState(false)

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const draggingEnabled = useRef(false)

  useEffect(() => {
    setDarkMode(initialDarkMode)
  }, [initialDarkMode])

  useEffect(() => {
    setShowCity(initialShowCity)
  }, [initialShowCity])

  const handleToggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    onDarkModeChange?.(next)
  }

  const handleToggleShowCity = () => {
    const next = !showCity
    setShowCity(next)
    onShowCityChange?.(next)
  }

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
  className="fixed inset-0 z-[220] flex justify-center bg-[#f3f3f3] touch-pan-y"
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

        <div className="px-4 pt-[72px] pb-10">
          <div className="rounded-[22px] bg-[#d9d9d9] px-4 py-4">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-[22px] w-[22px] items-center justify-center text-[#111]">
                  <Grid2x2 size={19} strokeWidth={2.1} />
                </span>

                <span className="text-[16px] font-medium text-[#222]">
                  自由化版面膠囊位置
                </span>
              </div>

              <LayoutGroup id="capsule-position-segment">
  <div className="grid grid-cols-3 gap-3">
    {(['左', '中', '右'] as CapsulePosition[]).map((item) => {
      const selected = capsulePosition === item

      return (
        <motion.button
          key={item}
          type="button"
          onClick={() => onCapsulePositionChange(item)}
          whileTap={{ scale: 1.05 }}
          transition={{
            type: 'spring',
            stiffness: 520,
            damping: 26,
          }}
          className="relative flex h-[42px] items-center justify-center overflow-hidden rounded-[14px] border border-[#ececec] bg-white text-[17px] font-medium text-[#222] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
        >
          {selected && (
            <motion.div
              layoutId="capsule-position-pill"
              className="absolute inset-0 rounded-[14px] bg-[#d9afe6]"
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 32,
              }}
            />
          )}

          <span className="relative z-10">{item}</span>
        </motion.button>
      )
    })}
  </div>
</LayoutGroup>
</div>

            <div className="my-4 h-px bg-[#bcbcbc]" />

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <span className="flex h-[22px] w-[22px] items-center justify-center text-[#111]">
                  <MapPin size={19} strokeWidth={2.1} />
                </span>

                <span className="text-[16px] font-medium text-[#222]">
                  顯示IP所在城市
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[16px] text-[#222]">
                  {showCity ? '開啟中' : '關閉中'}
                </span>

                <Switch checked={showCity} onClick={handleToggleShowCity} />
              </div>
            </div>

            <div className="my-4 h-px bg-[#bcbcbc]" />

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <span className="flex h-[22px] w-[22px] items-center justify-center text-[#111]">
                  <Moon size={19} strokeWidth={2.1} />
                </span>

                <span className="text-[16px] font-medium text-[#222]">
                  深色模式
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[16px] text-[#222]">
                  {darkMode ? '開啟中' : '關閉中'}
                </span>

                <Switch checked={darkMode} onClick={handleToggleDarkMode} />
              </div>
            </div>
          </div>

          <div className="mt-[22px]">
  <button
    type="button"
    onClick={onBlockedClick}
    className="flex w-full items-center justify-between rounded-[18px] bg-white px-5 py-[20px] text-left shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition active:scale-[0.985]"
  >
    <span className="text-[16px] font-medium text-[#222]">已封鎖</span>
    <ChevronRight size={20} className="text-[#444]" />
  </button>
</div>
        </div>
      </div>
    </motion.div>
  )
}

function Switch({
  checked,
  onClick,
}: {
  checked: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className="relative h-[28px] w-[48px] rounded-full bg-[#f3f3f3] transition-colors duration-250"
    >
      <span
        className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-[#d39ad8] shadow-sm transition-all duration-250 ${
          checked ? 'left-[23px]' : 'left-[3px]'
        }`}
      />
    </button>
  )
}