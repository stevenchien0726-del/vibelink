'use client'

import type { Dispatch, RefObject, SetStateAction } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { MEMBERSHIP_URL, openLink } from '@/lib/links'
import { uiText } from '@/lib/uiText'

type Props = {
  isTopBarVisible: boolean
  isSearchOpen: boolean
  isTopMenuOpen: boolean
  searchText: string
  searchRef: RefObject<HTMLDivElement | null>
  topMenuRef: RefObject<HTMLDivElement | null>
  setSearchText: Dispatch<SetStateAction<string>>
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>
  setIsTopMenuOpen: Dispatch<SetStateAction<boolean>>
  setIsFollowingFeedOpen: Dispatch<SetStateAction<boolean>>
  setIsFavoriteFeedOpen: Dispatch<SetStateAction<boolean>>
  setIsUploadOpen: Dispatch<SetStateAction<boolean>>
  setIsNotificationsOpen: Dispatch<SetStateAction<boolean>>
  handleSubmitSearch: () => void
unreadNotificationCount?: number
}

export default function HomeTopBar({
  isTopBarVisible,
  isSearchOpen,
  isTopMenuOpen,
  searchText,
  searchRef,
  topMenuRef,
  setSearchText,
  setIsSearchOpen,
  setIsTopMenuOpen,
  setIsFollowingFeedOpen,
  setIsFavoriteFeedOpen,
  setIsUploadOpen,
  setIsNotificationsOpen,
  handleSubmitSearch,
unreadNotificationCount = 0,
}: Props) {
  const text = {
    search: uiText('搜尋', 'Search'),
    close: uiText('關閉', 'CLOSE'),
    membership: uiText('Vibe會員', 'Vibe Membership'),
    following: uiText('追蹤中', 'Following'),
    favorite: uiText('最愛', 'Favorites'),
  }

  return (
    <motion.div
      className="fixed top-0 left-1/2 z-[500] pointer-events-auto h-[60px] w-full max-w-[430px] -translate-x-1/2 border-b border-[var(--app-card-border)] bg-[var(--app-bg)]/95 px-[14px] py-[8px] backdrop-blur-md"

      ref={searchRef}
      animate={{
        y: isTopBarVisible || isSearchOpen ? 0 : -72,
        opacity: isTopBarVisible || isSearchOpen ? 1 : 0.92,
      }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 34,
        mass: 0.95,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isSearchOpen ? (
          <motion.div
            key="search-bar"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 28,
              mass: 0.9,
            }}
            className="flex h-full items-center gap-2"
          >
            <div className="flex h-[42px] flex-1 items-center gap-2 rounded-full border border-[var(--app-card-border)] bg-[var(--app-card)] px-4 shadow-[0_8px_22px_rgba(0,0,0,0.08)]">
              <button
                type="button"
                onClick={handleSubmitSearch}
                className="shrink-0 text-white"
              >
                <SearchIcon />
              </button>

              <input
                autoFocus
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitSearch()
                  }
                }}
                placeholder={text.search}
                className="w-full bg-transparent text-[16px] text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="shrink-0 text-[15px] font-medium text-[var(--app-muted)]"
            >
              {text.close}
            </button>
          </motion.div>
        ) : (
          
<motion.div
  key="default-bar"
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 8 }}
  transition={{ duration: 0.18 }}
  className="relative flex h-full items-center justify-between px-4"
>
  {/* 左：logo 膠囊 + 小選單 */}
  <div className="relative" ref={topMenuRef}>
    <button
      type="button"
      onClick={() => setIsTopMenuOpen((prev) => !prev)}
      className="flex h-[38px] items-center gap-1 rounded-[12px] border border-[var(--app-card-border)] bg-[var(--app-card)] px-3 text-[var(--app-text)] transition-all active:scale-[0.96] active:bg-white/10"
    >
      <img
        src="/vibelink-logo.png"
        alt="Vibelink"
        className="h-[36px] object-contain"
      />

      <motion.span
        animate={{ rotate: isTopMenuOpen ? 180 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex items-center justify-center text-[var(--app-text)]"
      >
        <ChevronDownIcon />
      </motion.span>
    </button>

    <AnimatePresence>
  {isTopMenuOpen && (
    <motion.div
  initial={{ opacity: 0, scale: 0.94, y: -8 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.96, y: -6 }}
  transition={{ duration: 0.18, ease: 'easeOut' }}
  className="absolute left-0 top-[46px] z-[200] w-[200px] rounded-[20px] border border-[var(--app-card-border)] bg-[var(--app-card)] p-4 text-[var(--app-text)] shadow-[0_10px_26px_rgba(0,0,0,0.18)]"
>
  <div className="flex flex-col gap-6">
  <button
    type="button"
    onClick={() => {
      openLink(MEMBERSHIP_URL)
      setIsTopMenuOpen(false)
    }}
    className="flex w-full items-center gap-3 rounded-[16px] px-4 py-4 text-[18px] 
     transition-colors active:bg-black/5"
  >
    <MembershipIcon />
    <span>{text.membership}</span>
  </button>

  <button
  type="button"
  onClick={() => {
    setIsTopMenuOpen(false)
    setIsFollowingFeedOpen(true)
  }}
  className="flex w-full items-center gap-3 rounded-[16px] px-4 py-4 text-[18px] text-[var(--app-text)] transition-colors active:bg-black/5"
>
  <FollowingIcon />
  <span>{text.following}</span>
</button>

  <button
  type="button"
  onClick={() => {
    setIsTopMenuOpen(false)
    setIsFavoriteFeedOpen(true)
  }}
  className="flex w-full items-center gap-3 rounded-[16px] px-4 py-4 text-[18px] text-[var(--app-text)] transition-colors active:bg-black/5"
>
  <FavoriteIcon />
  <span>{text.favorite}</span>
</button>
</div>
</motion.div>
  )}
</AnimatePresence>
  </div>

    {/* 右：功能膠囊 */}
  <div className="flex h-[40px] items-center gap-6 rounded-full border border-[var(--app-card-border)] bg-[var(--app-card)] px-4 text-[var(--app-text)] shadow-inner">

    

    <button
      type="button"
      onClick={() => setIsSearchOpen(true)}
      className="flex h-[34px] w-[34px] items-center justify-center rounded-full transition-all active:scale-[0.95] active:bg-black/5"
    >
      <SearchIcon />
    </button>

    <button
      type="button"
      onClick={() => setIsUploadOpen(true)}
      className="flex h-[34px] w-[34px] items-center justify-center rounded-full transition-all active:scale-[0.95] active:bg-black/5"
    >
      <PlusIcon />
    </button>

    <button
  type="button"
  onClick={() => setIsNotificationsOpen(true)}
  className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full transition-all active:scale-[0.95] active:bg-black/5"
>
  <Bell size={20} strokeWidth={2.1} />

  {unreadNotificationCount > 0 && (
    <span className="absolute right-[5px] top-[5px] h-[8px] w-[8px] rounded-full bg-[#c86cff]" />
  )}
</button>
  </div>
</motion.div>

            )}
      </AnimatePresence>
    </motion.div> 
  )
}

function PlusIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M20 20l-3.2-3.2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FollowingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 12.5l3 3 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function FavoriteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4.5l2.2 4.45 4.9.72-3.55 3.46.84 4.88L12 15.7 7.61 18l.84-4.88L4.9 9.67l4.9-.72L12 4.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MembershipIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 17h16l-1.5-9-4.2 3.4L12 5l-2.3 6.4L5.5 8 4 17z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
