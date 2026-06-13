'use client'

import { useRef, useState, type TouchEvent } from 'react'

type UsePullToRefreshParams = {
  disabled?: boolean
  isRefreshing: boolean
  onRefresh: () => Promise<void>
  getScrollTop?: () => number
  threshold?: number
  minPullDistance?: number
}

export function usePullToRefresh({
  disabled = false,
  isRefreshing,
  onRefresh,
  getScrollTop,
  threshold = 110,
  minPullDistance = 18,
}: UsePullToRefreshParams) {
  const startYRef = useRef<number | null>(null)
  const pullingRef = useRef(false)
  const [pullDistance, setPullDistance] = useState(0)

  function readScrollTop() {
    if (getScrollTop) return getScrollTop()
    return window.scrollY || document.documentElement.scrollTop || 0
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    if (disabled || isRefreshing || readScrollTop() > 0) {
      startYRef.current = null
      pullingRef.current = false
      return
    }

    startYRef.current = event.touches[0]?.clientY ?? null
    pullingRef.current = false
  }

  function handleTouchMove(event: TouchEvent<HTMLElement>) {
    if (disabled || isRefreshing || startYRef.current == null) return

    const currentY = event.touches[0]?.clientY ?? startYRef.current
    const deltaY = currentY - startYRef.current

    if (deltaY <= 0 || readScrollTop() > 0) {
      pullingRef.current = false
      setPullDistance(0)
      return
    }

    if (deltaY < minPullDistance) {
      pullingRef.current = false
      setPullDistance(0)
      return
    }

    pullingRef.current = true
    setPullDistance(Math.min(deltaY, 130))
    event.preventDefault()
  }

  async function handleTouchEnd() {
    if (disabled || isRefreshing) {
      startYRef.current = null
      pullingRef.current = false
      setPullDistance(0)
      return
    }

    const shouldRefresh = pullingRef.current && pullDistance >= threshold

    startYRef.current = null
    pullingRef.current = false
    setPullDistance(0)

    if (shouldRefresh) {
      await onRefresh()
    }
  }

  return {
    pullDistance,
    pullHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
    },
  }
}
