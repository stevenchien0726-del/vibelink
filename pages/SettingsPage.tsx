'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
Check,
  Moon,
  Heart,
  Ban,
  Globe,
  Radar
} from 'lucide-react'

import MyAIRadarPage from '@/components/settings/MyAIRadarPage'

import type { Locale } from '@/i18n'
import { supabase } from '@/lib/supabase'

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
  onMyRadarClick?: () => void
}

const settingsText = {
  'zh-TW': {
    title: '設定',

    myRadar: '我的AI雷達',
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

    myRadar: 'My AI Radar',
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
  onMyRadarClick,
}: SettingsPageProps) {
  const safeLocale: Locale = locale ?? 'zh-TW'
  const text = settingsText[safeLocale]

  const [darkMode, setDarkMode] = useState(initialDarkMode)
  const [showCity, setShowCity] = useState(initialShowCity)

  const [languageOpen, setLanguageOpen] = useState(false)
  const [myRadarOpen, setMyRadarOpen] = useState(false)

  const [blockedOpen, setBlockedOpen] = useState(false)
const [blockedUsers, setBlockedUsers] = useState<any[]>([])
const [blockedLoading, setBlockedLoading] = useState(false)
const [confirmUnblockUser, setConfirmUnblockUser] = useState<any>(null)

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
  document.documentElement.classList.toggle('dark', next)
  localStorage.setItem('vibelink-dark-mode', next ? 'dark' : 'light')

  onDarkModeChange?.(next)
}

  const handleToggleShowCity = () => {
    const next = !showCity
    setShowCity(next)
    onShowCityChange?.(next)
  }

  async function loadBlockedUsers() {
  setBlockedLoading(true)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    setBlockedLoading(false)
    return
  }

  const { data: blockRows, error: blockError } = await supabase
  .from('blocked_users')
  .select('id, blocked_user_id, created_at')
  .eq('blocker_id', user.id)
  .order('created_at', { ascending: false })

if (blockError) {
  console.error('讀取封鎖名單失敗:', blockError)
  setBlockedUsers([])
  setBlockedLoading(false)
  return
}

const blockedIds = (blockRows ?? [])
  .map((row) => row.blocked_user_id)
  .filter(Boolean)

if (blockedIds.length === 0) {
  setBlockedUsers([])
  setBlockedLoading(false)
  return
}

const { data: profiles, error: profileError } = await supabase
  .from('profiles')
  .select('id, username, display_name, avatar_url')
  .in('id', blockedIds)

if (profileError) {
  console.error('讀取封鎖用戶 Profile 失敗:', profileError)
}

const profileMap = new Map(
  (profiles ?? []).map((profile) => [profile.id, profile])
)

setBlockedUsers(
  (blockRows ?? []).map((row) => ({
    ...row,
    profiles: profileMap.get(row.blocked_user_id) ?? null,
  }))
)

setBlockedLoading(false)
}

async function unblockUser(row: any) {
  const { error } = await supabase
    .from('blocked_users')
    .delete()
    .eq('id', row.id)

  if (error) {
    console.error('取消封鎖失敗:', error)
    return
  }

  setBlockedUsers((prev) => prev.filter((item) => item.id !== row.id))
  setConfirmUnblockUser(null)
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

  if (languageOpen) {
    setLanguageOpen(false)
    return
  }

  if (blockedOpen) {
  setBlockedOpen(false)
  return
}

  onClose()
}
    else {
      setDragX(0)
      setIsDraggingBack(false)
    }

    touchStartX.current = null
    touchStartY.current = null
    draggingEnabled.current = false
  }

  return (
    <motion.div
      className="fixed inset-0 z-[220] flex justify-center bg-[#dcdcdc] touch-pan-y"
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
      <div className="relative min-h-screen w-full max-w-[430px] bg-[var(--app-bg)] text-[var(--app-text)]">
        <div className="fixed left-1/2 top-0 z-[30] w-full max-w-[430px] -translate-x-1/2 bg-[var(--app-bg)]/95 px-4 pb-3 pt-3 backdrop-blur-md">
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              aria-label="返回"
              onClick={() => {
  if (languageOpen) {
    setLanguageOpen(false)
    return
  }

  onClose()
}}
              className="absolute left-0 flex h-[40px] w-[40px] items-center justify-center rounded-full text-[var(--app-text)] active:scale-95"

            >
              <ChevronLeft size={24} />
            </button>

            <div className="text-[20px] font-medium tracking-[0.01em] text-[var(--app-text)]">
  {blockedOpen ? text.blocked : languageOpen ? text.language : text.title}
</div>
          </div>
        </div>

        <div className="px-4 pb-10 pt-[72px]">
          <AnimatePresence mode="wait">
  {blockedOpen ? (
  <motion.div
    key="blocked-page"
    initial={{ x: '100%' }}
    animate={{ x: 0 }}
    exit={{ x: '100%' }}
    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    className="mt-[4px] overflow-hidden rounded-[22px] bg-[var(--app-card)] py-[10px]"
  >
    {blockedLoading ? (
      <div className="py-10 text-center text-[14px] text-[var(--app-muted)]">
        讀取中...
      </div>
    ) : blockedUsers.length === 0 ? (
      <div className="py-10 text-center text-[14px] text-[var(--app-muted)]">
        目前沒有封鎖用戶
      </div>
    ) : (
      blockedUsers.map((row) => {
        const user = row.profiles

        return (
          <div
            key={row.id}
            className="flex h-[76px] items-center gap-3 px-4"
          >
            <div className="h-[44px] w-[44px] overflow-hidden rounded-full bg-[var(--app-surface)]">
              {user?.avatar_url && (
                <img
                  src={user.avatar_url}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-medium text-[var(--app-text)]">
                {user?.display_name || user?.username || 'Vibelink User'}
              </div>
              <div className="truncate text-[13px] text-[var(--app-muted)]">
                @{user?.username || 'user'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setConfirmUnblockUser(row)}
              className="rounded-full bg-[#c86cff] px-4 py-2 text-[13px] font-medium text-white active:scale-95"
            >
              取消封鎖
            </button>
          </div>
        )
      })
    )}
  </motion.div>
) : !languageOpen ? (
    <motion.div
      key="settings-main"
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -24, opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-[24px] overflow-hidden rounded-[22px] bg-[var(--app-card)] py-[20px]">
  <SettingsRow
    icon={<Radar size={21} strokeWidth={2.1} />}
    label={text.myRadar}
    onClick={() => {
  setMyRadarOpen(true)
  onMyRadarClick?.()
}}
  />
</div>
      <div className="rounded-[22px] bg-[var(--app-card)] px-4 py-4">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <span className="flex h-[22px] w-[22px] items-center justify-center text-[var(--app-text)]">
              <Moon size={19} strokeWidth={2.1} />
            </span>

            <span className="text-[16px] font-medium text-[var(--app-text)]">
              {text.darkMode}
            </span>
          </div>

          <button
  type="button"
  onClick={handleToggleDarkMode}
  className="flex items-center gap-[14px] active:scale-[0.97]"
>
  <span className="text-[15px] font-medium text-[var(--app-text)]">
    {darkMode ? text.darkOn : text.darkOff}
  </span>

  <div
  style={{
    position: 'relative',
    width: 76,
    minWidth: 76,
    height: 36,
    borderRadius: 999,
    border: '2px solid #8B1FA9',
    background: '#efc9f3',
    overflow: 'hidden',
    flexShrink: 0,
  }}
>
  <div
    style={{
      position: 'absolute',
      top: 3,
      left: darkMode ? 43 : 4,
      width: 26,
      height: 26,
      borderRadius: 999,
      background: '#ffffff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.22)',
      transition: 'left 0.3s ease',
    }}
  />
</div>
</button>
        </div>
      </div>

      <div className="mt-[30px] overflow-hidden rounded-[22px] bg-[var(--app-card)] py-[20px]">
        

        <SettingsRow
          icon={<Ban size={21} strokeWidth={2.1} />}
          label={text.blocked}
          onClick={() => {
  setBlockedOpen(true)
  loadBlockedUsers()
  onBlockedClick?.()
}}
        />
      </div>

      <div className="mt-[24px] overflow-hidden rounded-[22px] bg-[var(--app-card)] py-[20px]">
        <SettingsRow
          icon={<Globe size={21} strokeWidth={2.1} />}
          label={text.language}
          onClick={() => setLanguageOpen(true)}
        />
      </div>
    </motion.div>
  ) : (
    <motion.div
      key="language-page"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="mt-[4px] overflow-hidden rounded-[22px] bg-[var(--app-card)] py-[14px]"
    >
      <LanguageRow
        label="繁中"
        active={safeLocale === 'zh-TW'}
        onClick={() => onChangeLocale('zh-TW')}
      />

      <LanguageRow
        label="English"
        active={safeLocale === 'en'}
        onClick={() => onChangeLocale('en')}
      />
    </motion.div>
  )}
</AnimatePresence>

        </div>
            </div>

      <AnimatePresence>
        {confirmUnblockUser && (
          <motion.div
            className="fixed inset-0 z-[260] flex items-center justify-center bg-black/40 px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmUnblockUser(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[320px] overflow-hidden rounded-[24px] bg-[var(--app-card)] text-center shadow-xl"
              initial={{ opacity: 0, scale: 0.9, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 28,
              }}
            >
              <div className="px-6 pb-5 pt-6">
                <div className="text-[18px] font-semibold text-[var(--app-text)]">
                  取消封鎖？
                </div>

                <div className="mt-2 text-[14px] leading-relaxed text-[var(--app-muted)]">
                  取消後，對方可以再次與你互動。
                </div>
              </div>

              <button
                type="button"
                onClick={() => unblockUser(confirmUnblockUser)}
                className="h-[48px] w-full border-t border-[var(--app-card-border)] text-[16px] font-medium text-red-500"
              >
                確認取消封鎖
              </button>

              <button
                type="button"
                onClick={() => setConfirmUnblockUser(null)}
                className="h-[48px] w-full border-t border-[var(--app-card-border)] text-[16px] text-[var(--app-text)]"
              >
                取消
              </button>
            </motion.div>
          </motion.div>
        )}
            </AnimatePresence>

            <AnimatePresence>
  {myRadarOpen && (
    <MyAIRadarPage
  locale={safeLocale}
  onClose={() => setMyRadarOpen(false)}
/>
  )}
</AnimatePresence>

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
      <span className="flex h-[22px] w-[52px] items-center justify-center text-[var(--app-text)]">
        {icon}
      </span>

      <span className="text-left text-[16px] font-medium leading-none text-[var(--app-text)]">
        {label}
      </span>

      <span className="flex items-center justify-center">
        <ChevronRight
          size={18}
          strokeWidth={2.4}
          className="text-[var(--app-muted)]"
        />
      </span>
    </button>
  )
}

function LanguageRow({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
  type="button"
  onClick={onClick}
  className="flex h-[72px] w-full items-center text-[16px] font-medium text-[var(--app-text)] active:bg-[#cfcfcf]"
>
  <span className="ml-[34px]">{label}</span>

  <div className="ml-auto mr-[34px]">
    {active && (
      <Check
        size={21}
        strokeWidth={2.5}
        className="text-[#8B5CF6]"
      />
    )}
  </div>
</button>
  )
}

function Switch({ checked }: { checked: boolean }) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'flex',
        width: 76,
        height: 36,
        borderRadius: 999,
        border: '2px solid #8B1FA9',
        background: '#efc9f3',
        boxShadow: '0 2px 8px rgba(139,31,169,0.16)',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 43 : 4,
          width: 26,
          height: 26,
          borderRadius: 999,
          background: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.22)',
          transition: 'left 0.3s ease',
        }}
      />
    </span>
  )
}

function Divider() {
  return <div className="mx-4 my-[25px] h-px bg-[var(--app-muted)]" />
}