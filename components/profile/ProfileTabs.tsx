'use client'

import { Bookmark, Grid2x2, PlaySquare } from 'lucide-react'

type Props = {
  activeTab: number
  onChangeTab: (index: number) => void
}

const activeColor = '#d89ad0'
const inactiveColor = '#222'

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
            className="transition-colors duration-200"
            color={activeTab === 0 ? activeColor : inactiveColor}
          />
        </button>

        <button
          type="button"
          onClick={() => onChangeTab(1)}
          className="flex h-[34px] items-center justify-center"
        >
          <PlaySquare
            size={20}
            className="transition-colors duration-200"
            color={activeTab === 1 ? activeColor : inactiveColor}
          />
        </button>

        <button
          type="button"
          onClick={() => onChangeTab(2)}
          className="flex h-[34px] items-center justify-center"
        >
          <Bookmark
            size={20}
            className="transition-colors duration-200"
            color={activeTab === 2 ? activeColor : inactiveColor}
          />
        </button>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 h-[4px] px-2 transition-all duration-300 ease-out"
        style={{
          left: `${activeTab * 33.3333}%`,
          width: '33.3333%',
        }}
      >
        <div className="h-[4px] w-full rounded-full bg-[#d89ad0]" />
      </div>
    </div>
  )
}