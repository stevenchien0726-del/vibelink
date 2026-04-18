'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, animate, useMotionValue, useTransform } from 'framer-motion'
import PeopleLibraryPage from '@/components/home/sections/people/PeopleLibraryPage'

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
  const [isPeopleLibraryOpen, setIsPeopleLibraryOpen] = useState(false)

  const drawerRef = useRef<HTMLDivElement>(null)
  const drawerX = useMotionValue(-DRAWER_WIDTH)
  const overlayOpacity = useTransform(drawerX, [-DRAWER_WIDTH, 0], [0, 1])

  const hasInput = inputValue.trim().length > 0

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

  const handleSubmit = () => {
    if (!hasInput) return
    console.log('AI helper submit:', inputValue)
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
      <main className="min-h-screen px-4 pb-[96px] pt-[76px]">
        <div className="flex min-h-[calc(100vh-172px)] flex-col justify-end">
          {/* suggestions */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            {suggestionItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setInputValue(item)}
                className="min-h-[74px] rounded-[18px] bg-[rgba(255,255,255,0.34)] px-3 py-3 text-left shadow-[0_4px_14px_rgba(0,0,0,0.05)] backdrop-blur-[6px] transition active:scale-[0.98]"
              >
                <span className="block text-[14px] leading-[1.3] text-[#111]">
                  {item}
                </span>
              </button>
            ))}
          </div>

          {/* Input row */}
          <div className="flex items-center gap-2">
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

            <div className="flex h-[50px] flex-1 items-center rounded-full bg-[#d0d0d0] pl-4 pr-[6px]">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit()
                  }
                }}
                placeholder="AI找人幫手"
                className="w-full bg-transparent text-[15px] text-[#222] placeholder:text-[#8a8a8a] outline-none"
              />

              <button
                type="button"
                aria-label="Send"
                onClick={handleSubmit}
                className="ml-2 grid h-[36px] w-[36px] shrink-0 place-items-center rounded-full bg-transparent transition active:scale-95"
              >
                <EnterArrowIcon active={hasInput} />
              </button>
            </div>
          </div>
        </div>
      </main>

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
        <PeopleLibraryPage onClose={() => setIsPeopleLibraryOpen(false)} />
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