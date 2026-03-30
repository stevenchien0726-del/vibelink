'use client'

import { useState } from 'react'
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
}

const uploadMenuItems = [
  { id: 'post', label: '貼文', icon: <PlusSquare size={22} /> },
  { id: 'video', label: '短影片', icon: <Clapperboard size={22} /> },
  { id: 'album', label: '配對牆相片集', icon: <ImageIcon size={22} /> },
]

function MenuItem({ icon, label }: MenuItemProps) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-4 rounded-[14px] bg-transparent px-2 py-[10px] min-h-[45px] text-left text-[17px] text-[#222] transition hover:bg-[#ececec]"
    >
      <span className="flex h-[24px] w-[24px] items-center justify-center text-[#111]">
        {icon}
      </span>
      <span className="leading-none">{label}</span>
    </button>
  )
}

export default function ProfilePage({ onCloseMenu }: ProfilePageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const gridItems = Array.from({ length: 9 })

  return (
    <div className="relative min-h-screen bg-[#f3f3f3] pb-[110px]">
      <div className="mx-auto w-full max-w-[430px] px-4 pt-4">
        {/* Top Bar */}
        <div className="mb-4 flex items-center justify-between">
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
        <div className="mb-3 flex items-center gap-4 text-[16px] text-[#444]">
          <div className="flex items-center gap-1">
            <span>📷</span>
            <span>20</span>
          </div>

          <div className="flex items-center gap-1">
            <span>🔥</span>
            <span>雙性戀</span>
          </div>

          <div className="flex items-center gap-1">
            <span>💎</span>
            <span>單身</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            className="h-[36px] rounded-[14px] bg-[#d9d9d9] px-5 text-[18px] text-[#222]"
          >
            LINKPORT
          </button>

          <button
            type="button"
            className="h-[36px] rounded-[14px] bg-[#d9d9d9] px-4 text-[18px] text-[#222]"
          >
            編輯資料
          </button>
        </div>

        {/* Tab Icons */}
        <div className="mb-2 flex items-center justify-around border-b border-[#d9d9d9] pb-2">
          <button type="button" className="flex flex-col items-center text-[#222]">
            <Grid2x2 size={20} />
          </button>

          <button type="button" className="flex flex-col items-center text-[#222]">
            <Clapperboard size={20} />
          </button>

          <button type="button" className="flex flex-col items-center text-[#222]">
            <Bookmark size={20} />
          </button>

          <button type="button" className="flex flex-col items-center text-[#222]">
            <ImageIcon size={20} />
          </button>
        </div>

        {/* Active Tab Line */}
        <div className="mb-1 h-[4px] w-[100px] rounded-full bg-[#d89ad0]" />

        {/* Grid */}
        <div className="grid grid-cols-3 gap-[2px]">
          {gridItems.map((_, index) => (
            <div key={index} className="aspect-square bg-[#d9d9d9]" />
          ))}
        </div>
      </div>

      {/* Upload Overlay */}
      <AnimatePresence>
        {isUploadOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close upload menu overlay"
              onClick={() => setIsUploadOpen(false)}
              className="absolute inset-0 z-[20] bg-black/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            />

            <motion.div
              className="absolute left-1/2 top-[96px] z-[25] w-[300px] -translate-x-1/2 rounded-[26px] border-[2px] border-[#e0a3db] bg-[#f3f3f3] px-6 py-6 shadow-[0_16px_40px_rgba(0,0,0,0.10)]"
              initial={{ opacity: 0, scale: 0.82, y: -18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.86, y: -10 }}
              transition={{
                type: 'spring',
                stiffness: 360,
                damping: 28,
                mass: 0.9,
              }}
              style={{ originX: 0.12, originY: 0 }}
            >
              <div className="pb-5 text-center text-[20px] font-semibold text-[#666]">
                上傳內容
              </div>

              <div className="flex flex-col gap-[14px]">
                {uploadMenuItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full items-center justify-center rounded-[16px] px-[24px] py-[20px] text-[22px] font-medium text-[#222] transition-all duration-200 hover:bg-[#222]/8"
                  >
                    <div className="flex items-center gap-[12px]">
                      <span className="flex h-[34px] w-[34px] items-center justify-center">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

            {/* Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* 只蓋 ProfilePage 內容，不是整個 app */}
            <motion.button
              type="button"
              aria-label="Close profile menu overlay"
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 z-[20] bg-black/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            />

            {/* Menu panel */}
            <motion.div
              className="absolute left-1/2 top-[96px] z-[25] w-[300px] -translate-x-1/2 rounded-[26px] border-[3px] border-[#e0a3db] bg-[#f3f3f3] px-6 py-6 shadow-[0_16px_40px_rgba(0,0,0,0.10)]"
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
              <div className="flex flex-col gap-2">
                <MenuItem icon={<UserCircle2 size={22} />} label="帳號管理" />
                <MenuItem icon={<Activity size={22} />} label="流量報告" />
                <MenuItem icon={<Bell size={22} />} label="通知" />
                <MenuItem icon={<Star size={22} />} label="最愛" />
                <MenuItem icon={<Ban size={22} />} label="已封鎖" />
                <MenuItem icon={<Clock3 size={22} />} label="典藏內容" />
                <MenuItem icon={<Ticket size={22} />} label="Vibe會員" />
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