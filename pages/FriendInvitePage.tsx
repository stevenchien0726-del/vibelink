'use client'

import { useEffect, useState } from 'react'
import { Mail, Menu } from 'lucide-react'

type FriendInvitePageProps = {
  onClose: () => void
}

export default function FriendInvitePage({ onClose }: FriendInvitePageProps) {
  const dummyUsers = Array.from({ length: 6 })
  const [closing, setClosing] = useState(false)
  const [mounted, setMounted] = useState(false)

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
    }, 260)
  }

  return (
    <div
      className={`fixed inset-0 z-[120] flex justify-center transition-all duration-[260ms] ease-out ${
        mounted && !closing ? 'bg-black/30 opacity-100' : 'bg-black/0 opacity-0'
      }`}
    >
      <div
        className={`relative min-h-screen w-full max-w-[430px] origin-bottom transition-all duration-[260ms] ease-out ${
          mounted && !closing
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-6 scale-[0.92] opacity-0'
        } bg-[#f3f3f3]`}
      >
        {/* Header */}
        <div className="sticky top-0 z-[10] flex items-center justify-between bg-[#f3f3f3] px-4 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <Mail size={22} />
            <span className="text-[18px] font-semibold">我的好友邀請</span>

            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[12px] text-white">
              2
            </div>
          </div>

          <button
            onClick={handleClose}
            className="rounded-full bg-[#e5e5e5] px-4 py-1.5 text-[13px]"
          >
            CLOSE
          </button>
        </div>

        {/* Scroll Content */}
        <div className="px-4 pb-[20px]">
          <div className="grid grid-cols-2 gap-4">
            {dummyUsers.map((_, index) => (
              <div
                key={index}
                className="relative h-[220px] rounded-[24px] bg-[#d9c6df] p-3"
              >
                <div className="absolute right-3 top-3">
                  <Menu size={18} />
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

        {/* 底部覆蓋層 */}
        <div className="pointer-events-none fixed bottom-0 left-1/2 z-[130] h-[110px] w-full max-w-[430px] -translate-x-1/2 bg-[#f3f3f3]" />
      </div>
    </div>
  )
}