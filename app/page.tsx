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
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isDraggingPage, setIsDraggingPage] = useState(false)
  const [isSnapAnimating, setIsSnapAnimating] = useState(false)

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

  function setPageDirect(nextPage: AppPage) {
    setIsDraggingPage(false)
    setIsSnapAnimating(false)
    setSwipeOffset(0)
    setPage(nextPage)
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
    setIsSnapAnimating(false)
  }

  function handleTouchMove(e: React.TouchEvent<HTMLElement>) {
    if (isBlockedSwipeTarget(touchStartTarget.current)) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (absX < 8 || absX <= absY) return

    const currentIndex = getCurrentPageIndex(page)
    const isAtFirstPage = currentIndex === 0
    const isAtLastPage = currentIndex === pageOrder.length - 1

    let nextOffset = deltaX

    if ((isAtFirstPage && deltaX > 0) || (isAtLastPage && deltaX < 0)) {
      nextOffset = deltaX * 0.28
    }

    setIsDraggingPage(true)
    setSwipeOffset(nextOffset)
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLElement>) {
    if (isBlockedSwipeTarget(touchStartTarget.current)) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    const passedHorizontalThreshold = absX > 72
    const isMostlyHorizontal = absX > absY

    if (isDraggingPage) {
      setIsDraggingPage(false)
      setIsSnapAnimating(true)
    }

    if (!passedHorizontalThreshold || !isMostlyHorizontal) {
      setSwipeOffset(0)
      window.setTimeout(() => setIsSnapAnimating(false), 220)
      return
    }

    const currentIndex = getCurrentPageIndex(page)
    const isAtFirstPage = currentIndex === 0
    const isAtLastPage = currentIndex === pageOrder.length - 1

    if (deltaX > 0) {
      if (!isAtFirstPage) {
        goToPrevPage()
      }
    } else {
      if (!isAtLastPage) {
        goToNextPage()
      }
    }

    setSwipeOffset(0)
    window.setTimeout(() => setIsSnapAnimating(false), 220)
  }

  const pageTranslateStyle =
    isDraggingPage || isSnapAnimating
      ? { transform: `translateX(${swipeOffset}px)` }
      : undefined

  return (
    <main
      className="mx-auto min-h-screen w-full max-w-[430px] overflow-x-hidden bg-[#f5f5f5] pb-[90px]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`min-h-screen ${
          isDraggingPage
            ? 'will-change-transform'
            : isSnapAnimating
            ? 'will-change-transform transition-transform duration-200 ease-out'
            : ''
        }`}
        style={pageTranslateStyle}
      >
        {page === 'home' && <HomePage />}
        {page === 'ai' && <AIHelperPage />}
        {page === 'message' && <MessagePage />}
        {page === 'profile' && <ProfilePage />}
        {page === 'tv' && <VibeTvPage />}
      </div>

      <BottomNav current={page} setPage={setPageDirect} />
    </main>
  )
}