'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import StoryRow from '@/components/home/sections/story/StoryRow'
import FeedGrid from '@/components/home/sections/feed/FeedGrid'
import SideProfileMenu from '@/components/home/ui/layout/SideProfileMenu'
import SearchPage from '@/pages/SearchPage'

type FeedMode = '1x1' | '2x2' | '3x3'

type UploadMenuItem = {
  id: string
  label: string
  icon: React.ReactNode
}

type PostItem = {
  id: string
  author: string
  text: string
  likes: number
  image: string
}

type StoryItem = {
  id: string
  author: string
}

const uploadMenuItems: UploadMenuItem[] = [
  { id: 'post', label: '貼文', icon: <PostUploadIcon /> },
  { id: 'video', label: '短影片', icon: <VideoUploadIcon /> },
  { id: 'album', label: '配對牆相片集', icon: <AlbumUploadIcon /> },
]

const mockPosts: PostItem[] = [
  {
    id: 'p1',
    author: 'Sky.07_21',
    text: 'HI 大家好，今天是開心的一天',
    likes: 50,
    image: '#d8d8d8',
  },
  {
    id: 'p2',
    author: 'Ryan_88',
    text: '今天的配對牆先放生活照。',
    likes: 27,
    image: '#d8d8d8',
  },
  {
    id: 'p3',
    author: 'Leo_wave',
    text: '晚上想找人聊天。',
    likes: 13,
    image: '#d8d8d8',
  },
  {
    id: 'p4',
    author: 'Ace_02',
    text: '新照片更新。',
    likes: 64,
    image: '#d8d8d8',
  },
  {
    id: 'p5',
    author: 'Mason_v',
    text: '來交朋友。',
    likes: 32,
    image: '#d8d8d8',
  },
  {
    id: 'p6',
    author: 'Jay_noir',
    text: '週末想出去走走。',
    likes: 18,
    image: '#d8d8d8',
  },
]

const mockStories: StoryItem[] = [
  { id: 's1', author: 'Sky.07_21' },
  { id: 's2', author: 'Ryan_88' },
  { id: 's3', author: 'Leo_wave' },
]
const storyPagesMap: Record<string, { title: string; bg: string }[]> = {
  s1: [
    { title: 'Sky 第1頁', bg: '#cfa2cc' },
    { title: 'Sky 第2頁', bg: '#c79ad2' },
    { title: 'Sky 第3頁', bg: '#d8aed8' },
  ],
  s2: [
    { title: 'Ryan 第1頁', bg: '#c9a3d2' },
    { title: 'Ryan 第2頁', bg: '#d4b1d8' },
    { title: 'Ryan 第3頁', bg: '#c89bc8' },
  ],
  s3: [
    { title: 'Leo 第1頁', bg: '#d2abd0' },
    { title: 'Leo 第2頁', bg: '#c59bc7' },
    { title: 'Leo 第3頁', bg: '#d8b7db' },
  ],
}

export default function HomePage() {
  const [feedMode, setFeedMode] = useState<FeedMode>('1x1')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
const [isTopMenuOpen, setIsTopMenuOpen] = useState(false)
const [isProfileOpen, setIsProfileOpen] = useState(false)
const [isSearchOpen, setIsSearchOpen] = useState(false)
const [searchText, setSearchText] = useState('')
const [isSearchPageOpen, setIsSearchPageOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null)
  const [storyPage, setStoryPage] = useState(0)
  const [storyProgress, setStoryProgress] = useState(0)
  const [storyDirection, setStoryDirection] = useState<'next' | 'prev' | 'story-next' | 'story-prev'>('next')
  const [isStoryPaused, setIsStoryPaused] = useState(false)

  const uploadRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const topMenuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  function handleSubmitSearch() {
  const trimmed = searchText.trim()
  setSearchText(trimmed)
  setIsSearchOpen(false)
  setIsSearchPageOpen(true)
}

  function handleCycleFeedMode() {
    setFeedMode((prev) => {
      if (prev === '1x1') return '2x2'
      if (prev === '2x2') return '3x3'
      return '1x1'
    })
  }
  function handlePrevStoryPage() {
  if (storyPage > 0) {
    setStoryDirection('prev')
    setStoryPage((prev) => prev - 1)
    setStoryProgress(0)
    return
  }

  openPrevStory()
}

function openNextStory() {
  if (!selectedStory) return

  const currentStoryIndex = mockStories.findIndex(
    (story) => story.id === selectedStory.id
  )

  const nextStory = mockStories[currentStoryIndex + 1]

  if (!nextStory) {
    setSelectedStory(null)
    setStoryPage(0)
    setStoryProgress(0)
    setIsStoryPaused(false)
    return
  }

  setStoryDirection('story-next')
  setSelectedStory(nextStory)
  setStoryPage(0)
  setStoryProgress(0)
  setIsStoryPaused(false)
}

function openPrevStory() {
  if (!selectedStory) return

  const currentStoryIndex = mockStories.findIndex(
    (story) => story.id === selectedStory.id
  )

  const prevStory = mockStories[currentStoryIndex - 1]

  if (!prevStory) {
    setStoryPage(0)
    setStoryProgress(0)
    setIsStoryPaused(false)
    return
  }

  const prevPages = storyPagesMap[prevStory.id] || []
  const prevLastIndex = Math.max(prevPages.length - 1, 0)

  setStoryDirection('story-prev')
  setSelectedStory(prevStory)
  setStoryPage(prevLastIndex)
  setStoryProgress(0)
  setIsStoryPaused(false)
}

function handleNextStoryPage() {
  if (!selectedStory) return

  const pages = storyPagesMap[selectedStory.id] || []
  const lastIndex = pages.length - 1

  if (storyPage >= lastIndex) {
    openNextStory()
    return
  }

  setStoryDirection('next')
  setStoryPage((prev) => prev + 1)
  setStoryProgress(0)
}

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node

      if (uploadRef.current && !uploadRef.current.contains(target)) {
        setIsUploadOpen(false)
      }

      if (topMenuRef.current && !topMenuRef.current.contains(target)) {
  setIsTopMenuOpen(false)
}
if (searchRef.current && !searchRef.current.contains(target)) {
  setIsSearchOpen(false)
}

      if (
        isProfileOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(target)
      ) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProfileOpen])

  useEffect(() => {
  if (!selectedStory) return
  if (isStoryPaused) return

  const pages = storyPagesMap[selectedStory.id] || []
  if (pages.length === 0) return

  const duration = 2500
  const intervalMs = 50
  const step = 100 / (duration / intervalMs)

  const interval = setInterval(() => {
    setStoryProgress((prev) => {
      const next = prev + step

      if (next >= 100) {
        if (storyPage >= pages.length - 1) {
          openNextStory()
          return 0
        }

        setStoryDirection('next')
        setStoryPage((p) => p + 1)
        return 0
      }

      return next
    })
  }, intervalMs)

  return () => clearInterval(interval)
}, [selectedStory, storyPage, isStoryPaused])

if (isSearchPageOpen) {
  return (
    <SearchPage
      searchText={searchText}
      onBack={() => setIsSearchPageOpen(false)}
      onChangeSearchText={setSearchText}
    />
  )
}

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f5f5f5]">
      <div
  className="fixed top-0 left-1/2 z-[40] h-[60px] w-full max-w-[430px] -translate-x-1/2 bg-[rgba(245,245,245,0.96)] px-[14px] py-[8px] backdrop-blur-md"
  ref={searchRef}
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
        <div className="flex h-[42px] flex-1 items-center gap-2 rounded-full border border-[#e6d8ee] bg-[#f7f1fa] px-4 shadow-[0_8px_22px_rgba(0,0,0,0.08)]">
  <button type="button" onClick={handleSubmitSearch} className="shrink-0 text-[#444]">
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
    placeholder="搜尋"
    className="w-full bg-transparent text-[16px] text-[#333] outline-none placeholder:text-[#999]"
  />
</div>

        <button
          type="button"
          onClick={() => setIsSearchOpen(false)}
          className="shrink-0 text-[15px] font-medium text-[#666]"
        >
          取消
        </button>
      </motion.div>
    ) : (
      <motion.div
        key="default-bar"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.18 }}
        className="grid h-full grid-cols-[44px_28px_1fr_44px] items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className="grid h-[38px] w-[38px] place-items-center rounded-full border border-[#e8e8e8] bg-[#f4f4f4] text-[#222] shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
        >
          <UserAvatarIcon />
        </button>

        <div className="relative" ref={uploadRef}>
          <button
            type="button"
            onClick={() => setIsUploadOpen((prev) => !prev)}
            className="grid h-[30px] w-[30px] place-items-center bg-transparent text-[#111]"
          >
            <PlusIcon />
          </button>

          <AnimatePresence>
            {isUploadOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.72, y: -18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.78, y: -12 }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 28,
                  mass: 0.9,
                }}
                style={{ originX: 0.08, originY: 0 }}
                className="fixed top-[68px] left-1/2 z-[120] w-[300px] max-w-[300px] -translate-x-1/2 rounded-[20px] border border-[#d58be7] bg-[#f6eff7] px-[25px] py-[30px] shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
              >
                <div className="pb-5 text-center text-[20px] font-semibold text-[#666]">
                  上傳內容
                </div>

                <div className="flex flex-col gap-[14px]">
                  {uploadMenuItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="flex w-full items-center justify-center rounded-[16px] px-[24px] py-[25px] text-[25px] font-medium text-[#222] transition-all duration-200 hover:bg-[#222]/8"
                    >
                      <div className="flex items-center gap-[12px]">
                        <span className="flex h-[34px] w-[34px] items-center justify-center">
                          {item.icon}
                        </span>
                        <span className="text-center">{item.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative flex justify-center" ref={topMenuRef}>
          <button
            type="button"
            onClick={() => setIsTopMenuOpen((prev) => !prev)}
            className="flex min-w-0 items-center justify-center gap-[4px] bg-transparent"
          >
            <span className="text-[20px] font-medium tracking-[-0.2px] text-[#c16bf0]">
              Vibelink
            </span>

            <motion.span
              animate={{ rotate: isTopMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex items-center justify-center"
            >
              <ChevronDownIcon />
            </motion.span>
          </button>

          <AnimatePresence>
            {isTopMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.72, y: -16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.78, y: -10 }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 28,
                  mass: 0.9,
                }}
                style={{ originX: 0.5, originY: 0 }}
                className="absolute top-[52px] left-1/2 z-[130] w-[250px] -translate-x-1/2 rounded-[20px] border border-[#d58be7] bg-[#f6eff7] px-[24px] py-[24px] shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
              >
                <div className="flex flex-col gap-[14px]">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center rounded-[16px] px-[20px] py-[22px] text-[25px] font-medium text-[#222] transition-all duration-200 hover:bg-[#222]/8"
                  >
                    <div className="flex items-center gap-[12px]">
                      <span className="flex h-[34px] w-[34px] items-center justify-center">
                        <FollowingIcon />
                      </span>
                      <span>追蹤中</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center justify-center rounded-[16px] px-[20px] py-[22px] text-[30px] font-medium text-[#222] transition-all duration-200 hover:bg-[#222]/8"
                  >
                    <div className="flex items-center gap-[12px]">
                      <span className="flex h-[34px] w-[34px] items-center justify-center">
                        <FavoriteIcon />
                      </span>
                      <span>最愛</span>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="ml-auto grid h-[36px] w-[36px] place-items-center bg-transparent text-[#111]"
        >
          <SearchIcon />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
</div>

      <main className="min-h-screen box-border px-0 pb-[90px] pt-[66px]">
        
        <section className="px-[14px] pt-[6px]">
          <h2 className="mb-3 mt-1 text-[20px] font-bold tracking-[0.2px] text-[#444444]">
            配對牆
          </h2>

          <StoryRow
  stories={mockStories}
  onOpenStory={(story) => {
    setSelectedStory(story)
    setStoryPage(0)
    setStoryProgress(0)
  }}
/>
        </section>

        <section className="px-3 pt-3">
          <FeedGrid
            posts={mockPosts}
            feedMode={feedMode}
            setFeedMode={setFeedMode}
          />
        </section>

        <div className="fixed bottom-[84px] left-1/2 z-[24] w-full max-w-[430px] -translate-x-1/2 px-4">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleCycleFeedMode}
              className="flex h-[35px] min-w-[85px] items-center justify-center gap-[5px] rounded-full bg-gray-200/60 backdrop-blur-md border border-white/40 text-[#444] shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
            >
              <GridIcon />
              <span className="whitespace-nowrap text-[12px] font-semibold text-[#555]">
                {feedMode}
              </span>
            </button>
          </div>
        </div>
      </main>

      <AnimatePresence mode="wait">
        {selectedStory && (
  <motion.div
  className="fixed inset-0 z-[200] bg-[#efefef]"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.18 }}
>
  <div className="relative mx-auto h-full w-full max-w-[430px]">
    {(() => {
      const pages = storyPagesMap[selectedStory.id] || []
      const currentPage = pages[storyPage] || pages[0]

      return (
        <>
          {/* 上方進度條 */}
          <div className="absolute left-0 right-0 top-0 z-[5] px-4 pt-4">
  <div className="flex gap-1">
    {pages.map((_, i) => (
      <div
        key={i}
        className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/30"
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-white transition-[width] duration-75"
          style={{
            width:
              i < storyPage
                ? '100%'
                : i === storyPage
                ? `${storyProgress}%`
                : '0%',
          }}
        />
      </div>
    ))}
  </div>
</div>

          {/* Header */}
          <div className="absolute left-0 right-0 top-0 z-[6] flex items-center justify-between px-5 pt-7">
            <div className="flex items-center gap-3">
              <div className="h-[42px] w-[42px] rounded-full bg-[#d8d8d8]" />
              <div className="text-[16px] font-medium text-[#111]">
                {selectedStory.author}
              </div>
            </div>

            <button
              onClick={() => {
  setSelectedStory(null)
  setStoryPage(0)
  setStoryProgress(0)
  setIsStoryPaused(false)
}}
              className="rounded-full bg-[#e5e5e5] px-4 py-2 text-[13px] font-medium text-[#333]"
            >
              CLOSE
            </button>
          </div>

          {/* 主內容 */}
          <div className="flex h-full w-full items-center justify-center px-4 pt-[80px] pb-[140px]">
            <motion.div
  key={`${selectedStory.id}-${storyPage}`}
  initial={{
    x:
      storyDirection === 'next'
        ? 22
        : storyDirection === 'prev'
        ? -22
        : storyDirection === 'story-next'
        ? 52
        : -52,
    opacity: 0.72,
    scale:
      storyDirection === 'story-next' || storyDirection === 'story-prev'
        ? 0.97
        : 0.985,
  }}
  animate={{ x: 0, opacity: 1, scale: 1 }}
  exit={{
    x:
      storyDirection === 'next'
        ? -22
        : storyDirection === 'prev'
        ? 22
        : storyDirection === 'story-next'
        ? -52
        : 52,
    opacity: 0.72,
    scale:
      storyDirection === 'story-next' || storyDirection === 'story-prev'
        ? 0.97
        : 0.985,
  }}
  transition={{ duration: 0.26, ease: 'easeOut' }}
  className="relative h-full w-full max-w-[390px] overflow-hidden rounded-[28px] shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
  style={{ backgroundColor: currentPage?.bg || '#cfa2cc' }}
  onMouseDown={() => setIsStoryPaused(true)}
  onMouseUp={() => setIsStoryPaused(false)}
  onMouseLeave={() => setIsStoryPaused(false)}
  onTouchStart={() => setIsStoryPaused(true)}
  onTouchEnd={() => setIsStoryPaused(false)}
>
              <div className="flex h-full items-center justify-center px-6 text-center text-[20px] text-white/85">
                {currentPage?.title || '配對牆內容'}
              </div>

              {/* 左右點擊區 */}
              <button
                type="button"
                onClick={handlePrevStoryPage}
                className="absolute left-0 top-0 h-full w-1/2"
                aria-label="Previous story page"
              />
              <button
                type="button"
                onClick={handleNextStoryPage}
                className="absolute right-0 top-0 h-full w-1/2"
                aria-label="Next story page"
              />
            </motion.div>
          </div>

          {/* 底部操作區 */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="rounded-[26px] bg-[#ead7ef] px-6 py-4 shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
              <div className="grid grid-cols-3 text-center text-[#111]">
                <button className="flex flex-col items-center gap-2">
                  <span className="text-[26px]">🖼️</span>
                  <span className="text-[14px]">他的檔案</span>
                </button>

                <button className="flex flex-col items-center gap-2">
                  <span className="text-[26px]">♡</span>
                  <span className="text-[14px]">喜歡</span>
                </button>

                <button className="flex flex-col items-center gap-2">
                  <span className="text-[26px]">✉️</span>
                  <span className="text-[14px]">發送邀請</span>
                </button>
              </div>
            </div>
          </div>
        </>
            )
    })()}
  </div>
</motion.div>
)}
      </AnimatePresence>

      <AnimatePresence>
  {isProfileOpen && (
    <SideProfileMenu onClose={() => setIsProfileOpen(false)} />
  )}
</AnimatePresence>
      
    </div>
  )
}

function DrawerMenuItem({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 border-none bg-transparent py-[12px] text-left text-[20px] text-[#222]"
    >
      <span className="grid h-[30px] w-10 place-items-center text-[#111]">
        {icon}
      </span>
      <span>{label}</span>
    </button>
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FollowingIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6.5 18c1-2.8 3.3-4.2 5.5-4.2s4.5 1.4 5.5 4.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FavoriteIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.5L12 16.8 7.2 19l.9-5.5-3.9-3.8 5.4-.8L12 4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UserAvatarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 19c1.1-3 3.6-4.5 6.5-4.5s5.4 1.5 6.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="5" y="14" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="14" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function AccountIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 19c1.1-3 3.6-4.5 6.5-4.5s5.4 1.5 6.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 18h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M7 18v-7h3v7M14 18V6h3v12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 10a5 5 0 1110 0v4l2 2H5l2-2v-4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 18a2 2 0 004 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.5L12 16.8 7.2 19l.9-5.5-3.9-3.8 5.4-.8L12 4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BlockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 8l8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 8v4l3 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 8h14v3a2 2 0 010 4v3H5v-3a2 2 0 010-4V8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 8v10" stroke="currentColor" strokeWidth="1.8" strokeDasharray="2 2" />
    </svg>
  )
}

function HubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="5" height="5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="15" y="4" width="5" height="5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="15" width="5" height="5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="15" y="15" width="5" height="5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function SettingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 8.5A3.5 3.5 0 1112 15.5 3.5 3.5 0 0112 8.5z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19 12l1.5-1-1.5-3-1.8.3-1-1.2.3-1.8-3-1.5-1 1.5h-1l-1-1.5-3 1.5.3 1.8-1 1.2L5 8l-1.5 3L5 12l-.3 1.8 1 1.2-1.8.3 1.5 3 1.8-.3 1 1.2-.3 1.8 3 1.5 1-1.5h1l1 1.5 3-1.5-.3-1.8 1-1.2 1.8.3 1.5-3L19 12z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MegaphoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 13V9l10-3v10L4 13z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 9c1.5.2 3 .8 5 2v2c-2-1.2-3.5-1.8-5-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 13l1 4h2l-1-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PostUploadIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 5h8M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function VideoUploadIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="4"
        y="6"
        width="11"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M15 10l5-3v10l-5-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AlbumUploadIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="4"
        y="5"
        width="16"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 14l2.5-2.5 2.5 2.5 3.5-3.5 3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="1.2" fill="currentColor" />
    </svg>
  )
}