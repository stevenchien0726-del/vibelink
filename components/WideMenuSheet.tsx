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
          mounted && !closing
            ? 'translate-y-0'
            : 'translate-y-full'
        }`}
      >
        {/* 🔹 上方拖曳條 */}
        <div className="mb-4 flex justify-center">
          <div className="h-[4px] w-[40px] rounded-full bg-gray-400/60" />
        </div>

        {/* 🔹 收藏 / 分享 */}
        <div className="flex justify-around mb-6">
          <button className="flex flex-col items-center gap-2">
            <Bookmark size={26} />
            <span className="text-sm">收藏</span>
          </button>

          <button className="flex flex-col items-center gap-2">
            <Send size={26} />
            <span className="text-sm">分享</span>
          </button>
        </div>

        {/* 🔹 追蹤 */}
        <div className="mb-5">
          <button className="w-full rounded-xl bg-white py-4 flex items-center justify-center gap-2 shadow-sm">
            <UserPlus size={18} />
            <span>追蹤</span>
          </button>
        </div>

        {/* 🔹 檢舉 / 封鎖 */}
        <div className="rounded-xl bg-white p-4 space-y-4 shadow-sm">
          <button className="flex items-center gap-3">
            <AlertCircle size={18} />
            <span>檢舉</span>
          </button>

          <button className="flex items-center gap-3">
            <Ban size={18} />
            <span>封鎖</span>
          </button>
        </div>
      </div>
    </div>
  )
}