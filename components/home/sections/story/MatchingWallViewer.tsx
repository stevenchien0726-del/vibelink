'use client'

import { useMemo, useState } from 'react'

type MatchingWallViewerProps = {
  open: boolean
  onClose: () => void
  userName?: string
}

const mockPhotos = [
  '/images/match-1.jpg',
  '/images/match-2.jpg',
  '/images/match-3.jpg',
  '/images/match-4.jpg',
  '/images/match-5.jpg',
]

export default function MatchingWallViewer({
  open,
  onClose,
  userName = 'Sky.07_21',
}: MatchingWallViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const total = mockPhotos.length
  const currentPhoto = mockPhotos[currentIndex]

  const progressBars = useMemo(() => {
    return mockPhotos.map((_, index) => {
      if (index < currentIndex) return 'bg-[#6e6e6e]'
      if (index === currentIndex) return 'bg-white'
      return 'bg-white/55'
    })
  }, [currentIndex])

  function goNext() {
    setCurrentIndex((prev) => {
      if (prev >= total - 1) return total - 1
      return prev + 1
    })
  }

  function goPrev() {
    setCurrentIndex((prev) => {
      if (prev <= 0) return 0
      return prev - 1
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] bg-white">
      <div className="mx-auto h-full w-full max-w-[430px] bg-[#f3f3f3]">
        <div className="relative h-full w-full overflow-hidden">
          {/* 照片主畫面：從頂部延伸到底部 */}
          <div className="absolute inset-0">
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt={`matching-wall-${currentIndex + 1}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[#d7b0db]" />
            )}
          </div>

          {/* 上方淡色遮罩，讓 header 更清楚 */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-black/20 to-transparent" />

          {/* 頂部進度條 */}
          <div className="absolute left-4 right-4 top-4 z-[3] flex gap-2">
            {progressBars.map((barClass, index) => (
              <div
                key={index}
                className={`h-[6px] flex-1 rounded-full ${barClass}`}
              />
            ))}
          </div>

          {/* 頂部資訊列 */}
          <div className="absolute left-0 right-0 top-0 z-[4] flex items-center justify-between px-4 pt-7">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-[#d9d9d9]" />
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-medium text-white drop-shadow-sm">
                  {userName}
                </span>
                <span className="text-[18px] text-white drop-shadow-sm">⋯</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-[15px] font-medium text-white drop-shadow-sm"
            >
              CLOSE
            </button>
          </div>

          {/* 左右點擊區 */}
          <button
            type="button"
            aria-label="上一張"
            onClick={goPrev}
            className="absolute left-0 top-0 z-[2] h-full w-1/2"
          />

          <button
            type="button"
            aria-label="下一張"
            onClick={goNext}
            className="absolute right-0 top-0 z-[2] h-full w-1/2"
          />

          {/* 中央可選說明文字 */}
          <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center px-6">
            <div className="rounded-full bg-black/10 px-4 py-2 text-[15px] text-white/90 backdrop-blur-[2px]">
              配對牆點開頁面內容
            </div>
          </div>

          {/* 底部漸層遮罩 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[180px] bg-gradient-to-t from-black/30 to-transparent" />

          {/* 底部功能列：覆蓋在照片上 */}
          <div className="absolute bottom-4 left-4 right-4 z-[5]">
            <div className="grid grid-cols-3 gap-2 rounded-[22px] bg-[#ead7ef]/92 p-2 backdrop-blur-md">
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1 rounded-[16px] py-3 text-[#222]"
              >
                <span className="text-[22px]">🖼️</span>
                <span className="text-[16px]">他的檔案</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1 rounded-[16px] py-3 text-[#222]"
              >
                <span className="text-[25px]">♡</span>
                <span className="text-[16px]">喜歡</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1 rounded-[16px] bg-white/45 py-3 text-[#222]"
              >
                <span className="text-[22px]">✉️</span>
                <span className="text-[16px]">發送邀請</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}