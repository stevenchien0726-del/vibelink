'use client'

import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import type { Locale } from '@/i18n'

type AIRadarTopBarProps = {
  showTopBar: boolean
  locale: Locale
  onClickVibePlus: () => void
  onClickAIRadarInfo?: () => void
}

function AIRadarTopBar({
  showTopBar,
  locale,
  onClickVibePlus,
  onClickAIRadarInfo,
}: AIRadarTopBarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const membershipLabel = String(locale).toLowerCase().startsWith('en')
    ? 'Vibe Membership'
    : 'Vibe會員'

  useEffect(() => {
    const updateTheme = () => {
      const html = document.documentElement
      const body = document.body

      setIsDarkMode(
        html.classList.contains('dark') ||
          body.classList.contains('dark') ||
          html.getAttribute('data-theme') === 'dark' ||
          body.getAttribute('data-theme') === 'dark'
      )
    }

    updateTheme()

    const observer = new MutationObserver(updateTheme)

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    })

    return () => observer.disconnect()
  }, [])

  if (!showTopBar) return null

  return (
    <div
      className="fixed left-1/2 top-0 z-[80] w-full max-w-[430px] -translate-x-1/2 border-b border-[var(--app-card-border)] bg-[var(--app-bg)]/95"
      style={{
        paddingTop: 'calc(max(env(safe-area-inset-top) - 28px, 0px) + 6px)',
      }}
    >
      <div className="flex h-[64px] items-center justify-between px-5">
        {/* Left: AI Radar info button */}
        <button
          type="button"
          onClick={onClickAIRadarInfo}
          className="
            flex
            h-[44px]
            items-center
            gap-0
            rounded-full
            bg-transparent
            px-0
            transition
            active:scale-[0.97]
          "
        >
          <Image
            src="/image/ai-radar-logo.png"
            alt="AI Radar"
            width={116}
            height={30}
            className="-ml-6 h-[85px] w-auto object-contain"
            priority
          />
        </button>

        {/* Right: Vibe Plus entrance */}
        <button
          type="button"
          onClick={onClickVibePlus}
          className="
            flex
            h-[44px]
            items-center
            gap-1
            rounded-full
            bg-transparent
            px-0
            text-[15px]
            font-medium
            shadow-none
            transition
            active:scale-[0.97]
          "
          style={{
            color: isDarkMode ? '#ffffff' : '#111111',
          }}
        >
          <span>{membershipLabel}</span>

          <ChevronRight
            size={18}
            strokeWidth={2.2}
          />
        </button>
      </div>
    </div>
  )
}

export default memo(AIRadarTopBar)
