'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { uiText } from '@/lib/uiText'

type Props = {
  isAuthModalOpen: boolean
  handleGoogleLogin: () => void
}

export default function HomeAuthModal({
  isAuthModalOpen,
  handleGoogleLogin,
}: Props) {
  const text = {
    title: uiText('登入 Vibelink', 'Log in to Vibelink'),
    subtitle: uiText('登入後即可發文與使用完整功能', 'Log in to post and use all features'),
    googleLogin: uiText('GOOGLE 登入', 'Continue with Google'),
  }

  return (
<AnimatePresence>
  {isAuthModalOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex touch-none items-center justify-center bg-black/40 px-6 backdrop-blur-sm"
onTouchStart={(e) => e.stopPropagation()}
onTouchMove={(e) => e.stopPropagation()}
onTouchEnd={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="w-full max-w-[340px] rounded-[28px] bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 text-center">
          <img
            src="/vibelink-logo.png"
            alt="Vibelink"
            className="mx-auto mb-3 h-[48px]"
          />
          <h2 className="text-[22px] font-semibold text-[var(--app-text)]">
            {text.title}
          </h2>
          <p className="mt-2 text-[14px] text-[#777]">
            {text.subtitle}
          </p>
        </div>

        <button
  type="button"
  onClick={handleGoogleLogin}
  className="mt-5 mb-5 flex h-[48px] w-full items-center justify-center gap-3 rounded-full border border-[var(--app-card-border)] bg-[var(--app-surface)] text-[15px] font-medium text-[var(--app-text)] shadow-sm active:scale-[0.97]"
>
  {text.googleLogin}
</button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  )
}
