'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
Check,
  Moon,
  Heart,
  Ban,
  Globe,
  MessageCircle,
} from 'lucide-react'

import type { Locale } from '@/i18n'

type SettingsPageProps = {
  onClose: () => void
  initialDarkMode?: boolean
  initialShowCity?: boolean

  locale: Locale
  onChangeLocale: (locale: Locale) => void

  onDarkModeChange?: (value: boolean) => void
  onShowCityChange?: (value: boolean) => void

  onBlockedClick?: () => void
  onFavoritesClick?: () => void
  onLanguageClick?: () => void
  onMessagesClick?: () => void
}

const settingsText = {
  'zh-TW': {
    title: '設定',

    darkMode: '深色模式',
    darkOn: '開啟中',
    darkOff: '關閉中',

    favorites: '最愛和按讚',
    messages: '訊息和留言',
    blocked: '已封鎖',

    language: '語言',
  },

  en: {
    title: 'Settings',

    darkMode: 'Dark Mode',
    darkOn: 'On',
    darkOff: 'Off',

    favorites: 'Favorites & Likes',
    messages: 'Messages & Comments',
    blocked: 'Blocked',

    language: 'Language',
  },
} as const

export default function SettingsPage({
  onClose,
  initialDarkMode = false,
  initialShowCity = false,

  locale,
  onChangeLocale,

  onDarkModeChange,
  onShowCityChange,

  onBlockedClick,
  onFavoritesClick,
  onLanguageClick,
  onMessagesClick,
}: SettingsPageProps) {
  const safeLocale: Locale = locale ?? 'zh-TW'
  const text = settingsText[safeLocale]

  const [darkMode, setDarkMode] = useState(initialDarkMode)
  const [showCity, setShowCity] = useState(initialShowCity)

  const [dragX, setDragX] = useState(0)
  const [isDraggingBack, setIsDraggingBack] = useState(false)

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const draggingEnabled = useRef(false)

  useEffect(() => {
    setDarkMode(initialDarkMode)
  }, [initialDarkMode])

  useEffect(() => {
    setShowCity(initialShowCity)
  }, [initialShowCity])

  const handleToggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    onDarkModeChange?.(next)
  }

  const handleToggleShowCity = () => {
    const next = !showCity
    setShowCity(next)
    onShowCityChange?.(next)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()

    const touch = e.touches[0]

    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY

    draggingEnabled.current = touch.clientX <= 32

    setIsDraggingBack(false)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()

    if (!draggingEnabled.current) return
    if (touchStartX.current == null || touchStartY.current == null) return

    const touch = e.touches[0]

    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current

    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
      draggingEnabled.current = false
      setIsDraggingBack(false)
      setDragX(0)
      return
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault()
    }

    if (deltaX > 0) {
      setIsDraggingBack(true)
      setDragX(deltaX)
    } else {
      setIsDraggingBack(false)
      setDragX(0)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()

    if (!draggingEnabled.current) {
      touchStartX.current = null
      touchStartY.current = null
      return
    }

    if (dragX > 90) {
      setDragX(0)
      setIsDraggingBack(false)
      onClose()
    } else {
      setDragX(0)
      setIsDraggingBack(false)
    }

    touchStartX.current = null
    touchStartY.current = null
    draggingEnabled.current = false
  }

  return (
    <motion.div
      className="fixed inset-0 z-[220] flex justify-center bg-[#f3f3f3] touch-pan-y"
      initial={{ x: '100%' }}
      animate={{ x: dragX }}
      exit={{ x: '100%' }}
      transition={
        isDraggingBack
          ? { duration: 0 }
          : {
              duration: 0.34,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative min-h-screen w-full max-w-[430px] bg-[#f3f3f3] text-[#222]">
        <div className="fixed left-1/2 top-0 z-[30] w-full max-w-[430px] -translate-x-1/2 bg-[#f3f3f3]/95 px-4 pb-3 pt-3 backdrop-blur-md">
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              aria-label="返回"
              onClick={onClose}
              className="absolute left-0 flex h-[40px] w-[40px] items-center justify-center rounded-full active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="text-[20px] font-medium tracking-[0.01em]">
              {text.title}
            </div>
          </div>
        </div>

        <div className="px-4 pb-10 pt-[72px]">
          <div className="rounded-[22px] bg-[#d9d9d9] px-4 py-4">

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <span className="flex h-[22px] w-[22px] items-center justify-center text-[#111]">
                  <Moon size={19} strokeWidth={2.1} />
                </span>

                <span className="text-[16px] font-medium text-[#222]">
                  {text.darkMode}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[16px] text-[#222]">
                  {darkMode ? text.darkOn : text.darkOff}
                </span>

                <Switch
                  checked={darkMode}
                  onClick={handleToggleDarkMode}
                />
              </div>
            </div>
          </div>

          <div className="mt-[30px] overflow-hidden rounded-[22px] bg-[#d9d9d9] py-[20px]">
  <SettingsRow
    icon={<Heart size={21} strokeWidth={2.1} />}
    label={text.favorites}
    onClick={onFavoritesClick}
  />

  <Divider />

  <SettingsRow
    icon={<MessageCircle size={21} strokeWidth={2.1} />}
    label={text.messages}
    onClick={onMessagesClick}
  />

  <Divider />

  <SettingsRow
    icon={<Ban size={21} strokeWidth={2.1} />}
    label={text.blocked}
    onClick={onBlockedClick}
  />
</div>

<div className="mt-[24px] rounded-[22px] bg-[#d9d9d9] px-[30px] py-[26px]">
  <div className="mb-5 flex items-center gap-3">
    <span className="flex h-[22px] w-[22px] items-center justify-center text-[#111]">
      <Globe size={21} strokeWidth={2.1} />
    </span>

    <span className="text-[16px] font-medium text-[#222]">
      {text.language}
    </span>
  </div>

  <div className="flex flex-col gap-3">
    <button
      type="button"
      onClick={() => onChangeLocale('zh-TW')}
      className="flex h-[48px] w-full items-center justify-between rounded-[16px] bg-white px-5 text-[15px] font-medium text-[#222] transition active:scale-[0.98]"
    >
      <span>繁中</span>

      {safeLocale === 'zh-TW' && (
        <Check size={20} strokeWidth={2.4} className="text-[#8B5CF6]" />
      )}
    </button>

    <button
      type="button"
      onClick={() => onChangeLocale('en')}
      className="flex h-[48px] w-full items-center justify-between rounded-[16px] bg-white px-5 text-[15px] font-medium text-[#222] transition active:scale-[0.98]"
    >
      <span>English</span>

      {safeLocale === 'en' && (
        <Check size={20} strokeWidth={3} className="text-[#8B5CF6]" />
      )}
    </button>
  </div>
</div>
        </div>
      </div>
    </motion.div>
  )
}

function SettingsRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full grid-cols-[36px_minmax(0,1fr)_60px] items-center gap-x-3 py-[36px] pl-[30px] pr-4 active:bg-[#cfcfcf]"
    >
      <span className="flex h-[22px] w-[52px] items-center justify-center text-[#111]">
        {icon}
      </span>

      <span className="text-left text-[16px] font-medium leading-none text-[#222]">
        {label}
      </span>

      <span className="flex items-center justify-center">
        <ChevronRight
          size={18}
          strokeWidth={2.4}
          className="text-[#444]"
        />
      </span>
    </button>
  )
}

function Switch({
  checked,
  onClick,
}: {
  checked: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className="relative h-[28px] w-[48px] rounded-full bg-[#f3f3f3] transition-colors duration-250"
    >
      <span
        className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-[#d39ad8] shadow-sm transition-all duration-250 ${
          checked ? 'left-[23px]' : 'left-[3px]'
        }`}
      />
    </button>
  )
}

function Divider() {
  return <div className="mx-4 my-[25px] h-px bg-[#2b2b2b]" />
}