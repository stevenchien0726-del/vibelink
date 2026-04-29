'use client'

import { useEffect, useState } from 'react'
import {
  BarChart3,
  Pin,
  MessageCircleMore,
  Archive,
  Trash2,
  UserPlus,
  AlertCircle,
  Ban,
} from 'lucide-react'

type Props = {
  onClose: () => void
  variant?: 'mine' | 'other'
}

export default function WideMenuSheet({ onClose, variant = 'other' }: Props) {
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
      className={`fixed inset-0 z-[999] flex justify-center transition-all duration-300 ${
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
        <div className="mb-8 flex justify-center">
          <div className="h-[4px] w-[40px] rounded-full bg-gray-400/60" />
        </div>

        {variant === 'mine' ? (
          <div className="rounded-[18px] bg-white px-5 py-6 shadow-sm">
            <div className="flex flex-col gap-6">
              <button className="flex items-center gap-7">
                <BarChart3 size={20} />
                <span className="text-[16px] text-[#111]">流量與互動</span>
              </button>

              <button className="flex items-center gap-7">
                <Pin size={20} />
                <span className="text-[16px] text-[#111]">釘選</span>
              </button>

              <button className="flex items-center gap-7">
                <MessageCircleMore size={20} />
                <span className="text-[16px] text-[#111]">變更可回復對象</span>
              </button>

              <button className="flex items-center gap-7">
                <Archive size={20} />
                <span className="text-[16px] text-[#111]">典藏貼文</span>
              </button>

              <button className="flex items-center gap-7 text-red-500">
                <Trash2 size={20} />
                <span className="text-[16px]">刪除貼文</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <button className="flex w-full items-center gap-1 rounded-[18px] bg-white px-5 py-8 shadow-sm">
                <span className="flex h-[30px] w-[63px] items-center justify-center">
                  <UserPlus size={18} />
                </span>
                <span className="text-[16px] leading-none text-[#111]">追蹤</span>
              </button>
            </div>

            <div className="rounded-[18px] bg-white px-5 py-6 shadow-sm">
              <div className="flex flex-col gap-6">
                <button className="flex items-center gap-7">
                  <AlertCircle size={18} />
                  <span className="text-[16px] text-[#111]">檢舉</span>
                </button>

                <button className="flex items-center gap-7">
                  <Ban size={18} />
                  <span className="text-[16px] text-[#111]">封鎖</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}