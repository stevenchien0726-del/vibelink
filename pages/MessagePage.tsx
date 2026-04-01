'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  ChevronDown,
  Heart,
  ListFilter,
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
import RightNowPage from '@/pages/RightNowPage'

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
  const [isRightNowOpen, setIsRightNowOpen] = useState(false)

  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0].id)

  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false)
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)

  const [searchText, setSearchText] = useState('')
  const [groupName, setGroupName] = useState('')
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([
    'g1',
    'g3',
  ])

  const accountSwitcherRef = useRef<HTMLDivElement | null>(null)

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

  function openSearchPanel() {
    closeAllTopPanels()
    setIsAccountSwitcherOpen(false)
    setIsSearchPanelOpen(true)
  }

  function openEditPanel() {
    closeAllTopPanels()
    setIsAccountSwitcherOpen(false)
    setIsEditPanelOpen(true)
  }

  function openCreateGroupPanel() {
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

  return (
    <div className="relative flex min-h-screen flex-col bg-transparent px-4 pt-4 pb-2">

      <div className="relative flex-1 pb-4">
        {/* Top controls */}
        <div className="relative mb-5 flex items-center justify-between">
          {/* 左：帳號區 */}
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

          {/* 右：3 icon */}
          <div className="flex items-center gap-7 rounded-full bg-[#d9d9d9] px-8 py-[10px]">
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
              <PencilLine size={22} strokeWidth={2.5} className="text-black" />
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

                      {/* Wide top panels overlay */}
        {hasAnyTopPanelOpen && (
          <>
            <div
              className="fixed inset-0 z-[60] bg-black/10"
              onClick={closeAllTopPanels}
            />

            <div className="absolute left-0 right-0 top-[74px] z-[70]">
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
                        <Search size={20} strokeWidth={2.4} className="text-black" />
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
                        <Users size={19} strokeWidth={2.3} className="text-black" />
                        <input
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          placeholder="輸入群組名稱"
                          className="ml-3 w-full bg-transparent text-[15px] text-[#111] outline-none placeholder:text-[#777]"
                        />
                      </div>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {selectedGroupMembers.map((memberId) => {
                          const member = groupMembers.find((item) => item.id === memberId)
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
                          const isSelected = selectedGroupMembers.includes(member.id)

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
        <PeopleLibraryPage onClose={() => setIsPeopleLibraryOpen(false)} />
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