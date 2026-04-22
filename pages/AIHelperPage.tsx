'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, animate, useMotionValue, useTransform } from 'framer-motion'
import PeopleLibraryPage from '@/components/home/sections/people/PeopleLibraryPage'
import { fakeAiSearch } from '../lib/fakeAiSearch'
import { FakeUser } from '../data/fakeUsers'

type HistoryItem = {
  id: string
  title: string
}

const historyItems: HistoryItem[] = [
  { id: 'h1', title: '幫我找可愛奶狗弟弟' },
  { id: 'h2', title: '喜歡大自然的女生' },
  { id: 'h3', title: '身材性感內建男模特' },
  { id: 'h4', title: '想找今晚可以聊天的人' },
]

const suggestionItems = [
  '幫我找可愛奶狗弟弟',
  '喜歡大自然的女生',
  '身材性感內建男模特',
]

const MEMBERSHIP_URL = 'https://vibelink-j9m5.vercel.app/'
const DRAWER_WIDTH = 320

function openMembershipSite() {
  window.open(MEMBERSHIP_URL, '_blank')
}

export default function AIHelperPage() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const [loading, setLoading] = useState(false)
const [results, setResults] = useState<FakeUser[]>([])
const [aiText, setAiText] = useState('')

const [displayedAiText, setDisplayedAiText] = useState('')
const [showCandidates, setShowCandidates] = useState(false)
const [showWalls, setShowWalls] = useState(false)
const [showMorePrompts, setShowMorePrompts] = useState(false)

  const [isPeopleLibraryOpen, setIsPeopleLibraryOpen] = useState(false)
  const [selectedLibraryUser, setSelectedLibraryUser] = useState<{
  id: string
  name: string
  avatar: string
} | null>(null)

  const drawerRef = useRef<HTMLDivElement>(null)
  const drawerX = useMotionValue(-DRAWER_WIDTH)
  const overlayOpacity = useTransform(drawerX, [-DRAWER_WIDTH, 0], [0, 1])

  const hasInput = inputValue.trim().length > 0 || !!selectedLibraryUser

  const openDrawer = () => {
    drawerX.set(-DRAWER_WIDTH)
    setIsHistoryOpen(true)

    requestAnimationFrame(() => {
      animate(drawerX, 0, {
        type: 'spring',
        stiffness: 420,
        damping: 36,
        mass: 0.9,
      })
    })
  }

  const closeDrawer = () => {
    animate(drawerX, -DRAWER_WIDTH, {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => setIsHistoryOpen(false),
    })
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node

      if (
        isHistoryOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(target)
      ) {
        closeDrawer()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isHistoryOpen])

  function typeText(text: string, onDone?: () => void) {
  setDisplayedAiText('')
  let index = 0

  const timer = setInterval(() => {
    index += 1
    setDisplayedAiText(text.slice(0, index))

    if (index >= text.length) {
      clearInterval(timer)
      onDone?.()
    }
  }, 22)
}

const stopSwipePropagation = (e: React.TouchEvent<HTMLDivElement>) => {
  e.stopPropagation()
}

const stopPointerPropagation = (e: React.PointerEvent<HTMLDivElement>) => {
  e.stopPropagation()
}

const stopWheelPropagation = (e: React.WheelEvent<HTMLDivElement>) => {
  e.stopPropagation()
}

function handlePickLibraryUser(user: {
  id: string
  name: string
  avatar: string
}) {
  setSelectedLibraryUser(user)
  setIsPeopleLibraryOpen(false)
}

  const handleSubmit = () => {
  if (!hasInput && !selectedLibraryUser) return

  setLoading(true)
  setResults([])
  setAiText('')
  setDisplayedAiText('')
  setShowCandidates(false)
  setShowWalls(false)
  setShowMorePrompts(false)

  const currentInput = inputValue.trim()
const finalQuery =
  currentInput || (selectedLibraryUser ? `幫我找像 ${selectedLibraryUser.name} 的人` : '')

  setTimeout(() => {
    const matchedUsers = fakeAiSearch(finalQuery)

    let nextAiText = ''
    if (matchedUsers.length > 0) {
      nextAiText = selectedLibraryUser
  ? `我幫你從「${selectedLibraryUser.name}」延伸找出幾位相似類型的用戶，整體更偏向情緒回饋感高、互動自然、照片氛圍接近的人選。`
  : `我幫你篩選出幾位符合「${finalQuery}」的用戶，整體更偏向情緒回饋感高、互動自然、照片氛圍容易產生好感的人選。`
    } else {
      nextAiText = selectedLibraryUser
  ? `目前沒有找到完全符合「${selectedLibraryUser.name} 相似類型」的用戶，你可以再補充想要的感覺。`
  : `目前沒有找到完全符合「${finalQuery}」的用戶，你可以換更簡短的描述再試一次。`
    }

    setAiText(nextAiText)
    setLoading(false)

    typeText(nextAiText, () => {
  if (matchedUsers.length > 0) {
    setResults(matchedUsers)

    setTimeout(() => {
      setShowCandidates(true)
    }, 120)

    setTimeout(() => {
      setShowWalls(true)
    }, 260)

    setTimeout(() => {
      setShowMorePrompts(true)
    }, 420)
  } else {
    setShowMorePrompts(true)
  }

  // ✅ 就加在這裡
  setSelectedLibraryUser(null)
})
  }, 900)
}

  
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f5f5f5]">
      {/* Top bar */}
      <div className="fixed top-0 left-1/2 z-[40] flex h-[60px] w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[rgba(245,245,245,0.96)] px-4 backdrop-blur-md">
        <button
          type="button"
          aria-label="Open history"
          onClick={openDrawer}
          className="grid h-10 w-10 place-items-center bg-transparent text-[#111]"
        >
          <MenuIcon />
        </button>

        <button
          type="button"
          onClick={openMembershipSite}
          className="flex min-w-0 items-center gap-[4px] bg-transparent"
        >
          <span className="truncate text-[17px] font-medium tracking-[-0.2px] text-[#111]">
            Vibe Plus
          </span>
          <ChevronRightIcon />
        </button>

        <div className="w-10" />
      </div>

      {/* Main content */}
      <main className="min-h-screen px-4 pt-[76px] pb-[170px]">
        <div className="flex min-h-[calc(100vh-76px)] flex-col">
         
          {/* suggestions */}

          {!loading && !aiText && results.length === 0 && (
  <div className="fixed bottom-[154px] left-1/2 z-[55] grid w-full max-w-[430px] -translate-x-1/2 grid-cols-3 gap-3 px-4">
    {suggestionItems.map((item) => (
      <button
        key={item}
        type="button"
        onClick={() => setInputValue(item)}
        className="min-h-[74px] rounded-[18px] bg-[rgba(255,255,255,0.72)] px-3 py-3 text-left shadow-[0_4px_14px_rgba(0,0,0,0.05)] backdrop-blur-[6px] transition active:scale-[0.98]"
      >
        <span className="block text-[14px] leading-[1.3] text-[#111]">
          {item}
        </span>
      </button>
    ))}
  </div>
)}

{/* AI Result 區 */}
<div className="mb-4 space-y-3">
  {loading && (
    <div className="rounded-[18px] bg-white px-4 py-3 text-[14px] text-gray-500 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      Analyzing your request...
    </div>
  )}

  {(loading || displayedAiText) && (
  <div className="rounded-[18px] bg-[#ead8f5] px-4 py-3 text-[14px] leading-[1.45] text-[#3f2c4f] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
    {loading && !displayedAiText ? 'Analyzing your request...' : displayedAiText}
  </div>
)}
   

  {showCandidates && results.length > 0 && (
  <div className="space-y-4">

      {results.slice(0, 2).map((user, index) => (
        <div key={user.id} className="space-y-3">
          {/* 候選人標題 + 分析 */}
          <div className="px-1">
            <div className="mb-1 text-[15px] font-semibold text-[#1f1f1f]">
               {user.name} ｜ {user.age}歲
            </div>

            <div className="text-[14px] leading-[1.45] text-[#2d2d2d]">
              奶狗感、{user.tags.slice(0, 2).join('、')}、互動感偏高，
              整體氛圍偏可愛又帶一點主動感。
            </div>

            <div className="mt-2 text-[13px] leading-[1.45] text-[#3a3a3a]">
              社群照片感：{user.tags.join('、')}
            </div>
          </div>

          {/* 候選人相片牆 */}
<div className="space-y-2">
  <div className="text-[16px] font-medium text-[#6b4f7f]">
    {user.name} 的相片牆
  </div>


 

  <div
  data-horizontal-scroll="true"
  className="-mx-1 overflow-x-auto pb-1 no-scrollbar touch-pan-x"
  onTouchStart={stopSwipePropagation}
  onTouchMove={stopSwipePropagation}
  onPointerDown={stopPointerPropagation}
  onPointerMove={stopPointerPropagation}
  onWheel={stopWheelPropagation}
>

    <div className="flex gap-3 px-1 select-none">
      {Array.from({ length: 5 }).map((_, photoIndex) => {
        const imgSrc = user.images[photoIndex % user.images.length]

        return (
          <button
            key={`${user.id}-photo-${photoIndex}`}
            type="button"
            className="shrink-0 text-left transition active:scale-[0.98]"
          >
            <div className="h-[160px] w-[110px] overflow-hidden rounded-[16px] bg-[#ead8f5] shadow-[0_3px_10px_rgba(0,0,0,0.05)]">
              <img
                src={imgSrc}
                alt={`${user.name} photo ${photoIndex + 1}`}
                className="h-full w-full object-cover"
              />
            </div>

            
          </button>
        )
      })}
    </div>
  </div>



</div>
        </div>
      ))}

{showWalls && (
  <div className="space-y-4 pt-4">
    {/* 第一行：更多人選照片牆 */}
    <div className="space-y-2">
      <div className="flex items-center gap-1 text-[14px] text-[#3d3d3d]">
        <span>🖼️</span>
        <span>更多人選照片牆</span>
      </div>

      <div
  data-horizontal-scroll="true"
  className="-mx-1 overflow-x-auto pb-1 no-scrollbar touch-pan-x"
  onTouchStart={stopSwipePropagation}
  onTouchMove={stopSwipePropagation}
  onPointerDown={stopPointerPropagation}
  onPointerMove={stopPointerPropagation}
  onWheel={stopWheelPropagation}
>
        <div className="flex gap-3 px-1 select-none">
          {Array.from({ length: 10 }).map((_, photoIndex) => {
            const poolUser = results[photoIndex % results.length]
            const imgSrc = poolUser.images[photoIndex % poolUser.images.length]

            return (
              <button
                key={`more-wall-${photoIndex}`}
                type="button"
                className="shrink-0"
              >
                <div className="h-[138px] w-[96px] overflow-hidden rounded-[16px] bg-[#ead8f5]">
                  <img
                    src={imgSrc}
                    alt={`${poolUser.name} wall photo ${photoIndex + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                
              </button>
            )
          })}
        </div>
      </div>
    </div>

    {/* 第二行：相似的人 */}
    <div className="space-y-2">
      <div className="flex items-center gap-1 text-[14px] text-[#3d3d3d]">
        <span>🖼️</span>
        <span>相似的人</span>
      </div>

      <div
  data-horizontal-scroll="true"
  className="-mx-1 overflow-x-auto pb-1 no-scrollbar touch-pan-x"
  onTouchStart={stopSwipePropagation}
  onTouchMove={stopSwipePropagation}
  onPointerDown={stopPointerPropagation}
  onPointerMove={stopPointerPropagation}
  onWheel={stopWheelPropagation}
>
        <div className="flex gap-3 px-1 select-none">
          {Array.from({ length: 10 }).map((_, photoIndex) => {
            const poolUser = results[(photoIndex + 1) % results.length]
            const imgSrc = poolUser.images[photoIndex % poolUser.images.length]

            return (
              <button
                key={`similar-wall-${photoIndex}`}
                type="button"
                className="shrink-0"
              >
                <div className="h-[138px] w-[96px] overflow-hidden rounded-[16px] bg-[#ead8f5]">
                  <img
                    src={imgSrc}
                    alt={`${poolUser.name} similar photo ${photoIndex + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                
              </button>
            )
          })}
        </div>
      </div>
    </div>
  </div>
)}

{/* 更多提示詞 */}
{showMorePrompts && (
  <div className="mt-6 px-1">
    <div className="flex items-center gap-1 text-[16px] font-medium text-[#6b4f7f]">
      <span>✨</span>
      <span>更多提示詞</span>
    </div>

    <div className="mt-3 flex flex-col gap-5">
      {[
        '幫我找更成熟一點的奶狗男生',
        '找夜生活但個性溫柔的人',
        '想找高互動感、會主動聊天的人',
      ].map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => {
            setInputValue(prompt)
            setTimeout(() => {
              handleSubmit()
            }, 100)
          }}
          className="w-full rounded-[14px] bg-white px-3 py-4 text-left text-[14px] text-[#222] shadow-[0_3px_10px_rgba(0,0,0,0.04)] transition active:scale-[0.98]"
        >
          {prompt}
        </button>
      ))}
    </div>
  </div>
)}

    </div>
  )}
</div>
</div>
</main>

          {/* Fixed Input row */}
{/* Fixed Input row */}
<div className="fixed bottom-[92px] left-1/2 z-[60] flex w-full max-w-[430px] -translate-x-1/2 items-center gap-2 px-4">
  {/* 左側入口：未選人時顯示 People Library，選到人後直接覆蓋成 user capsule */}
  {selectedLibraryUser ? (
    <div className="flex h-[50px] w-[150px] shrink-0 items-center gap-2 rounded-full bg-[#D9D9D9] px-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <img
        src={selectedLibraryUser.avatar}
        alt={selectedLibraryUser.name}
        className="h-[30px] w-[30px] rounded-full object-cover"
      />

      <span className="min-w-0 flex-1 truncate text-[13px] text-[#222]">
        {selectedLibraryUser.name}
      </span>

      <button
        type="button"
        aria-label="Clear selected user"
        onClick={() => setSelectedLibraryUser(null)}
        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#cfcfcf] text-[12px] leading-none text-[#555] transition active:scale-95"
      >
        ×
      </button>
    </div>
  ) : (
    <button
      type="button"
      aria-label="Open People Library"
      onClick={() => setIsPeopleLibraryOpen(true)}
      className="flex h-[50px] w-[110px] shrink-0 items-center justify-center gap-[8px] rounded-full bg-[#D9D9D9] px-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition active:scale-95"
    >
      <UserCircleIcon />
      <span className="text-[22px] font-semibold leading-none text-[#111]">
        +
      </span>
    </button>
  )}

  {/* AI 輸入框 */}
  <div className="flex h-[50px] min-w-0 flex-1 items-center rounded-full bg-[#d0d0d0] pl-4 pr-[6px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
    <input
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSubmit()
        }
      }}
      placeholder="AI找人幫手"
      className="w-full min-w-0 bg-transparent text-[15px] text-[#222] placeholder:text-[#8a8a8a] outline-none"
    />

    <button
      type="button"
      aria-label="Send"
      onClick={handleSubmit}
      className="ml-2 grid h-[36px] w-[36px] shrink-0 place-items-center rounded-full bg-transparent transition active:scale-95"
    >
      <EnterArrowIcon active={hasInput || !!selectedLibraryUser} />
    </button>
  </div>
</div>

      {/* History drawer */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close history drawer"
              onClick={closeDrawer}
              className="fixed top-0 left-1/2 z-[140] h-full w-full max-w-[430px] -translate-x-1/2 bg-[rgba(0,0,0,0.14)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ opacity: overlayOpacity }}
              transition={{ duration: 0.2 }}
            />

            <motion.aside
              ref={drawerRef}
              className="fixed top-0 left-1/2 z-[141] flex h-full w-[76%] max-w-[320px] -translate-x-[215px] flex-col overflow-y-auto bg-white shadow-[10px_0_30px_rgba(0,0,0,0.08)]"
              style={{ x: drawerX }}
              drag="x"
              dragDirectionLock
              dragMomentum={false}
              dragElastic={0.02}
              dragConstraints={{ left: -DRAWER_WIDTH, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80 || info.velocity.x < -400) {
                  closeDrawer()
                } else {
                  animate(drawerX, 0, {
                    type: 'spring',
                    stiffness: 420,
                    damping: 36,
                    mass: 0.9,
                  })
                }
              }}
            >
              <div className="border-b border-[#ececec] px-4 pb-4 pt-5">
                <button
                  type="button"
                  onClick={openMembershipSite}
                  className="mb-2 flex items-center gap-[4px] bg-transparent"
                >
                  <span className="text-[22px] font-medium text-[#111]">
                    Vibe Plus
                  </span>
                  <ChevronRightIcon />
                </button>

                <div className="pb-1 pt-3">
                  <span className="text-[13px] font-medium text-[#888]">
                    聊天歷史紀錄
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 px-4 py-4">
                {historyItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setInputValue(item.title)
                      closeDrawer()
                    }}
                    className="rounded-[12px] bg-[#f5f5f5] px-3 py-3 text-left text-[14px] text-[#222] hover:bg-[#ededed]"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* People Library */}
      {isPeopleLibraryOpen && (
  <PeopleLibraryPage
    onClose={() => setIsPeopleLibraryOpen(false)}
    onPickUser={handlePickLibraryUser}
  />
)}
    </div>
  )
}

/* icons */

function MenuIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UserCircleIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M7 18c1-2.2 2.9-3.5 5-3.5s4 1.3 5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function EnterArrowIcon({ active }: { active: boolean }) {
  const color = active ? '#9f449f' : '#111111'

  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.2" />
      <path
        d="M12 16V9"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M8 13l4-4 4 4"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}