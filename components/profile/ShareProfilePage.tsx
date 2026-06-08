'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Camera, ChevronLeft, Copy, Share2 } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

type Props = {
  open: boolean
  onClose: () => void
  profile?: {
    id?: string
    display_name?: string
    username?: string
    avatar_url?: string
    bio?: string
  }
}

function getProfileShareBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (envUrl) {
    return envUrl.replace(/\/+$/, '')
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/+$/, '')
  }

  return 'https://vibelink.app'
}

function getProfileShareUrl(profile?: Props['profile']): string {
  const baseUrl = getProfileShareBaseUrl()
  const username = profile?.username?.trim().replace(/^@/, '')
  const userId = profile?.id?.trim()

  if (username) {
    return `${baseUrl}/u/${encodeURIComponent(username)}`
  }

  if (userId) {
    return `${baseUrl}/profile/${encodeURIComponent(userId)}`
  }

  return `${baseUrl}/profile/user`
}

export default function ShareProfilePage({
  open,
  onClose,
  profile,
}: Props) {
  const profileUrl = getProfileShareUrl(profile)
  const text = {
    copied: '已複製個人檔案連結',
    copyFailed: '複製連結失敗',
    shareFallback: '無法分享，已改為複製連結',
    title: '分享個人檔案',
    copyLink: '複製連結',
    share: '分享',
    igStory: '分享到 IG Story',
    description: '讓朋友掃描 QR Code，快速找到你的 Vibelink。',
  }

  function fallbackCopy(textToCopy: string): boolean {
    if (typeof document === 'undefined') return false

    try {
      const textarea = document.createElement('textarea')
      textarea.value = textToCopy
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      textarea.style.top = '0'

      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()

      const copied = document.execCommand('copy')
      document.body.removeChild(textarea)

      return copied
    } catch {
      return false
    }
  }

  async function copyProfileUrl(showSuccess = true): Promise<boolean> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profileUrl)

        if (showSuccess) {
          alert(text.copied)
        }

        return true
      }
    } catch {
      // Fall through to the textarea copy fallback.
    }

    const copied = fallbackCopy(profileUrl)

    if (showSuccess) {
      alert(copied ? text.copied : text.copyFailed)
    }

    return copied
  }

  async function handleCopy() {
    await copyProfileUrl()
  }

  async function handleNativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Vibelink Profile',
          text: `${
            profile?.display_name || profile?.username || 'Vibelink User'
          }`,
          url: profileUrl,
        })
        return
      }
    } catch (error) {
      console.error(error)
    }

    await copyProfileUrl(false)
    alert(text.shareFallback)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-block-page-swipe="true"
          className="fixed inset-0 z-[1600] bg-[var(--app-bg)] text-[var(--app-text)]"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{
            type: 'spring',
            stiffness: 360,
            damping: 34,
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="fixed left-1/2 top-0 z-[1610] flex h-[64px] w-full max-w-[430px] -translate-x-1/2 items-center justify-between border-b border-[var(--app-card-border)] bg-[var(--app-bg)]/95 px-4 backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
              className="flex h-[40px] w-[40px] items-center justify-center rounded-full text-[var(--app-text)] active:scale-90"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="text-[18px] font-medium text-[var(--app-text)]">
              {text.title}
            </div>

            <div className="w-[40px]" />
          </div>

          <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center px-6 pt-[92px] pb-[120px]">
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={{
                duration: 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full overflow-hidden rounded-[34px] border border-[var(--app-card-border)] bg-[var(--app-card)] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
            >
              <div className="flex flex-col items-center">
                <div className="h-[88px] w-[88px] overflow-hidden rounded-full bg-[var(--app-surface)]">
                  {profile?.avatar_url && (
                    <img
                      src={profile.avatar_url}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="mt-4 text-[22px] font-semibold text-[var(--app-text)]">
                  {profile?.display_name || 'Vibelink User'}
                </div>
              </div>

              <div className="mt-7 flex justify-center">
                <div className="flex h-[170px] w-[170px] items-center justify-center rounded-[28px] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                  <QRCodeCanvas
                    value={profileUrl}
                    size={132}
                    bgColor="#ffffff"
                    fgColor="#111111"
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>
            </motion.div>

            <div className="mt-7 grid w-full grid-cols-3 gap-3">
              <ShareActionButton
                icon={<Copy size={24} strokeWidth={2.2} />}
                label={text.copyLink}
                onClick={handleCopy}
              />
              <ShareActionButton
                icon={<Share2 size={24} strokeWidth={2.2} />}
                label={text.share}
                onClick={handleNativeShare}
              />
              <ShareActionButton
                icon={<Camera size={24} strokeWidth={2.2} />}
                label={text.igStory}
                onClick={() => {
                  window.open(
                    'https://instagram.com',
                    '_blank',
                    'noopener,noreferrer'
                  )
                }}
              />
            </div>

            <div className="mt-8 text-center text-[13px] leading-[1.5] text-[var(--app-muted)]">
              {text.description}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ShareActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[92px] flex-col items-center justify-center rounded-[26px] border border-[var(--app-card-border)] bg-[var(--app-card)] text-[var(--app-text)] shadow-[0_10px_24px_rgba(0,0,0,0.10)] active:scale-[0.97]"
    >
      {icon}
      <span className="mt-2 text-[14px] text-[var(--app-text)]">
        {label}
      </span>
    </button>
  )
}
