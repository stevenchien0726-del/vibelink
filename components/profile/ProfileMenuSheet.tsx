'use client'

import { motion } from 'framer-motion'
import {
  BarChart3,
  Bell,
  Clock3,
  Grid3x3,
  Megaphone,
  Settings,
  Ticket,
  UserCircle2,
} from 'lucide-react'

type Props = {
  open: boolean
  text: any
  onClose: () => void
  onNotifications: () => void
  onAnalytics: () => void
  onArchive: () => void
  onSettings: () => void
  onAccount: () => void
  onMembership: () => void
  onVibeCity: () => void
}

function MenuItem({
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
      className="
        flex min-h-[52px] w-full justify-center rounded-[14px]
        bg-transparent px-2 py-[12px]
        text-[17px] text-[var(--app-text)]
        transition
        active:scale-[0.98]
        active:bg-white/10
        hover:bg-white/10
      "
    >
      <div className="flex min-w-[170px] items-center justify-center gap-4">
        <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center text-[var(--app-text)]">
          {icon}
        </span>

        <span className="w-[96px] text-left leading-none">
          {label}
        </span>
      </div>
    </button>
  )
}

export default function ProfileMenuSheet({
  open,
  text,
  onClose,
  onNotifications,
  onAnalytics,
  onArchive,
  onSettings,
  onAccount,
  onMembership,
  onVibeCity,
}: Props) {
  if (!open) return null

  return (
    <>
      <motion.button
        type="button"
        aria-label="Close profile menu overlay"
        onClick={onClose}
        className="fixed inset-0 z-[20] bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      />

      <motion.div
        className="
          fixed left-1/2 top-[96px] z-[25]
          w-[300px] -translate-x-1/2
          rounded-[26px]
          border border-[var(--app-card-border)]
          bg-[var(--app-card)]
          px-6 py-6
          text-[var(--app-text)]
          shadow-[0_16px_40px_rgba(0,0,0,0.18)]
        "
        initial={{ opacity: 0, scale: 0.82, y: -18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.86, y: -10 }}
        transition={{
          type: 'spring',
          stiffness: 360,
          damping: 28,
          mass: 0.9,
        }}
        style={{ originX: 0.88, originY: 0 }}
      >
        <div className="flex flex-col gap-3">
          <MenuItem icon={<Bell size={22} />} label={text.notifications} onClick={onNotifications} />
          <MenuItem icon={<BarChart3 size={22} strokeWidth={2.4} />} label={text.analytics} onClick={onAnalytics} />
          <MenuItem icon={<Clock3 size={22} />} label={text.archive} onClick={onArchive} />
          <MenuItem icon={<Settings size={22} />} label={text.settings} onClick={onSettings} />
          <MenuItem icon={<UserCircle2 size={22} />} label={text.account} onClick={onAccount} />
          <MenuItem icon={<Ticket size={22} />} label={text.membership} onClick={onMembership} />
          <MenuItem
  icon={<Grid3x3 size={22} />}
  label="Vibe City"
  onClick={onVibeCity}
/>
          
        </div>
      </motion.div>
    </>
  )
}