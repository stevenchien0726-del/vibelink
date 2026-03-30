'use client'

import { useState } from 'react'
import { Search, UserRound, Mail, Heart, SquarePen, Users } from 'lucide-react'
import PeopleLibraryPage from '@/components/home/sections/people/PeopleLibraryPage'
import FriendInvitePage from '@/pages/FriendInvitePage'
import RightNowPage from '@/pages/RightNowPage'

type MessagePageProps = {
  onOpenMenu?: () => void
}

const tabs = ['全部', '最愛', '追蹤中']

export default function MessagePage({ onOpenMenu }: MessagePageProps) {
  const [isPeopleLibraryOpen, setIsPeopleLibraryOpen] = useState(false)
  const [isFriendInviteOpen, setIsFriendInviteOpen] = useState(false)
  const [isRightNowOpen, setIsRightNowOpen] = useState(false)

  return (
    <div className="relative flex min-h-[calc(100vh-156px)] flex-col bg-transparent px-4 pt-0 pb-2">
      <div className="mb-3 text-[14px] font-medium text-white/30">訊息介面</div>

      <div className="relative flex-1 pb-4">
        {/* Top controls */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            className="flex h-[35px] flex-1 items-center rounded-full bg-[#d9d9d9] px-6"
          >
            <Search size={26} strokeWidth={2.2} className="text-black" />
          </button>

          <button
  type="button"
  onClick={onOpenMenu}
  className="ml-auto flex h-[44px] min-w-[124px] items-center justify-end gap-6 rounded-full bg-[#d9d9d9] px-6"
>
  <SquarePen size={26} strokeWidth={2.2} className="text-black" />
  <Users size={26} strokeWidth={2.2} className="text-black" />
</button>
        </div>

        {/* Top feature buttons */}
        <div className="relative z-[20] mb-5 grid grid-cols-3 items-start gap-3 text-center">
          <button
  type="button"
  onClick={() => setIsPeopleLibraryOpen(true)}
  className="flex flex-col items-center"
>
  <UserRound size={48} strokeWidth={2.1} className="mb-2 text-black" />
  <span className="text-[15px] text-[#222]">People Library</span>
</button>

          <button
            type="button"
            onClick={() => setIsFriendInviteOpen(true)}
            className="flex flex-col items-center"
          >
            <Mail size={48} strokeWidth={2.1} className="mb-2 text-black" />
            <span className="text-[15px] text-[#222]">好友邀請</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRightNowOpen(true)}
            className="flex flex-col items-center"
          >
            <Heart
              size={48}
              strokeWidth={2.1}
              className="mb-2 fill-[#d89ad0] text-black"
            />
            <span className="text-[15px] text-[#222]">Right now</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex h-[32px] items-center rounded-full bg-[#d9d9d9] p-[3px]">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={`flex-1 rounded-full px-2 py-[5px] text-[15px] text-[#222] ${
                index === 0 ? 'bg-[#d8b3d8]' : 'bg-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dummy list */}
        <div className="flex flex-col gap-7">
          {Array.from({ length: 5 }).map((_, index) => (
            <button
              key={index}
              type="button"
              className="flex items-center gap-4 text-left"
            >
              <div className="h-[58px] w-[58px] rounded-full bg-[#d9d9d9]" />
            </button>
          ))}
        </div>
      </div>

      {/* Overlays */}
      {isPeopleLibraryOpen && (
        <PeopleLibraryPage
  onClose={() => setIsPeopleLibraryOpen(false)}
/>
      )}

      {isFriendInviteOpen && (
        <FriendInvitePage onClose={() => setIsFriendInviteOpen(false)} />
      )}

      {isRightNowOpen && (
        <RightNowPage onClose={() => setIsRightNowOpen(false)} />
      )}

    </div>
  )
}