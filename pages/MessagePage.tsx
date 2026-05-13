'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  Check,
  PencilLine,
  Search,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import PeopleLibraryPage from '@/components/home/sections/people/PeopleLibraryPage'

import OtherUserProfilePage from '@/components/profile/OtherUserProfilePage'

type MessagePageProps = {
  onOpenMenu?: () => void
}

const searchAccounts = [
  { id: 'u1', name: 'Ryan_88', sub: '最近追蹤' },
  { id: 'u2', name: 'Leo_wave', sub: '較常互動' },
  { id: 'u3', name: 'Mina.day', sub: 'People Library' },
  { id: 'u4', name: 'Vibe_Alice', sub: '可能認識的人' },
  { id: 'u5', name: 'Neo_77', sub: '官方推薦' },
]


export default function MessagePage({ onOpenMenu }: MessagePageProps) {
  const [isPeopleLibraryOpen, setIsPeopleLibraryOpen] = useState(false)
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null)
  
  const [isTopCapsulePressed, setIsTopCapsulePressed] = useState(false)

  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false)
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)

  const [searchText, setSearchText] = useState('')
  const [groupName, setGroupName] = useState('')
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([
    'g1',
    'g3',
  ])

  const [isTopBarHidden, setIsTopBarHidden] = useState(false)
  const lastScrollYRef = useRef(0)

  const filteredAccounts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    if (!keyword) return searchAccounts
    return searchAccounts.filter((account) =>
      account.name.toLowerCase().includes(keyword)
    )
  }, [searchText])

  const hasAnyTopPanelOpen =
    isSearchPanelOpen || isEditPanelOpen || isCreateGroupOpen

  function closeAllTopPanels() {
    setIsSearchPanelOpen(false)
    setIsEditPanelOpen(false)
    setIsCreateGroupOpen(false)
  }

  function triggerTopCapsuleFeedback() {
    setIsTopCapsulePressed(true)

    window.setTimeout(() => {
      setIsTopCapsulePressed(false)
    }, 320)
  }

  function openSearchPanel() {
    triggerTopCapsuleFeedback()
    closeAllTopPanels()
    setIsSearchPanelOpen(true)
  }

  function openEditPanel() {
    triggerTopCapsuleFeedback()
    closeAllTopPanels()
    setIsEditPanelOpen(true)
  }

  function openCreateGroupPanel() {
    triggerTopCapsuleFeedback()
    closeAllTopPanels()
    setIsCreateGroupOpen(true)
  }

  function toggleGroupMember(memberId: string) {
    setSelectedGroupMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    )
  }

  function handleMessageScroll(e: React.UIEvent<HTMLDivElement>) {
    const currentY = e.currentTarget.scrollTop
    const lastY = lastScrollYRef.current

    if (currentY > lastY + 8 && currentY > 40) {
      setIsTopBarHidden(true)
    }

    if (currentY < lastY - 8) {
      setIsTopBarHidden(false)
    }

    lastScrollYRef.current = currentY
  }

  return (
    <div
      onScroll={handleMessageScroll}
      className="relative flex h-screen flex-col overflow-y-auto bg-transparent px-4 pt-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="relative flex-1 px-0 pb-4 pt-[70px]">
        <div
          className={`fixed left-1/2 top-0 z-[100] w-full max-w-[430px] -translate-x-1/2 bg-[#f3f3f3]/95 px-4 pt-4 pb-3 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isTopBarHidden ? '-translate-y-full' : 'translate-y-0'
          }`}
        >
          <div
            className="flex items-center justify-between rounded-full bg-[#d9d9d9] px-4 py-[10px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              transform: isTopCapsulePressed ? 'scale(1.03)' : 'scale(1)',
              transformOrigin: 'center center',
            }}
          >
            <button
              type="button"
              onClick={() => {
                closeAllTopPanels()
                setIsPeopleLibraryOpen(true)
              }}
              className="flex items-center gap-2 rounded-full px-3 py-[6px] transition active:scale-[0.96]"
            >
              <UserRound size={22} strokeWidth={2.3} />
              <span className="text-[15px] font-medium text-[#111]">
                People Library
              </span>
            </button>

            <div className="flex items-center gap-6 pl-1">
              <button
                type="button"
                onClick={openSearchPanel}
                className="flex h-[26px] w-[26px] items-center justify-center active:scale-95"
              >
                <Search size={22} strokeWidth={2.5} />
              </button>

              <button
  type="button"
  onClick={openEditPanel}
  className="flex h-[26px] w-[26px] items-center justify-center -ml-5 active:scale-95"
>
  <PencilLine size={22} strokeWidth={2.5} />
</button>

            </div>
          </div>
        </div>

        {hasAnyTopPanelOpen && (
          <>
            <div
              className="fixed inset-0 z-[60] bg-black/10"
              onClick={closeAllTopPanels}
            />

            <div className="fixed left-1/2 top-[92px] z-[70] w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2">
              <div
                className="animate-[fadeIn_0.2s_ease-out]"
                onClick={(e) => e.stopPropagation()}
              >
                {isSearchPanelOpen && (
                  <div className="overflow-hidden rounded-[30px] bg-[#e9e9e9]/95 shadow-[0_14px_30px_rgba(0,0,0,0.14)] backdrop-blur-md">
                    <div className="flex items-center justify-between px-4 pt-4">
                      <div>
                        <div className="text-[18px] font-medium text-[#111]">
                          搜尋用戶帳戶
                        </div>
                        <div className="mt-1 text-[12px] text-[#666]">
                          搜尋你想開始聊天或查看的對象
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsSearchPanelOpen(false)}
                        className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/60 active:scale-95"
                      >
                        <X size={22} strokeWidth={2.4} className="text-black" />
                      </button>
                    </div>

                    <div className="p-4 pt-3">
                      <div className="mb-4 flex h-[46px] items-center rounded-full bg-white/65 px-4">
                        <Search
                          size={20}
                          strokeWidth={2.4}
                          className="text-black"
                        />
                        <input
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          placeholder="搜尋 Vibelink 帳戶"
                          className="ml-3 w-full bg-transparent text-[15px] text-[#111] outline-none placeholder:text-[#777]"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        {filteredAccounts.length > 0 ? (
                          filteredAccounts.map((account) => (
                            <button
                              key={account.id}
                              type="button"
                              className="flex items-center gap-3 rounded-[20px] bg-white/45 px-3 py-3 text-left active:scale-[0.99]"
                            >
                              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#d9d9d9]">
                                <UserRound
                                  size={24}
                                  strokeWidth={2.1}
                                  className="text-black"
                                />
                              </div>

                              <div className="flex flex-col">
                                <span className="text-[15px] font-medium text-[#111]">
                                  {account.name}
                                </span>
                                <span className="text-[12px] text-[#666]">
                                  {account.sub}
                                </span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="rounded-[20px] bg-white/45 px-4 py-5 text-[14px] text-[#666]">
                            找不到符合的帳戶
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isEditPanelOpen && (
                  <div className="overflow-hidden rounded-[30px] bg-[#e9e9e9]/95 shadow-[0_14px_30px_rgba(0,0,0,0.14)] backdrop-blur-md">
                    <div className="flex items-center justify-between px-4 pt-4">
                      <div>
                        <div className="text-[18px] font-medium text-[#111]">
                          編輯訊息介面
                        </div>
                        <div className="mt-1 text-[12px] text-[#666]">
                          管理釘選 / 隱藏 / 訊息排序
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsEditPanelOpen(false)}
                        className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/60 active:scale-95"
                      >
                        <X size={22} strokeWidth={2.4} className="text-black" />
                      </button>
                    </div>

                    <div className="p-4 pt-3">
                      <div className="grid gap-3">
                        <button
                          type="button"
                          className="flex items-center justify-between rounded-[22px] bg-white/45 px-4 py-4 text-left active:scale-[0.99]"
                        >
                          <span className="text-[15px] text-[#111]">
                            釘選重要聊天
                          </span>
                        </button>

                        <button
                          type="button"
                          className="flex items-center justify-between rounded-[22px] bg-white/45 px-4 py-4 text-left active:scale-[0.99]"
                        >
                          <span className="text-[15px] text-[#111]">
                            隱藏低互動聊天
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col gap-7 pt-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <button
              key={`message-${index}`}
              type="button"
              className="flex items-center gap-4 text-left"
            >
              <div className="h-[58px] w-[58px] rounded-full bg-[#d9d9d9]" />
            </button>
          ))}
        </div>
      </div>

      {isPeopleLibraryOpen && (
        <PeopleLibraryPage
  query="People Library"
  onClose={() => setIsPeopleLibraryOpen(false)}
  onOpenProfile={(userId) => {
  console.log('MessagePage receive open profile:', userId)

  setIsPeopleLibraryOpen(false)

  requestAnimationFrame(() => {
    setSelectedProfileUserId(userId)
  })
}}
/>
      )}
      <AnimatePresence mode="wait">
  {selectedProfileUserId && (
    <OtherUserProfilePage
      userId={selectedProfileUserId}
      onClose={() => setSelectedProfileUserId(null)}
    />
  )}
</AnimatePresence>
    </div>
  )
}