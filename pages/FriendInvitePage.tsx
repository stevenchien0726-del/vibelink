'use client'

import { Mail, Menu } from 'lucide-react'

type FriendInvitePageProps = {
  onClose: () => void
}

export default function FriendInvitePage({ onClose }: FriendInvitePageProps) {
  const dummyUsers = Array.from({ length: 6 })

  return (
    <div className="fixed inset-0 z-[120] flex justify-center bg-black/30">
      <div className="relative w-full max-w-[430px] bg-[#f3f3f3]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <Mail size={22} />
            <span className="text-[18px] font-semibold">我的好友邀請</span>

            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[12px] text-white">
              2
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-[#e5e5e5] px-4 py-1.5 text-[13px]"
          >
            CLOSE
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 px-4 pb-24">
          {dummyUsers.map((_, index) => (
            <div
              key={index}
              className="relative h-[220px] rounded-[24px] bg-[#d9c6df] p-3"
            >
              <div className="absolute right-3 top-3">
                <Menu size={18} />
              </div>

              <div className="flex h-full flex-col justify-between">
  
  {/* 上方空白內容（或未來放圖片） */}
  <div />

  {/* 底部按鈕 */}
  <button className="h-10 rounded-full bg-[#e5dbe9] text-[14px] font-medium">
    接受邀請
  </button>

</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}