'use client'

import { MapPin } from 'lucide-react'
import UploadFullPage from '@/components/home/sections/upload/UploadFullPage'
import { Camera, Smile, Tag } from 'lucide-react'
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Grid2x2,
  Clapperboard,
  Bookmark,
  Image as ImageIcon,
  Menu,
  PlusSquare,
  UserCircle2,
  Activity,
  Bell,
  Star,
  Ban,
  Clock3,
  Ticket,
  Grid3x3,
  Settings,
  Megaphone,
} from 'lucide-react'

type ProfilePageProps = {
  onCloseMenu?: () => void
}

type MenuItemProps = {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

const activeColor = '#d89ad0'
const inactiveColor = '#222'
const MEMBERSHIP_URL = 'https://vibelink-j9m5.vercel.app/'

function openMembershipSite() {
  window.open(MEMBERSHIP_URL, '_blank')
}


function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <button
  type="button"
  onClick={onClick}
  className="flex min-h-[52px] w-full justify-center rounded-[14px] bg-transparent px-2 py-[12px] text-[17px] text-[#222] transition hover:bg-[#ececec]"
>
      <div className="flex min-w-[170px] items-center justify-center gap-4">
        <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center text-[#111]">
          {icon}
        </span>
        <span className="w-[96px] text-left leading-none">{label}</span>
      </div>
    </button>
  )
}

export default function ProfilePage({ onCloseMenu }: ProfilePageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  const gridItems = Array.from({ length: 9 })
  const albumItems = Array.from({ length: 5 })

  const tabTouchStartX = useRef<number | null>(null)
  const tabTouchDeltaX = useRef(0)
  const albumScrollRef = useRef<HTMLDivElement | null>(null)

  function goToTab(index: number) {
    if (index < 0 || index > 3) return
    setActiveTab(index)
  }

  function canSwipeFromAlbum(deltaX: number) {
    const el = albumScrollRef.current
    if (!el) return true

    const atFirst = el.scrollLeft <= 4
    const atLast = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4

    if (deltaX > 0) return atFirst
    if (deltaX < 0) return atLast

    return true
  }

  function handleTabTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0]
    tabTouchStartX.current = touch.clientX
    tabTouchDeltaX.current = 0
  }

  function handleTabTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (tabTouchStartX.current == null) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - tabTouchStartX.current
    tabTouchDeltaX.current = deltaX

    if (activeTab === 3) {
      if (!canSwipeFromAlbum(deltaX)) {
        return
      }
    }

    if (Math.abs(deltaX) > 8) {
      e.stopPropagation()
    }
  }

  function handleTabTouchEnd() {
    const deltaX = tabTouchDeltaX.current

    if (Math.abs(deltaX) > 50) {
      if (activeTab === 3 && !canSwipeFromAlbum(deltaX)) {
        tabTouchStartX.current = null
        tabTouchDeltaX.current = 0
        return
      }

      if (deltaX < 0) {
        goToTab(activeTab + 1)
      } else {
        goToTab(activeTab - 1)
      }
    }

    tabTouchStartX.current = null
    tabTouchDeltaX.current = 0
  }

  return (
    <div className="relative min-h-screen bg-[#f3f3f3] pb-[110px]">
      <div className="mx-auto w-full max-w-[430px] px-4 pt-[90px]">
        {/* Top Bar */}
        {/* Top Bar */}
<div className="fixed top-0 left-1/2 z-[100] w-full max-w-[430px] -translate-x-1/2 bg-[#f3f3f3]/95 px-4 pt-4 pb-3 backdrop-blur-md">
  <div className="flex items-center justify-between">
    <button
      type="button"
      onClick={() => {
        setIsMenuOpen(false)
        setIsUploadOpen((prev) => !prev)
      }}
      className="relative z-[30] flex h-[38px] items-center gap-2 rounded-[14px] bg-[#d9d9d9] px-3 text-[13px] text-[#222]"
    >
      <PlusSquare size={15} />
      <span>上傳內容</span>
    </button>

    <button
      type="button"
      onClick={() => {
        setIsUploadOpen(false)
        setIsMenuOpen((prev) => !prev)
      }}
      className="relative z-[30] flex h-[38px] items-center gap-2 rounded-[14px] bg-[#d9d9d9] px-3 text-[13px] text-[#222]"
    >
      <Menu size={18} />
      <span>{isMenuOpen ? 'CLOSE' : 'MENU'}</span>
    </button>
  </div>
</div>

        {/* Profile Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex gap-3">
            <div className="h-[58px] w-[58px] rounded-full bg-[#d9d9d9]" />

            <div>
              <div className="text-[18px] font-medium text-[#222]">小新</div>
              <div className="text-[18px] font-medium text-[#444]">Sky_07_21</div>
            </div>
          </div>

          <div className="pr-1 text-right">
            <div className="text-[18px] text-[#222]">5萬</div>
            <div className="text-[18px] text-[#222]">粉絲</div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-3">
          <div className="text-[16px] leading-[1.45] text-[#333]">HI 大家好</div>
          <div className="text-[16px] leading-[1.45] text-[#333]">我今年20歲</div>
          <div className="text-[16px] leading-[1.45] text-[#333]">喜歡跳舞</div>
        </div>

        {/* Stats */}
<div className="mb-4 flex items-center gap-6 text-[15px] text-[#333]">
  <div className="flex items-center gap-2">
    <Camera size={18} />
    <span>20</span>
  </div>

  <div className="flex items-center gap-2">
    <Smile size={18} />
    <span>雙性戀</span>
  </div>

  <div className="flex items-center gap-2">
    <Tag size={18} />
    <span>單身</span>
  </div>

  {/* 🔥 新增 IP 標籤 */}
  <div className="flex items-center gap-2">
    <MapPin size={18} />
    <span>台灣, 台北</span>
  </div>
</div>

{/* Action Buttons */}
<div className="mb-4 flex w-full items-center gap-3">
  <button
    type="button"
    className="flex h-[44px] flex-1 items-center justify-center rounded-[18px] !border-[1.5px] !border-solid !border-[#8f8f8f] !bg-transparent px-3 text-[15px] text-[#222] leading-none whitespace-nowrap"
    style={{ WebkitAppearance: 'none', appearance: 'none' }}
  >
    LINKPORT
  </button>

  <button
    type="button"
    className="flex h-[44px] flex-1 items-center justify-center rounded-[18px] !border-[1.5px] !border-solid !border-[#8f8f8f] !bg-transparent px-3 text-[15px] text-[#222] leading-none whitespace-nowrap"
    style={{ WebkitAppearance: 'none', appearance: 'none' }}
  >
    編輯檔案
  </button>

  <button
    type="button"
    className="flex h-[44px] flex-1 items-center justify-center rounded-[18px] !border-[1.5px] !border-solid !border-[#8f8f8f] !bg-transparent px-3 text-[15px] text-[#222] leading-none whitespace-nowrap"
    style={{ WebkitAppearance: 'none', appearance: 'none' }}
  >
    分享檔案
  </button>
</div>

        {/* Tab Icons */}
        <div className="relative mb-2 border-b border-[#d9d9d9] pb-2">
          <div className="grid grid-cols-4">
            <button
              type="button"
              onClick={() => goToTab(0)}
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
              onClick={() => goToTab(1)}
              className="flex h-[34px] items-center justify-center"
            >
              <Clapperboard
                size={20}
                className="transition-colors duration-200"
                color={activeTab === 1 ? activeColor : inactiveColor}
              />
            </button>

            <button
              type="button"
              onClick={() => goToTab(2)}
              className="flex h-[34px] items-center justify-center"
            >
              <Bookmark
                size={20}
                className="transition-colors duration-200"
                color={activeTab === 2 ? activeColor : inactiveColor}
              />
            </button>

            <button
              type="button"
              onClick={() => goToTab(3)}
              className="flex h-[34px] items-center justify-center"
            >
              <ImageIcon
                size={20}
                className="transition-colors duration-200"
                color={activeTab === 3 ? activeColor : inactiveColor}
              />
            </button>
          </div>

          {/* Active Tab Line */}
          <div
            className="pointer-events-none absolute bottom-0 h-[4px] px-2 transition-all duration-300 ease-out"
            style={{
              left: `${activeTab * 25}%`,
              width: '25%',
            }}
          >
            <div className="h-[4px] w-full rounded-full bg-[#d89ad0]" />
          </div>
        </div>

        {/* Swipe Content Area */}
        <div
          data-no-page-swipe="true"
          className="overflow-hidden touch-pan-y"
          onTouchStart={handleTabTouchStart}
          onTouchMove={handleTabTouchMove}
          onTouchEnd={handleTabTouchEnd}
        >
          <div
            className="flex w-full transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${activeTab * 100}%)`,
            }}
          >
            {/* Tab 1 */}
            <div className="w-full shrink-0">
              <div className="grid grid-cols-3 gap-[2px]">
                {gridItems.map((_, index) => (
                  <div
                    key={`grid-1-${index}`}
                    className="h-[190px] bg-[#d9d9d9]"
                  />
                ))}
              </div>
            </div>

            {/* Tab 2 */}
            <div className="w-full shrink-0">
              <div className="grid grid-cols-3 gap-[2px]">
                {gridItems.map((_, index) => (
                  <div
                    key={`grid-2-${index}`}
                    className="h-[190px] bg-[#d9d9d9]"
                  />
                ))}
              </div>
            </div>

            {/* Tab 3 */}
            <div className="w-full shrink-0">
              <div className="grid grid-cols-3 gap-[2px]">
                {gridItems.map((_, index) => (
                  <div
                    key={`grid-3-${index}`}
                    className="h-[190px] bg-[#d9d9d9]"
                  />
                ))}
              </div>
            </div>

            {/* Tab 4 */}
            <div className="w-full shrink-0">
              <div
                ref={albumScrollRef}
                className="flex gap-[10px] overflow-x-auto px-[2px] pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {albumItems.map((_, index) => (
                  <div
                    key={`album-${index}`}
                    className="h-[380px] min-w-[72%] rounded-[10px] shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
                    style={{
                      scrollSnapAlign: 'start',
                      backgroundColor: [
                        '#e3e3e3',
                        '#dcdcdc',
                        '#d6d6d6',
                        '#cfcfcf',
                        '#c8c8c8',
                      ][index % 5],
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
  {isUploadOpen && (
    <UploadFullPage
      onClose={() => setIsUploadOpen(false)}
    />
  )}
</AnimatePresence>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close profile menu overlay"
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[20] bg-black/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            />

            <motion.div
              className="fixed left-1/2 top-[96px] z-[25] w-[300px] -translate-x-1/2 rounded-[26px] bg-[#f3f3f3] px-6 py-6 shadow-[0_16px_40px_rgba(0,0,0,0.10)]"
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
                <MenuItem icon={<UserCircle2 size={22} />} label="帳號管理" />
                <MenuItem icon={<Activity size={22} />} label="流量報告" />
                <MenuItem icon={<Bell size={22} />} label="通知" />
                <MenuItem icon={<Star size={22} />} label="最愛" />
                <MenuItem icon={<Ban size={22} />} label="已封鎖" />
                <MenuItem icon={<Clock3 size={22} />} label="典藏內容" />
                <MenuItem
  icon={<Ticket size={22} />}
  label="Vibe會員"
  onClick={() => {
    setIsMenuOpen(false)
    openMembershipSite()
  }}
/>
                <MenuItem icon={<Grid3x3 size={22} />} label="Vibe Hub" />
                <MenuItem icon={<Settings size={22} />} label="設定" />
                <MenuItem icon={<Megaphone size={22} />} label="廣告中心" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}