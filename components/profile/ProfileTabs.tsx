'use client'

import { Bookmark, Grid2x2, PlaySquare } from 'lucide-react'

import { motion } from 'framer-motion'

type Props = {
  activeTab: number
  onChangeTab: (index: number) => void
}

const activeColor = '#d89ad0'

export default function ProfileTabs({
  activeTab,
  onChangeTab,
}: Props) {
  return (
    <div className="relative mb-2 border-b border-[#d9d9d9] pb-2">
      <div className="grid grid-cols-3">
        <button
          type="button"
          onClick={() => onChangeTab(0)}
          className="flex h-[34px] items-center justify-center"
        >
          <Grid2x2
            size={20}
            className={`transition-colors duration-200 ${
              activeTab === 0
                ? 'text-[#d89ad0]'
                : 'text-[#222] [html.dark_&]:text-[#6f6f78]'
            }`}
            color={activeTab === 0 ? activeColor : 'currentColor'}
          />
        </button>

        <button
          type="button"
          onClick={() => onChangeTab(1)}
          className="flex h-[34px] items-center justify-center"
        >
          <PlaySquare
            size={20}
            className={`transition-colors duration-200 ${
              activeTab === 1
                ? 'text-[#d89ad0]'
                : 'text-[#222] [html.dark_&]:text-[#6f6f78]'
            }`}
            color={activeTab === 1 ? activeColor : 'currentColor'}
          />
        </button>

        <button
          type="button"
          onClick={() => onChangeTab(2)}
          className="flex h-[34px] items-center justify-center"
        >
          <Bookmark
            size={20}
            className={`transition-colors duration-200 ${
              activeTab === 2
                ? 'text-[#d89ad0]'
                : 'text-[#222] [html.dark_&]:text-[#6f6f78]'
            }`}
            color={activeTab === 2 ? activeColor : 'currentColor'}
          />
        </button>
      </div>

            <motion.div
        className="absolute bottom-0 w-[33.3333%] px-2"
        animate={{
          x: `${activeTab * 100}%`,
        }}
        transition={{
          type: 'spring',
          stiffness: 380,
          damping: 32,
        }}
      >
        <div className="h-[4px] w-full rounded-full bg-[#d89ad0]" />
      </motion.div>
    </div>
  )
}
