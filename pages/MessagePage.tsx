'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  ChevronDown,
  Mail,
  PencilLine,
  Plus,
  Search,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import PeopleLibraryPage from '@/components/home/sections/people/PeopleLibraryPage'
import FriendInvitePage from '@/pages/FriendInvitePage'

type MessagePageProps = {
  onOpenMenu?: () => void
}

const tabs = ['全部', '最愛', '追蹤中'] as const

const accounts = [{ id: 'a1', name: 'Sky_07_21' }]

const searchAccounts = [
  { id: 'u1', name: 'Ryan_88', sub: '最近追蹤' },
  { id: 'u2', name: 'Leo_wave', sub: '較常互動' },
  { id: 'u3', name: 'Mina.day', sub: 'People Library' },
  { id: 'u4', name: 'Vibe_Alice', sub: '可能認識的人' },
  { id: 'u5', name: 'Neo_77', sub: '官方推薦' },
]

const groupMembers = [
  { id: 'g1', name: 'Ryan_88' },
  { id: 'g2', name: 'Leo_wave' },
  { id: 'g3', name: 'Mina.day' },
  { id: 'g4', name: 'Vibe_Alice' },
]

export default function MessagePage({ onOpenMenu }: MessagePageProps) {
  const [isPeopleLibraryOpen, setIsPeopleLibraryOpen] = useState(false)
  const [isFriendInviteOpen, setIsFriendInviteOpen] = useState(false)

  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0].id)
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

  const [isTabBarPressed, setIsTabBarPressed] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  const [isTopBarHidden, setIsTopBarHidden] = useState(false)
const lastScrollYRef = useRef(0)

  const accountSwitcherRef = useRef<HTMLDivElement | null>(null)
  const tabTouchStartX = useRef<number | null>(null)
  const tabTouchStartY = useRef<number | null>(null)
  const tabTouchDeltaX = useRef(0)
  const tabTouchDeltaY = useRef(0)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountSwitcherRef.current &&
        !accountSwitcherRef.current.contains(event.target as Node)
      ) {
        setIsAccountSwitcherOpen(false)
      }
    }

    if (isAccountSwitcherOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAccountSwitcherOpen])

  const selectedAccount =
    accounts.find((account) => account.id === selectedAccountId) ?? accounts[0]

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
    setIsAccountSwitcherOpen(false)
    setIsSearchPanelOpen(true)
  }

  function openEditPanel() {
    triggerTopCapsuleFeedback()
    closeAllTopPanels()
    setIsAccountSwitcherOpen(false)
    setIsEditPanelOpen(true)
  }

  function openCreateGroupPanel() {
    triggerTopCapsuleFeedback()
    closeAllTopPanels()
    setIsAccountSwitcherOpen(false)
    setIsCreateGroupOpen(true)
  }

  function toggleGroupMember(memberId: string) {
    setSelectedGroupMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    )
  }

  function goToTab(index: number) {
  if (index < 0 || index >= tabs.length) return
  setActiveTab(index)
}

  function canAllowOuterPageSwipe(deltaX: number) {
    const atFirstTab = activeTab === 0
    const atLastTab = activeTab === 2

    if (deltaX > 0 && atFirstTab) return true
    if (deltaX < 0 && atLastTab) return true

    return false
  }

  function handleTabTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0]
    tabTouchStartX.current = touch.clientX
    tabTouchStartY.current = touch.clientY
    tabTouchDeltaX.current = 0
    tabTouchDeltaY.current = 0
  }

  function handleTabTouchMove(e: React.TouchEvent<HTMLDivElement>) {
  if (tabTouchStartX.current == null || tabTouchStartY.current == null) return

  const touch = e.touches[0]
  const deltaX = touch.clientX - tabTouchStartX.current
  const deltaY = touch.clientY - tabTouchStartY.current

  tabTouchDeltaX.current = deltaX
  tabTouchDeltaY.current = deltaY

  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)
  const isMostlyHorizontal = absX > absY

  if (!isMostlyHorizontal) return

  // 只要這一區在做水平滑動，就先擋外層 page swipe
  e.stopPropagation()

  // 邊界時也不要讓整頁切出去
  if (absX > 8) {
    e.preventDefault()
  }
}

  function handleTabTouchEnd() {
  const deltaX = tabTouchDeltaX.current
  const deltaY = tabTouchDeltaY.current
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)
  const isMostlyHorizontal = absX > absY


  if (isMostlyHorizontal && absX > 50) {
    if (deltaX < 0) {
      goToTab(activeTab + 1)
    } else {
      goToTab(activeTab - 1)
    }
  }

  tabTouchStartX.current = null
  tabTouchStartY.current = null
  tabTouchDeltaX.current = 0
  tabTouchDeltaY.current = 0
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
      <div className="relative flex-1 px-0 pb-4 pt-[90px]">
        <div
  className={`fixed left-1/2 top-0 z-[100] w-full max-w-[430px] -translate-x-1/2 bg-[#f3f3f3]/95 px-4 pt-4 pb-3 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
    isTopBarHidden ? '-translate-y-full' : 'translate-y-0'
  }`}
>
          <div className="relative flex items-center justify-between">
            <div ref={accountSwitcherRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsAccountSwitcherOpen((prev) => !prev)
                  closeAllTopPanels()
                }}
                className="flex items-center gap-[6px] text-left active:scale-[0.98]"
              >
                <span className="text-[20px] font-medium leading-none text-[#111]">
                  {selectedAccount.name}
                </span>

                <ChevronDown
                  size={20}
                  strokeWidth={2.5}
                  className={`mt-[2px] text-black transition-transform duration-200 ${
                    isAccountSwitcherOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isAccountSwitcherOpen && (
                <div
                  className="
                    absolute left-0 top-[46px] z-[80]
                    w-[calc(100vw-32px)] max-w-[390px]
                    origin-top-left
                    animate-[fadeIn_0.2s_ease-out]
                    overflow-hidden rounded-[30px]
                    bg-[#efefef]/95
                    shadow-[0_14px_36px_rgba(0,0,0,0.18)]
                    backdrop-blur-md
                  "
                >
                  <div className="px-3 pb-3 pt-3">
                    <div className="mb-2 flex justify-center">
                      <div className="h-[5px] w-[46px] rounded-full bg-black/10" />
                    </div>

                    <div className="rounded-[24px] bg-white/45 px-2 py-2">
                      {accounts.map((account) => {
                        const isActive = account.id === selectedAccountId

                        return (
                          <button
                            key={account.id}
                            type="button"
                            onClick={() => {
                              setSelectedAccountId(account.id)
                              setIsAccountSwitcherOpen(false)
                            }}
                            className="flex w-full items-center justify-between rounded-[20px] px-3 py-3 text-left transition-transform active:scale-[0.985]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#d9d9d9]">
                                <UserRound
                                  size={24}
                                  strokeWidth={2.2}
                                  className="text-black"
                                />
                              </div>

                              <div className="flex flex-col">
                                <span className="text-[16px] font-medium text-[#111]">
                                  {account.name}
                                </span>
                                <span className="text-[12px] text-[#666]">
                                  Vibelink 帳號
                                </span>
                              </div>
                            </div>

                            {isActive && (
                              <Check
                                size={18}
                                strokeWidth={2.8}
                                className="text-[#7c3aed]"
                              />
                            )}
                          </button>
                        )
                      })}

                      {accounts.length === 1 && (
                        <>
                          <div className="mx-2 my-1 h-px bg-black/10" />

                          <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-[20px] px-3 py-3 text-left transition-transform active:scale-[0.985]"
                          >
                            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#d9d9d9]">
                              <Plus
                                size={24}
                                strokeWidth={2.6}
                                className="text-black"
                              />
                            </div>

                            <div className="flex flex-col">
                              <span className="text-[16px] font-medium text-[#111]">
                                新增 Vibelink 帳號
                              </span>
                              <span className="text-[12px] text-[#666]">
                                建立或切換其他身份
                              </span>
                            </div>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className="flex items-center gap-7 rounded-full bg-[#d9d9d9] px-8 py-[10px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: isTopCapsulePressed ? 'scale(1.04)' : 'scale(1)',
                transformOrigin: 'center center',
              }}
            >
              <button
                type="button"
                onClick={openSearchPanel}
                className="flex h-[26px] w-[26px] items-center justify-center active:scale-95"
              >
                <Search size={22} strokeWidth={2.5} className="text-black" />
              </button>

              <button
                type="button"
                onClick={openEditPanel}
                className="flex h-[26px] w-[26px] items-center justify-center active:scale-95"
              >
                <PencilLine
                  size={22}
                  strokeWidth={2.5}
                  className="text-black"
                />
              </button>

              <button
                type="button"
                onClick={openCreateGroupPanel}
                className="flex h-[26px] w-[26px] items-center justify-center active:scale-95"
              >
                <Users size={22} strokeWidth={2.5} className="text-black" />
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

            <div className="fixed left-1/2 top-[140px] z-[70] w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2">
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
                          管理釘選/隱藏/訊息排序
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
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isCreateGroupOpen && (
                  <div className="overflow-hidden rounded-[30px] bg-[#e9e9e9]/95 shadow-[0_14px_30px_rgba(0,0,0,0.14)] backdrop-blur-md">
                    <div className="flex items-center justify-between px-4 pt-4">
                      <div>
                        <div className="text-[18px] font-medium text-[#111]">
                          建立群組
                        </div>
                        <div className="mt-1 text-[12px] text-[#666]">
                          輸入群組名稱並選擇成員
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsCreateGroupOpen(false)}
                        className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/60 active:scale-95"
                      >
                        <X size={22} strokeWidth={2.4} className="text-black" />
                      </button>
                    </div>

                    <div className="p-4 pt-3">
                      <div className="mb-4 flex h-[46px] items-center rounded-full bg-white/65 px-4">
                        <Users
                          size={19}
                          strokeWidth={2.3}
                          className="text-black"
                        />
                        <input
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          placeholder="輸入群組名稱"
                          className="ml-3 w-full bg-transparent text-[15px] text-[#111] outline-none placeholder:text-[#777]"
                        />
                      </div>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {selectedGroupMembers.map((memberId) => {
                          const member = groupMembers.find(
                            (item) => item.id === memberId
                          )
                          if (!member) return null

                          return (
                            <div
                              key={member.id}
                              className="rounded-full bg-[#d8b3d8] px-3 py-[7px] text-[13px] text-[#111]"
                            >
                              {member.name}
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex flex-col gap-2">
                        {groupMembers.map((member) => {
                          const isSelected = selectedGroupMembers.includes(
                            member.id
                          )

                          return (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => toggleGroupMember(member.id)}
                              className="flex items-center justify-between rounded-[20px] bg-white/45 px-3 py-3 text-left active:scale-[0.99]"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#d9d9d9]">
                                  <UserRound
                                    size={22}
                                    strokeWidth={2.1}
                                    className="text-black"
                                  />
                                </div>

                                <div className="text-[15px] font-medium text-[#111]">
                                  {member.name}
                                </div>
                              </div>

                              <div
                                className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border ${
                                  isSelected
                                    ? 'border-[#7c3aed] bg-[#7c3aed]'
                                    : 'border-black/20 bg-transparent'
                                }`}
                              >
                                {isSelected && (
                                  <Check
                                    size={13}
                                    strokeWidth={3}
                                    className="text-white"
                                  />
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      <button
                        type="button"
                        className="mt-4 flex h-[46px] w-full items-center justify-center rounded-full bg-[#d8b3d8] text-[15px] font-medium text-[#111] active:scale-[0.99]"
                      >
                        建立群組
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="relative z-[20] mb-5 flex items-start justify-center gap-[56px] text-center">
          <button
            type="button"
            onClick={() => setIsPeopleLibraryOpen(true)}
            className="flex w-[130px] flex-col items-center"
          >
            <UserRound size={48} strokeWidth={2.1} className="mb-2 text-black" />
            <span className="text-[15px] text-[#222]">People Library</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFriendInviteOpen(true)}
            className="flex w-[130px] flex-col items-center"
          >
            <Mail size={48} strokeWidth={2.1} className="mb-2 text-black" />
            <span className="text-[15px] text-[#222]">好友邀請</span>
          </button>
        </div>

        <motion.div
  className="relative mb-4 h-[54px] rounded-full bg-[#CACACA] p-[4px]"
  animate={{
    scale: isTabBarPressed ? 0.985 : 1,
  }}
  transition={{
    duration: 0.16,
    ease: [0.22, 1, 0.36, 1],
  }}
  onTouchStart={() => setIsTabBarPressed(true)}
  onTouchEnd={() => setIsTabBarPressed(false)}
  onTouchCancel={() => setIsTabBarPressed(false)}
  onMouseDown={() => setIsTabBarPressed(true)}
  onMouseUp={() => setIsTabBarPressed(false)}
  onMouseLeave={() => setIsTabBarPressed(false)}
>
  <div className="relative grid h-full grid-cols-3">
    <div
      className="pointer-events-none absolute top-0 bottom-0 rounded-full bg-[#d9d9d9] transition-all duration-300 ease-out"
      style={{
        left: `${activeTab * 33.3333}%`,
        width: '33.3333%',
      }}
    />

    {tabs.map((tab, index) => (
      <motion.button
        key={tab}
        type="button"
        onClick={() => goToTab(index)}
        whileTap={{ scale: 0.97 }}
        transition={{
          duration: 0.12,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-[2] flex h-full items-center justify-center rounded-full text-[18px] text-[#111]"
      >
        {tab}
      </motion.button>
    ))}
  </div>
</motion.div>

        <div
  data-no-page-swipe="true"
  className="overflow-hidden touch-pan-y"
  onTouchStart={handleTabTouchStart}
  onTouchMove={handleTabTouchMove}
  onTouchEnd={handleTabTouchEnd}
>
          <div
            className="flex w-full transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${activeTab * 100}%)`,
            }}
          >
            <div className="w-full shrink-0">
              <div className="flex flex-col gap-7">
                {Array.from({ length: 5 }).map((_, index) => (
                  <button
                    key={`all-${index}`}
                    type="button"
                    className="flex items-center gap-4 text-left"
                  >
                    <div className="h-[58px] w-[58px] rounded-full bg-[#d9d9d9]" />
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full shrink-0">
              <div className="flex flex-col gap-7">
                {Array.from({ length: 5 }).map((_, index) => (
                  <button
                    key={`favorite-${index}`}
                    type="button"
                    className="flex items-center gap-4 text-left"
                  >
                    <div className="h-[58px] w-[58px] rounded-full bg-[#d9d9d9]" />
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full shrink-0">
              <div className="flex flex-col gap-7">
                {Array.from({ length: 5 }).map((_, index) => (
                  <button
                    key={`following-${index}`}
                    type="button"
                    className="flex items-center gap-4 text-left"
                  >
                    <div className="h-[58px] w-[58px] rounded-full bg-[#d9d9d9]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPeopleLibraryOpen && (
        <PeopleLibraryPage onClose={() => setIsPeopleLibraryOpen(false)} />
      )}

      {isFriendInviteOpen && (
        <FriendInvitePage onClose={() => setIsFriendInviteOpen(false)} />
      )}
    </div>
  )
}