'use client'

import { useEffect, useState } from 'react'
import { Bookmark, Send, UserPlus, AlertCircle, Ban } from 'lucide-react'

type Props = {
  onClose: () => void
}

export default function WideMenuSheet({ onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      onClose()
    }, 250)
  }

  return (
    <div
      className={`fixed inset-0 z-[200] flex justify-center transition-all duration-300 ${
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
        <div className="mb-4 flex justify-center">
          <div className="h-[4px] w-[40px] rounded-full bg-gray-400/60" />
        </div>

        {/* 收藏 / 分享：靠近 */}
        <div className="mb-6 flex justify-center gap-20">
          <button className="flex flex-col items-center gap-2">
            <Bookmark size={26} />
            <span className="text-sm text-[#111]">收藏</span>
          </button>

          <button className="flex flex-col items-center gap-2">
            <Send size={26} />
            <span className="text-sm text-[#111]">分享</span>
          </button>
        </div>

        {/* 追蹤：更寬 */}
        <div className="mb-8">
          <button className="flex w-full items-center gap-3 rounded-[18px] bg-white py-4 px-5 shadow-sm">
  <span className="flex h-[18px] w-[18px] items-center justify-center">
    <UserPlus size={18} />
  </span>
  <span className="text-[16px] leading-none text-[#111]">追蹤</span>
</button>
        </div>

        {/* 檢舉 / 封鎖：間距拉大 */}
        <div className="rounded-[18px] bg-white px-5 py-6 shadow-sm">
          <div className="flex flex-col gap-6">
            <button className="flex items-center gap-3">
  <span className="flex h-[18px] w-[18px] items-center justify-center">
    <AlertCircle size={18} />
  </span>
  <span className="text-[16px] leading-none text-[#111]">檢舉</span>
</button>

<button className="flex items-center gap-3">
  <span className="flex h-[18px] w-[18px] items-center justify-center">
    <Ban size={18} />
  </span>
  <span className="text-[16px] leading-none text-[#111]">封鎖</span>
</button>
          </div>
        </div>
      </div>
    </div>
  )
}