'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Copy, Instagram, Share2 } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

type Props = {
  open: boolean
  onClose: () => void
  profile?: {
    display_name?: string
    username?: string
    avatar_url?: string
    bio?: string
  }
}

export default function ShareProfilePage({
  open,
  onClose,
  profile,
}: Props) {
  const profileUrl = `https://vibelink.app/${profile?.username || 'user'}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(profileUrl)
      alert('已複製個人檔案連結')
    } catch {
      alert('複製失敗')
    }
  }

  async function handleNativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Vibelink Profile',
          text: `${profile?.display_name || profile?.username || 'Vibelink User'}`,
          url: profileUrl,
        })
        return
      }

      handleCopy()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-block-page-swipe="true"
          className="fixed inset-0 z-[1600] bg-[#f3f3f3]"
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
          <div className="fixed left-1/2 top-0 z-[1610] flex h-[64px] w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[#f3f3f3]/95 px-4 backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
              className="flex h-[40px] w-[40px] items-center justify-center rounded-full active:scale-90"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="text-[18px] font-medium text-[#111]">
              分享檔案
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
              className="w-full overflow-hidden rounded-[34px] bg-gradient-to-b from-[#f6ebff] to-[#ffffff] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
            >
              <div className="flex flex-col items-center">
                <div className="h-[88px] w-[88px] overflow-hidden rounded-full bg-[#d9d9d9]">
                  {profile?.avatar_url && (
                    <img
                      src={profile.avatar_url}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="mt-4 text-[22px] font-semibold text-[#111]">
                  {profile?.display_name || 'Vibelink User'}
                </div>

                <div className="mt-1 text-[16px] text-[#666]">
                  @{profile?.username || 'username'}
                </div>

                {profile?.bio && (
                  <div className="mt-4 text-center text-[14px] leading-[1.5] text-[#555]">
                    {profile.bio}
                  </div>
                )}
              </div>

              <div className="mt-7 flex justify-center">
                <div className="flex h-[170px] w-[170px] items-center justify-center rounded-[28px] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
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

              <div className="mt-6 rounded-[20px] bg-white/80 px-4 py-4 text-center shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                <div className="truncate text-[14px] text-[#666]">
                  {profileUrl}
                </div>
              </div>
            </motion.div>

            <div className="mt-7 grid w-full grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="flex h-[92px] flex-col items-center justify-center rounded-[26px] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.06)] active:scale-[0.97]"
              >
                <Copy size={24} strokeWidth={2.2} />
                <span className="mt-2 text-[14px] text-[#222]">
                  複製連結
                </span>
              </button>

              <button
                type="button"
                onClick={handleNativeShare}
                className="flex h-[92px] flex-col items-center justify-center rounded-[26px] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.06)] active:scale-[0.97]"
              >
                <Share2 size={24} strokeWidth={2.2} />
                <span className="mt-2 text-[14px] text-[#222]">
                  分享
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.open(
                    'https://instagram.com',
                    '_blank',
                    'noopener,noreferrer'
                  )
                }}
                className="flex h-[92px] flex-col items-center justify-center rounded-[26px] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.06)] active:scale-[0.97]"
              >
                <Instagram size={24} strokeWidth={2.2} />
                <span className="mt-2 text-[14px] text-[#222]">
                  IG Story
                </span>
              </button>
            </div>

            <div className="mt-8 text-center text-[13px] leading-[1.5] text-[#888]">
              分享你的 Vibelink 個人檔案，
              <br />
              讓更多人認識你的 Vibe。
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}