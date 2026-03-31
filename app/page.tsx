'use client'

import { useRef, useState } from 'react'
import HomePage from '@/pages/HomePage'
import AIHelperPage from '@/pages/AIHelperPage'
import MessagePage from '@/pages/MessagePage'
import ProfilePage from '@/components/message/ProfilePage'
import VibeTvPage from '@/pages/VibeTvPage'
import BottomNav from '@/components/home/ui/nav/BottomNav'

export type AppPage = 'home' | 'ai' | 'message' | 'profile' | 'tv'

const pageOrder: AppPage[] = ['home', 'ai', 'message', 'profile', 'tv']

export default function Page() {
  const [page, setPage] = useState<AppPage>('message')

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartTarget = useRef<EventTarget | null>(null)

  function getCurrentPageIndex(currentPage: AppPage) {
    return pageOrder.indexOf(currentPage)
  }

  function goToPrevPage() {
    const currentIndex = getCurrentPageIndex(page)
    if (currentIndex > 0) {
      setPage(pageOrder[currentIndex - 1])
    }
  }

  function goToNextPage() {
    const currentIndex = getCurrentPageIndex(page)
    if (currentIndex < pageOrder.length - 1) {
      setPage(pageOrder[currentIndex + 1])
    }
  }

  function isBlockedSwipeTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false

    return Boolean(
      target.closest('[data-horizontal-scroll="true"]') ||
        target.closest('[data-no-page-swipe="true"]') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('[contenteditable="true"]')
    )
  }

  function handleTouchStart(e: React.TouchEvent<HTMLElement>) {
    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    touchStartTarget.current = e.target
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLElement>) {
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    const passedHorizontalThreshold = absX > 48
    const isMostlyHorizontal = absX > absY

    if (!passedHorizontalThreshold || !isMostlyHorizontal) return
    if (isBlockedSwipeTarget(touchStartTarget.current)) return

    if (deltaX > 0) {
      goToPrevPage()
    } else {
      goToNextPage()
    }
  }

  return (
    <main
      className="mx-auto min-h-screen w-full max-w-[430px] overflow-x-hidden bg-[#f5f5f5] pb-[90px]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {page === 'home' && <HomePage />}
      {page === 'ai' && <AIHelperPage />}
      {page === 'message' && <MessagePage />}
      {page === 'profile' && <ProfilePage />}
      {page === 'tv' && <VibeTvPage />}

      <BottomNav current={page} setPage={setPage} />
    </main>
  )
}