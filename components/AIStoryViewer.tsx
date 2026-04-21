'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Sparkles } from 'lucide-react'

type StoryPage = {
  id: number
  image: string
  tags: string[]
}

type Props = {
  userName: string
  story: StoryPage
  storyCount: number
  currentIndex: number
  progress: number
  onClose: () => void
  onNextPage: () => void
  onPrevPage: () => void
  onNextUser: () => void
  onPrevUser: () => void
  onPause: () => void
  onResume: () => void
}

export default function AIStoryViewer({
  userName,
  avatar,
  story,
  storyCount,
  currentIndex,
  progress,
  onClose,
  onNextPage,
  onPrevPage,
  onNextUser,
  onPrevUser,
  onPause,
  onResume,
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [closing, setClosing] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [dragX, setDragX] = useState(0)

  const touchStartYRef = useRef<number | null>(null)
  const touchStartXRef = useRef<number | null>(null)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isHoldingRef = useRef(false)
  const gestureLockRef = useRef<'none' | 'vertical' | 'horizontal'>('none')
  const didMoveRef = useRef(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }

  const finishClose = () => {
    setClosing(true)
    clearHoldTimer()
    onResume()

    setTimeout(() => {
      onClose()
    }, 220)
  }

  const handlePointerDown = () => {
    clearHoldTimer()
    holdTimerRef.current = setTimeout(() => {
      isHoldingRef.current = true
      onPause()
    }, 180)
  }

  const handlePointerUp = () => {
    clearHoldTimer()
    if (isHoldingRef.current) {
      isHoldingRef.current = false
      onResume()
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    touchStartYRef.current = touch.clientY
    touchStartXRef.current = touch.clientX
    gestureLockRef.current = 'none'
    didMoveRef.current = false

    clearHoldTimer()
    holdTimerRef.current = setTimeout(() => {
      isHoldingRef.current = true
      onPause()
    }, 180)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const startY = touchStartYRef.current
    const startX = touchStartXRef.current
    if (startY === null || startX === null) return

    const touch = e.touches[0]
    const deltaY = touch.clientY - startY
    const deltaX = touch.clientX - startX
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (absX > 8 || absY > 8) {
      didMoveRef.current = true
      clearHoldTimer()

      if (isHoldingRef.current) {
        isHoldingRef.current = false
        onResume()
      }
    }

    if (gestureLockRef.current === 'none') {
      if (absY > 14 && absY > absX) {
        gestureLockRef.current = 'vertical'
      } else if (absX > 14 && absX > absY) {
        gestureLockRef.current = 'horizontal'
      }
    }

    if (gestureLockRef.current === 'vertical') {
      if (deltaY > 0) {
        e.preventDefault()
        setDragY(deltaY)
      }
      return
    }

    if (gestureLockRef.current === 'horizontal') {
      e.preventDefault()
      setDragX(deltaX)
    }
  }

  const handleTouchEnd = () => {
    clearHoldTimer()

    if (isHoldingRef.current) {
      isHoldingRef.current = false
      onResume()
    }

    if (gestureLockRef.current === 'vertical') {
      if (dragY > 120) {
        finishClose()
      }
      setDragY(0)
    }

    if (gestureLockRef.current === 'horizontal') {
      if (dragX <= -70) {
        onNextUser()
      } else if (dragX >= 70) {
        onPrevUser()
      }
      setDragX(0)
    }

    touchStartYRef.current = null
    touchStartXRef.current = null
    gestureLockRef.current = 'none'
  }

  const scale = dragY > 0 ? 1 - Math.min(dragY / 1800, 0.08) : 1
  const opacity = dragY > 0 ? Math.max(0.6, 1 - dragY / 450) : 1

  return (
    <div
      className={`fixed inset-0 z-[300] transition-all duration-300 ${
        mounted && !closing ? 'bg-black/90 opacity-100' : 'bg-black/0 opacity-0'
      }`}
    >
      <div
        className="relative mx-auto h-full w-full max-w-[430px] overflow-hidden bg-black touch-pan-y"
        style={{
          transform: `translateX(${dragX}px) translateY(${dragY}px) scale(${scale})`,
          opacity,
          transition:
            dragX === 0 && dragY === 0
              ? 'transform 0.24s ease, opacity 0.24s ease'
              : 'none',
        }}
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={story.image}
          alt={userName}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/70" />

        <div className="absolute left-0 right-0 top-0 z-[20] px-4 pt-4">
          <div className="mb-3 flex gap-1">
            {Array.from({ length: storyCount }).map((_, index) => (
              <div
                key={index}
                className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/25"
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-white transition-[width] duration-75"
                  style={{
                    width:
                      index < currentIndex
                        ? '100%'
                        : index === currentIndex
                          ? `${progress}%`
                          : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <img
      src={avatar}
      alt={userName}
      className="h-10 w-10 rounded-full object-cover ring-1 ring-white/35"
      draggable={false}
    />
    <div className="text-[18px] font-semibold text-white">
      {userName}
    </div>
  </div>

  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation()
      finishClose()
    }}
    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm"
  >
    <X size={20} />
  </button>
</div>
        </div>

        <button
          type="button"
          aria-label="Previous story page"
          className="absolute left-0 top-0 z-[11] h-full w-1/2"
          onClick={(e) => {
            e.stopPropagation()
            if (!didMoveRef.current && !isHoldingRef.current) {
              onPrevPage()
            }
          }}
        />

        <button
          type="button"
          aria-label="Next story page"
          className="absolute right-0 top-0 z-[11] h-full w-1/2"
          onClick={(e) => {
            e.stopPropagation()
            if (!didMoveRef.current && !isHoldingRef.current) {
              onNextPage()
            }
          }}
        />

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[20] px-4 pb-7">
          <div className="mb-3 flex items-center gap-2 text-white">
            <Sparkles size={16} />
            <span className="text-[13px] font-semibold">AI 判讀標籤</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/90 px-3 py-[7px] text-[12px] font-medium text-[#5b4b8a]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}