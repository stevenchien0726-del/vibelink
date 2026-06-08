'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Plus,
  LogOut,
  Lock,
  TriangleAlert,
  Check,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { signOutCurrentUser } from '@/lib/authSessionCache'

type AccountManagePageProps = {
  onClose: () => void
}

type VibelinkProfile = {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  is_active: boolean | null
  created_at: string | null
}

const LOAD_PROFILES_TIMEOUT_MS = 4500
const CREATE_PROFILE_TIMEOUT_MS = 6000

export default function AccountManagePage({
  onClose,
}: AccountManagePageProps) {
  const [dragX, setDragX] = useState(0)
  const [isDraggingBack, setIsDraggingBack] = useState(false)
  const [profiles, setProfiles] = useState<VibelinkProfile[]>([])
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [switchingProfileId, setSwitchingProfileId] = useState<string | null>(null)

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const draggingEnabled = useRef(false)
  const mountedRef = useRef(true)
  const loadProfilesRequestIdRef = useRef(0)
  const createProfileRequestIdRef = useRef(0)
  const switchingProfileIdRef = useRef<string | null>(null)

  const canAddAccount = profiles.length < 2

  const [creatingAccount, setCreatingAccount] = useState(false)

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  useEffect(() => {
    let cancelled = false
    mountedRef.current = true

    loadProfiles(() => cancelled)

    return () => {
      cancelled = true
      mountedRef.current = false
      loadProfilesRequestIdRef.current += 1
      createProfileRequestIdRef.current += 1
    }
  }, [])

  async function loadProfiles(isCancelled = () => !mountedRef.current) {
    const requestId = loadProfilesRequestIdRef.current + 1
    loadProfilesRequestIdRef.current = requestId
    const isStale = () =>
      isCancelled() || requestId !== loadProfilesRequestIdRef.current

    const timeoutId = window.setTimeout(() => {
      if (isStale()) return

      setLoadError(true)
      setLoadingProfiles(false)
      loadProfilesRequestIdRef.current += 1
    }, LOAD_PROFILES_TIMEOUT_MS)

    try {
      if (isStale()) return
      setLoadError(false)
      setLoadingProfiles(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (isStale()) return

    if (!user) {
      setProfiles([])
      setActiveProfileId(null)
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, is_active, created_at')
      .eq('auth_user_id', user.id)
      .order('created_at', { ascending: true })

    if (isStale()) return

    if (error) {
      throw error
    }

    const safeProfiles = data ?? []
    setProfiles(safeProfiles)

    const active = safeProfiles.find((item) => item.is_active) ?? safeProfiles[0]
    setActiveProfileId(active?.id ?? null)

    if (active?.id) {
      localStorage.setItem('vibelink-active-profile-id', active.id)
    }
    } catch (error) {
      if (!isStale()) {
        console.warn('load profiles failed:', error)
        setLoadError(true)
      }
    } finally {
      window.clearTimeout(timeoutId)

      if (!isStale()) {
        setLoadingProfiles(false)
      }
    }
  }

  async function switchProfile(profileId: string) {
    if (switchingProfileIdRef.current) return

    switchingProfileIdRef.current = profileId
    setSwitchingProfileId(profileId)

    try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!mountedRef.current) return

    if (!user) return

    const { error: resetError } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('auth_user_id', user.id)

    if (resetError) {
      throw resetError
    }

    if (!mountedRef.current) return

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: true })
      .eq('id', profileId)
      .eq('auth_user_id', user.id)

    if (error) {
      throw error
    }

    if (!mountedRef.current) return

    setActiveProfileId(profileId)
    localStorage.setItem('vibelink-active-profile-id', profileId)

    setProfiles((prev) =>
      prev.map((profile) => ({
        ...profile,
        is_active: profile.id === profileId,
      }))
    )
    } catch (error) {
      console.warn('switch profile failed:', error)
    } finally {
      switchingProfileIdRef.current = null
      if (mountedRef.current) {
        setSwitchingProfileId(null)
      }
    }
  }

  async function createNewProfile() {
  if (!canAddAccount || creatingAccount) return

  const requestId = createProfileRequestIdRef.current + 1
  createProfileRequestIdRef.current = requestId
  const isStale = () =>
    !mountedRef.current || requestId !== createProfileRequestIdRef.current

  const timeoutId = window.setTimeout(() => {
    if (isStale()) return

    setCreatingAccount(false)
    createProfileRequestIdRef.current += 1
    alert('建立帳號逾時，請稍後再試。')
  }, CREATE_PROFILE_TIMEOUT_MS)

  try {
    setCreatingAccount(true)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isStale()) return

  if (!user) {
    return
  }

  const nextNumber = profiles.length + 1

  const username = `user_${user.id.slice(0, 4)}_${nextNumber}`

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      auth_user_id: user.id,
      username,
      display_name: `Vibelink ${nextNumber}`,
      is_active: false,
    })
    .select('id, username, display_name, avatar_url, is_active, created_at')
    .single()

  if (isStale()) return

  if (error) {
    throw error
  }

  setCreatingAccount(false)

await supabase
  .from('profiles')
  .update({
    is_active: false,
  })
  .eq('auth_user_id', user.id)

if (isStale()) return

await supabase
  .from('profiles')
  .update({
    is_active: true,
  })
  .eq('id', data.id)

if (isStale()) return

  setProfiles((prev) => [
  ...prev.map((profile) => ({
    ...profile,
    is_active: false,
  })),
  {
    ...data,
    is_active: true,
  },
])

setActiveProfileId(data.id)

localStorage.setItem(
  'vibelink-active-profile-id',
  data.id
)
  } catch (error) {
    if (!isStale()) {
      console.warn('create profile failed:', error)
      alert('建立帳號失敗，請稍後再試。')
    }
  } finally {
    window.clearTimeout(timeoutId)

    if (!isStale()) {
      setCreatingAccount(false)
    }
  }
}

  async function handleLogout() {
    if (signingOut) return

    try {
      setSigningOut(true)
      setLogoutError('')
      await signOutCurrentUser()
      localStorage.removeItem('vibelink-active-profile-id')
      setShowLogoutConfirm(false)
      onClose()
    } catch (error) {
      console.warn('logout failed:', error)
      setLogoutError('登出失敗，請檢查網路後再試一次')
    } finally {
      if (mountedRef.current) {
        setSigningOut(false)
      }
    }
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
      className="fixed inset-0 z-[230] flex justify-center bg-[var(--app-bg)] touch-pan-y"
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
        <div className="fixed top-0 left-1/2 z-[30] w-full max-w-[430px] -translate-x-1/2 border-b border-[var(--app-card-border)] bg-[var(--app-bg)]/95 px-4 pt-3 pb-3 backdrop-blur-md">
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              aria-label="返回"
              onClick={onClose}
              className="absolute left-0 flex h-[40px] w-[40px] items-center justify-center rounded-full text-[var(--app-text)] active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="text-[20px] font-medium tracking-[0.01em] text-[var(--app-text)]">
              帳號管理
            </div>
          </div>
        </div>

        <div className="px-4 pt-[78px] pb-10">
          <div className="overflow-hidden rounded-[24px] border border-[var(--app-card-border)] bg-[var(--app-card)] py-[12px]">
            {loadingProfiles ? (
              <div className="py-8 text-center text-[14px] text-[var(--app-muted)]">
                帳號讀取中...
              </div>
            ) : loadError ? (
              <div className="flex flex-col items-center py-8 text-center text-[14px] text-[var(--app-muted)]">
                <div>帳號讀取失敗，請重新載入</div>
                <button
                  type="button"
                  onClick={() => loadProfiles()}
                  className="mt-4 rounded-full bg-[var(--app-surface)] px-5 py-2 text-[14px] font-medium text-[var(--app-text)] active:scale-95"
                >
                  重新載入
                </button>
              </div>
            ) : (
              <>
                {profiles.map((profile, index) => (
                  <div key={profile.id}>
                    {index > 0 && <GroupDivider />}

                    <AccountMainRow
                      onClick={() => {
                        if (switchingProfileId) return
                        switchProfile(profile.id)
                      }}
                      icon={
                        <div className="flex h-[40px] w-[40px] items-center justify-center overflow-hidden rounded-full bg-[var(--app-surface)] text-[var(--app-text)]">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <CircleUserRound size={25} style={{ strokeWidth: 1.9 }} />
                          )}
                        </div>
                      }
                      title={
                        profile.display_name ||
                        profile.username ||
                        'Vibelink User'
                      }
                      subtitle={
                        activeProfileId === profile.id
                          ? '目前使用中'
                          : 'Vibelink帳號'
                      }
                      trailing={
                        activeProfileId === profile.id ? (
                          <Check
                            size={19}
                            style={{ strokeWidth: 2.7 }}
                            className="text-[#c86cff]"
                          />
                        ) : (
                          <ChevronRight
                            size={18}
                            style={{ strokeWidth: 2.4 }}
                            className="text-[var(--app-muted)]"
                          />
                        )
                      }
                    />
                  </div>
                ))}

                {canAddAccount && (
                  <>
                    {profiles.length > 0 && <GroupDivider />}

                    <AccountMainRow
  onClick={createNewProfile}
  icon={
    <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[var(--app-surface)] text-[var(--app-text)]">
      <Plus size={25} style={{ strokeWidth: 2.1 }} />
    </div>
  }
  title={creatingAccount ? '建立中...' : '新增Vibelink帳號'}
  subtitle="建立和切換身分"
  trailing={
    <ChevronRight
      size={18}
      style={{ strokeWidth: 2.4 }}
      className="text-[var(--app-muted)]"
    />
  }
/>
                  </>
                )}
              </>
            )}
          </div>

          <div className="mt-[22px] overflow-hidden rounded-[24px] border border-[var(--app-card-border)] bg-[var(--app-card)] py-[20px]">
            <AccountActionRow
  onClick={() => {
    setLogoutError('')
    setShowLogoutConfirm(true)
  }}
  icon={<LogOut size={21} style={{ strokeWidth: 2.1 }} />}
  label="登出"
/>

            <GroupDivider />

            <AccountActionRow
              icon={<TriangleAlert size={21} style={{ strokeWidth: 2.1 }} />}
              label="停用或刪除(危險區)"
              trailing={
                <Lock
                  size={18}
                  style={{ strokeWidth: 2.1 }}
                  className="text-[var(--app-muted)]"
                />
              }
            />
          </div>
        </div>
      </div>
      <AnimatePresence>
  {showLogoutConfirm && (
    <>
      <motion.div
        className="fixed inset-0 z-[500] bg-black/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          if (!signingOut) {
            setShowLogoutConfirm(false)
          }
        }}
      />

      <motion.div
        className="fixed left-1/2 top-1/2 z-[510] w-[82%] max-w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-[var(--app-card-border)] bg-[var(--app-card)] p-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        transition={{ duration: 0.18 }}
      >
        <div className="text-[18px] font-semibold text-[var(--app-text)]">
          確定要登出嗎？
        </div>

        <div className="mt-2 text-[14px] leading-relaxed text-[var(--app-muted)]">
          登出後你可以再次使用 Email OTP 登入。
        </div>

        {logoutError && (
          <div className="mt-3 text-[13px] leading-relaxed text-red-400">
            {logoutError}
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => {
              if (!signingOut) {
                setShowLogoutConfirm(false)
              }
            }}
            disabled={signingOut}
            className="h-[46px] flex-1 rounded-full bg-[var(--app-surface)] text-[15px] font-medium text-[var(--app-text)] active:scale-[0.98] disabled:opacity-60"
          >
            取消
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="h-[46px] flex-1 rounded-full bg-[#c86cff] text-[15px] font-semibold text-white active:scale-[0.98] disabled:opacity-60"
          >
            {signingOut ? '正在登出...' : '確認登出'}
          </button>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
    </motion.div>
  )
}

function AccountMainRow({
  icon,
  title,
  subtitle,
  trailing,
  onClick,
}: {
  icon: ReactNode
  title: string
  subtitle: string
  trailing: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full grid-cols-[56px_minmax(0,1fr)_28px] items-center gap-x-4 py-[18px] pl-[50px] pr-[18px] text-left active:bg-white/10"
    >
      <div className="flex items-center justify-center">{icon}</div>

      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[16px] font-medium text-[var(--app-text)]">
          {title}
        </span>
        <span className="mt-1 truncate text-[13px] text-[var(--app-muted)]">
          {subtitle}
        </span>
      </div>

      <div className="flex items-center justify-center">{trailing}</div>
    </button>
  )
}

function AccountActionRow({
  icon,
  label,
  trailing,
  onClick,
}: {
  icon: ReactNode
  label: string
  trailing?: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full grid-cols-[54px_minmax(0,1fr)_28px] items-center gap-x-4 py-[26px] pl-[22px] pr-[18px] text-left active:bg-white/10"
    >
      <div className="flex items-center justify-center text-[var(--app-text)]">
        {icon}
      </div>

      <span className="text-[16px] font-medium text-[var(--app-text)]">
        {label}
      </span>

      <div className="flex items-center justify-center text-[var(--app-muted)]">
        {trailing ?? <span />}
      </div>
    </button>
  )
}

function GroupDivider() {
  return <div className="mx-[30px] my-[15px] h-px bg-[var(--app-card-border)]" />
}
