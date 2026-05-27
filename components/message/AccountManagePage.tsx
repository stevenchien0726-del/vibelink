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

export default function AccountManagePage({
  onClose,
}: AccountManagePageProps) {
  const [dragX, setDragX] = useState(0)
  const [isDraggingBack, setIsDraggingBack] = useState(false)
  const [profiles, setProfiles] = useState<VibelinkProfile[]>([])
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)
  const [loadingProfiles, setLoadingProfiles] = useState(true)

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const draggingEnabled = useRef(false)

  const canAddAccount = profiles.length < 2

  const [creatingAccount, setCreatingAccount] = useState(false)

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    setLoadingProfiles(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoadingProfiles(false)
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, is_active, created_at')
      .eq('auth_user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('讀取 Vibelink 帳號失敗:', error)
      setLoadingProfiles(false)
      return
    }

    const safeProfiles = data ?? []
    setProfiles(safeProfiles)

    const active = safeProfiles.find((item) => item.is_active) ?? safeProfiles[0]
    setActiveProfileId(active?.id ?? null)

    if (active?.id) {
      localStorage.setItem('vibelink-active-profile-id', active.id)
    }

    setLoadingProfiles(false)
  }

  async function switchProfile(profileId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error: resetError } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('auth_user_id', user.id)

    if (resetError) {
      console.error('重設帳號狀態失敗:', resetError)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: true })
      .eq('id', profileId)
      .eq('auth_user_id', user.id)

    if (error) {
      console.error('切換帳號失敗:', error)
      return
    }

    setActiveProfileId(profileId)
    localStorage.setItem('vibelink-active-profile-id', profileId)

    setProfiles((prev) =>
      prev.map((profile) => ({
        ...profile,
        is_active: profile.id === profileId,
      }))
    )
  }

  async function createNewProfile() {
  if (!canAddAccount || creatingAccount) return

  setCreatingAccount(true)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    setCreatingAccount(false)
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

  setCreatingAccount(false)

  if (error) {
    console.error('新增 Vibelink 帳號失敗:', error)
    alert('新增帳號失敗')
    return
  }

await supabase
  .from('profiles')
  .update({
    is_active: false,
  })
  .eq('auth_user_id', user.id)

await supabase
  .from('profiles')
  .update({
    is_active: true,
  })
  .eq('id', data.id)

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
}

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.removeItem('vibelink-active-profile-id')
    window.location.reload()
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
            ) : (
              <>
                {profiles.map((profile, index) => (
                  <div key={profile.id}>
                    {index > 0 && <GroupDivider />}

                    <AccountMainRow
                      onClick={() => switchProfile(profile.id)}
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
  onClick={() => setShowLogoutConfirm(true)}
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
        onClick={() => setShowLogoutConfirm(false)}
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
          登出後需要重新登入才能使用 Vibelink。
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(false)}
            className="h-[46px] flex-1 rounded-full bg-[var(--app-surface)] text-[15px] font-medium text-[var(--app-text)] active:scale-[0.98]"
          >
            取消
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="h-[46px] flex-1 rounded-full bg-[#c86cff] text-[15px] font-semibold text-white active:scale-[0.98]"
          >
            登出
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
