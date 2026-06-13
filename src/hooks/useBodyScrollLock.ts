'use client'

import { useEffect } from 'react'

let lockCount = 0
let lockedScrollY = 0
let previousBodyStyle: Partial<CSSStyleDeclaration> = {}
let previousHtmlStyle: Partial<CSSStyleDeclaration> = {}

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const body = document.body
    const html = document.documentElement

    if (lockCount === 0) {
      lockedScrollY = window.scrollY || window.pageYOffset || 0

      previousBodyStyle = {
        overflow: body.style.overflow,
        position: body.style.position,
        top: body.style.top,
        width: body.style.width,
        overscrollBehavior: body.style.overscrollBehavior,
      }

      previousHtmlStyle = {
        overflow: html.style.overflow,
        overscrollBehavior: html.style.overscrollBehavior,
      }

      body.style.overflow = 'hidden'
      body.style.position = 'fixed'
      body.style.top = `-${lockedScrollY}px`
      body.style.width = '100%'
      body.style.overscrollBehavior = 'none'
      html.style.overflow = 'hidden'
      html.style.overscrollBehavior = 'none'
    }

    lockCount += 1

    return () => {
      lockCount = Math.max(0, lockCount - 1)

      if (lockCount > 0) return

      body.style.overflow = previousBodyStyle.overflow ?? ''
      body.style.position = previousBodyStyle.position ?? ''
      body.style.top = previousBodyStyle.top ?? ''
      body.style.width = previousBodyStyle.width ?? ''
      body.style.overscrollBehavior = previousBodyStyle.overscrollBehavior ?? ''
      html.style.overflow = previousHtmlStyle.overflow ?? ''
      html.style.overscrollBehavior = previousHtmlStyle.overscrollBehavior ?? ''

      window.scrollTo(0, lockedScrollY)
    }
  }, [locked])
}
