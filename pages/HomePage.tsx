'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  animate,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import { HeartIcon } from 'lucide-react'
import StoryRow from '@/components/home/sections/story/StoryRow'
import FeedGrid from '@/components/home/sections/feed/FeedGrid'
import SearchPage from '@/pages/SearchPage'
import PeopleLibraryPage from '@/components/home/sections/people/PeopleLibraryPage'
import FriendInvitePage from '@/pages/FriendInvitePage'
import UploadFullPage from '@/components/home/sections/upload/UploadFullPage'
import type { CapsulePosition } from '@/app/page'

type FeedMode = '1x1' | '2x2' | '3x3'

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

type HomePageProps = {
  feedCapsulePosition: CapsulePosition
}

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

export default function HomePage({
  feedCapsulePosition,
}: HomePageProps) {
  const [feedMode, setFeedMode] = useState<FeedMode>('1x1')
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false)
  const [isPeopleLibraryOpen, setIsPeopleLibraryOpen] = useState(false)
  const [isFriendInviteOpen, setIsFriendInviteOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isSearchPageOpen, setIsSearchPageOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null)
  const [storyPage, setStoryPage] = useState(0)
  const [storyProgress, setStoryProgress] = useState(0)
  const [storyDirection, setStoryDirection] = useState<
    'next' | 'prev' | 'story-next' | 'story-prev'
  >('next')
  const [isStoryPaused, setIsStoryPaused] = useState(false)
  const [isFeedCapsulePressed, setIsFeedCapsulePressed] = useState(false)
  const [isTopBarVisible, setIsTopBarVisible] = useState(true)

  const topMenuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const storyTouchStartYRef = useRef<number | null>(null)
  const storyTouchStartXRef = useRef<number | null>(null)
  const lastScrollYRef = useRef(0)
  const scrollTickingRef = useRef(false)

  const storyDragY = useMotionValue(0)
  const storyCardScale = useTransform(storyDragY, [0, 320], [1, 0.94])
  const storyCardOpacity = useTransform(storyDragY, [0, 320], [1, 0.72])
  const storyOverlayOpacity = useTransform(storyDragY, [0, 320], [1, 0.86])

  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY || window.pageYOffset

      if (scrollTickingRef.current) return
      scrollTickingRef.current = true

      window.requestAnimationFrame(() => {
        const lastY = lastScrollYRef.current
        const delta = currentY - lastY

        if (currentY <= 8) {
          setIsTopBarVisible(true)
        } else if (Math.abs(delta) > 6) {
          if (delta > 0) {
            setIsTopBarVisible(false)
            setIsTopMenuOpen(false)
            setIsSearchOpen(false)
          } else {
            setIsTopBarVisible(true)
          }
        }

        lastScrollYRef.current = currentY
        scrollTickingRef.current = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeStoryViewer = useCallback(() => {
    setSelectedStory(null)
    setStoryPage(0)
    setStoryProgress(0)
    setIsStoryPaused(false)
    storyDragY.set(0)
  }, [storyDragY])

  function handleSubmitSearch() {
    const trimmed = searchText.trim()
    setSearchText(trimmed)
    setIsSearchOpen(false)
    setIsSearchPageOpen(true)
  }

  function handleCycleFeedMode() {
    setIsFeedCapsulePressed(true)

    setFeedMode((prev) => {
      if (prev === '1x1') return '2x2'
      if (prev === '2x2') return '3x3'
      return '1x1'
    })

    window.setTimeout(() => {
      setIsFeedCapsulePressed(false)
    }, 320)
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

  function handleStoryTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0]
    storyTouchStartYRef.current = touch.clientY
    storyTouchStartXRef.current = touch.clientX
    setIsStoryPaused(true)
  }

  function handleStoryTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const startY = storyTouchStartYRef.current
    const startX = storyTouchStartXRef.current
    if (startY == null || startX == null) return

    const touch = e.touches[0]
    const deltaY = touch.clientY - startY
    const deltaX = Math.abs(touch.clientX - startX)

    if (deltaY > 0 && deltaX < 80) {
      e.preventDefault()
      storyDragY.set(deltaY)
    }
  }

  function handleStoryTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    const startY = storyTouchStartYRef.current
    const startX = storyTouchStartXRef.current

    if (startY == null || startX == null) {
      setIsStoryPaused(false)
      return
    }

    const touch = e.changedTouches[0]
    const deltaY = touch.clientY - startY
    const deltaX = Math.abs(touch.clientX - startX)

    storyTouchStartYRef.current = null
    storyTouchStartXRef.current = null
    setIsStoryPaused(false)

    if (deltaY > 140 && deltaX < 80) {
      closeStoryViewer()
      return
    }

    animate(storyDragY, 0, {
      type: 'spring',
      stiffness: 380,
      damping: 32,
      mass: 0.9,
    })
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node

      if (searchRef.current && !searchRef.current.contains(target)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

    <motion.div
      className="fixed top-0 left-1/2 z-[40] h-[60px] w-full max-w-[430px] -translate-x-1/2 bg-[rgba(245,245,245,0.96)] px-[14px] py-[8px] backdrop-blur-md"
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
            <div className="flex h-[42px] flex-1 items-center gap-2 rounded-full border border-[#e6d8ee] bg-[#f7f1fa] px-4 shadow-[0_8px_22px_rgba(0,0,0,0.08)]">
              <button
                type="button"
                onClick={handleSubmitSearch}
                className="shrink-0 text-[#444]"
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
                placeholder="搜尋"
                className="w-full bg-transparent text-[16px] text-[#333] outline-none placeholder:text-[#999]"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="shrink-0 text-[15px] font-medium text-[#666]"
            >
              CLOSE
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="default-bar"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="relative flex h-full items-center justify-between"
          >
            <div className="relative flex w-[44px] justify-start">
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="grid h-[30px] w-[30px] place-items-center bg-transparent text-[#111]"
              >
                <PlusIcon />
              </button>
            </div>

            <div
  className="absolute left-1/2 -translate-x-1/2"
  ref={topMenuRef}
>
  <button
    type="button"
    onClick={() => setIsTopMenuOpen((prev) => !prev)}
    className="flex min-w-0 items-center justify-center gap-[4px] bg-transparent"
  >
    <img
      src="/vibelink-logo.png"
      alt="Vibelink"
      className="h-[40px] translate-y-[2px] object-contain drop-shadow-[0_2px_6px_rgba(193,107,240,0.35)]"
    />

    <motion.span
      animate={{ rotate: isTopMenuOpen ? 180 : 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex items-center justify-center"
    >
      <ChevronDownIcon />
    </motion.span>
  </button>

  {/* 🔥 這就是你缺的 */}
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
        <div className="flex flex-col gap-[30px]">
          <button className="flex w-full items-center justify-center rounded-[16px] px-[25px] py-[30px] text-[20px] font-medium text-[#222] hover:bg-[#222]/8">
            <FollowingIcon />
            <span className="ml-2">追蹤中</span>
          </button>

          <button className="flex w-full items-center justify-center rounded-[16px] px-[20px] py-[22px] text-[20px] font-medium text-[#222] hover:bg-[#222]/8">
            <FavoriteIcon />
            <span className="ml-2">最愛</span>
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
                

            <div className="flex w-[96px] items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="grid h-[36px] w-[36px] place-items-center bg-transparent text-[#111]"
              >
                <SearchIcon />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>

    <AnimatePresence>
      {isUploadOpen && (
        <UploadFullPage onClose={() => setIsUploadOpen(false)} />
      )}
    </AnimatePresence>

      <main className="min-h-screen box-border px- pb-[90px] pt-[60px]">
        <section className="px-[14px] pt-[10px]">
  <h1 className="mb-[13px] text-[18px] font-semibold">
    <span className="text-[#8B5CF6]">VIBE</span>
    <span className="text-black"> WALL</span>
  </h1>

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

        <div className="pointer-events-none fixed bottom-[96px] left-0 right-0 z-[24] mx-auto w-full max-w-[430px] px-4">
          <div
            className={`flex ${
              feedCapsulePosition === '左'
                ? 'justify-start'
                : feedCapsulePosition === '中'
                  ? 'justify-center'
                  : 'justify-end'
            }`}
          >
            <button
              type="button"
              onClick={handleCycleFeedMode}
              className="pointer-events-auto flex h-[35px] min-w-[85px] items-center justify-center gap-[5px] rounded-full border border-white/40 bg-gray-200/60 text-[#444] shadow-[0_6px_16px_rgba(0,0,0,0.08)] backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: isFeedCapsulePressed ? 'scale(1.06)' : 'scale(1)',
                transformOrigin: 'center center',
              }}
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
            data-no-page-swipe="true"
            className="fixed inset-0 z-[200] bg-[#efefef] touch-pan-y"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onTouchStart={handleStoryTouchStart}
            onTouchMove={handleStoryTouchMove}
            onTouchEnd={handleStoryTouchEnd}
            style={{ opacity: storyOverlayOpacity }}
          >
            <div className="relative mx-auto h-full w-full max-w-[430px]">
              {(() => {
                const pages = storyPagesMap[selectedStory.id] || []
                const currentPage = pages[storyPage] || pages[0]

                return (
                  <>
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

                    <div className="absolute left-0 right-0 top-0 z-[6] flex items-center justify-between px-5 pt-7">
                      <div className="flex items-center gap-3">
                        <div className="h-[42px] w-[42px] rounded-full bg-[#d8d8d8]" />
                        <div className="text-[16px] font-medium text-[#111]">
                          {selectedStory.author}
                        </div>
                      </div>

                      <button
                        onClick={closeStoryViewer}
                        className="rounded-full bg-[#e5e5e5] px-4 py-2 text-[13px] font-medium text-[#333]"
                      >
                        CLOSE
                      </button>
                    </div>

                    <div className="flex h-full w-full items-center justify-center px-4 pt-[80px] pb-[140px]">
                      <motion.div
                        key={selectedStory.id}
                        initial={{
                          x:
                            storyDirection === 'story-next'
                              ? 52
                              : storyDirection === 'story-prev'
                                ? -52
                                : 0,
                          opacity:
                            storyDirection === 'story-next' ||
                            storyDirection === 'story-prev'
                              ? 0.72
                              : 1,
                          scale:
                            storyDirection === 'story-next' ||
                            storyDirection === 'story-prev'
                              ? 0.97
                              : 1,
                        }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{
                          x:
                            storyDirection === 'story-next'
                              ? -52
                              : storyDirection === 'story-prev'
                                ? 52
                                : 0,
                          opacity:
                            storyDirection === 'story-next' ||
                            storyDirection === 'story-prev'
                              ? 0.72
                              : 1,
                          scale:
                            storyDirection === 'story-next' ||
                            storyDirection === 'story-prev'
                              ? 0.97
                              : 1,
                        }}
                        transition={{ duration: 0.26, ease: 'easeOut' }}
                        className="relative h-full w-full max-w-[390px] overflow-hidden rounded-[28px] shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
                        style={{
                          backgroundColor: currentPage?.bg || '#cfa2cc',
                          y: storyDragY,
                          scale: storyCardScale,
                          opacity: storyCardOpacity,
                        }}
                        onMouseDown={() => setIsStoryPaused(true)}
                        onMouseUp={() => setIsStoryPaused(false)}
                        onMouseLeave={() => setIsStoryPaused(false)}
                      >
                        <div className="flex h-full items-center justify-center px-6 text-center text-[20px] text-white/85">
                          {currentPage?.title || '配對牆內容'}
                        </div>

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

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="rounded-[26px] bg-[#ead7ef] px-6 py-4 shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
                        <div className="grid grid-cols-3 text-center text-[#111]">
                          <button className="flex flex-col items-center gap-2">
                            <span className="flex h-[30px] w-[30px] items-center justify-center">
                              <ProfileIcon />
                            </span>
                            <span className="text-[14px]">他的檔案</span>
                          </button>

                          <button className="flex flex-col items-center gap-2">
                            <span className="flex h-[30px] w-[30px] items-center justify-center">
                              <HeartIcon />
                            </span>
                            <span className="text-[14px]">喜歡</span>
                          </button>

                          <button className="flex flex-col items-center gap-2">
                            <span className="flex h-[30px] w-[30px] items-center justify-center">
                              <MailIcon />
                            </span>
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
        {isPeopleLibraryOpen && (
          <PeopleLibraryPage
            query="People Library"
            onClose={() => setIsPeopleLibraryOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFriendInviteOpen && (
          <FriendInvitePage onClose={() => setIsFriendInviteOpen(false)} />
        )}
      </AnimatePresence>
    </div>
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

function ProfileIcon() {
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

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16v10H4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M5 8l7 6 7-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}