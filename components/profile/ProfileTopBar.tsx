'use client'

import { motion } from 'framer-motion'
import { Menu, PlusSquare } from 'lucide-react'
import { uiText } from '@/lib/uiText'

type Props = {
  isMenuOpen: boolean
  uploadLabel: string
  onMenuClick: () => void
  onUploadClick: () => void
}

export default function ProfileTopBar({
  isMenuOpen,
  uploadLabel,
  onMenuClick,
  onUploadClick,
}: Props) {
  const text = {
  close: uiText('關閉', 'CLOSE'),
}

  return (
    <div
      className="
        fixed left-1/2 top-0 z-[100]
        w-full max-w-[430px]
        -translate-x-1/2
        bg-[var(--app-bg)]
        px-4 pb-3 pt-4
        text-[var(--app-text)]
        backdrop-blur-md
      "
    >
      <div className="flex items-center justify-between">
        <motion.button
          type="button"
          onClick={onMenuClick}
          whileTap={{ scale: 0.9 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 20,
          }}
          className="
            relative z-[30]
            flex h-[38px] items-center gap-2
            rounded-[14px]
            bg-[var(--app-surface)]
            px-3
            text-[13px]
            text-[var(--app-text)]
          "
        >
          <Menu size={18} />
          <span>{isMenuOpen ? text.close : 'MENU'}</span>
        </motion.button>

        <button
          type="button"
          onClick={onUploadClick}
          className="
            relative z-[30]
            flex h-[38px] items-center gap-2
            rounded-[14px]
            bg-[var(--app-surface)]
            px-3
            text-[13px]
            text-[var(--app-text)]
            active:scale-95
          "
        >
          <PlusSquare size={15} />
          <span>{uploadLabel}</span>
        </button>
      </div>
    </div>
  )
}
