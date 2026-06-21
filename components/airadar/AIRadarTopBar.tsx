'use client'

import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

type AIRadarTopBarProps = {
  showTopBar: boolean
  onClickVibePlus: () => void
  onClickAIRadarInfo?: () => void
}

export default function AIRadarTopBar({
  showTopBar,
  onClickVibePlus,
  onClickAIRadarInfo,
}: AIRadarTopBarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)

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
      className="fixed left-1/2 top-0 z-[80] w-full max-w-[430px] -translate-x-1/2 border-b border-[var(--app-card-border)] bg-[var(--app-bg)] backdrop-blur-[18px]"
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
          <span>Vibe Plus</span>

          <ChevronRight
            size={18}
            strokeWidth={2.2}
          />
        </button>
      </div>
    </div>
  )
}
