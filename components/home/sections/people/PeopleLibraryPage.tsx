'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search } from 'lucide-react'
import PeopleFolderPage from './PeopleFolderPage'

type FolderItem = {
  id: string
  label: string
  emoji?: string
}

type PeopleLibraryPageProps = {
  query?: string
  onClose: () => void
}

const folders: FolderItem[] = [
  { id: 'recent', label: '最近追蹤', emoji: '🆕' },
  { id: 'favorite', label: '我的最愛', emoji: '✨' },
  { id: 'mutual-follow', label: '互相關注中', emoji: '🔁' },
  { id: 'more-interaction', label: '較常互動', emoji: '💬' },
  { id: 'less-interaction', label: '較少互動', emoji: '💤' },
  { id: 'might-care', label: '你可能在意', emoji: '👀' },
]

function getFolderName(id: string) {
  const map: Record<string, string> = {
    recent: '🆕 最近追蹤',
    favorite: '✨ 我的最愛',
    'mutual-follow': '🔁 互相關注中',
    'more-interaction': '💬 較常互動',
    'less-interaction': '💤 較少互動',
    'might-care': '👀 你可能在意',
  }

  return map[id] || 'People Library'
}

export default function PeopleLibraryPage({
  query,
  onClose,
}: PeopleLibraryPageProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex justify-center bg-[rgba(243,243,243,0.96)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-[#f3f3f3]"
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 12 }}
          transition={{
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* 主內容 */}
          <div className="px-4 pt-3 pb-[100px]">

            {/* 🔍 Top Bar */}
            <div className="mb-4 flex items-center gap-3 pt-2">
              <div className="flex h-[36px] flex-1 items-center rounded-full bg-[#d9d9d9] px-4 text-[#222]">
                <Search size={18} strokeWidth={2.2} />

                <span className="ml-2 truncate text-[15px]">
                  {query || 'People Library'}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-[36px] min-w-[82px] items-center justify-center rounded-full bg-[#d9d9d9] px-4 text-[14px] font-medium text-[#555]"
              >
                CLOSE
              </button>
            </div>

            {/* 📁 Folder Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              {folders.map((folder) => (
                <div key={folder.id} className="flex flex-col items-center">
                  <div className="flex h-[170px] w-full items-center justify-center rounded-[20px] bg-[#d9d9d9] px-4">
                    <FolderPreview
                      onOpenFolder={() => setSelectedFolder(folder.id)}
                      onOpenProfile={(userId) => {
                        console.log('open profile:', folder.id, userId)
                      }}
                    />
                  </div>

                  <div className="mt-3 text-center text-[14px] leading-none text-[#444]">
                    <span className="mr-[2px]">{folder.emoji}</span>
                    <span>{folder.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 📂 第二層（資料夾展開） */}
          <AnimatePresence>
            {selectedFolder && (
              <PeopleFolderPage
                title={getFolderName(selectedFolder)}
                onClose={() => setSelectedFolder(null)}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* Folder Preview UI */

function FolderPreview({
  onOpenFolder,
  onOpenProfile,
}: {
  onOpenFolder: () => void
  onOpenProfile: (id: string) => void
}) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* 大頭像 */}
      <button
        onClick={() => onOpenProfile('u1')}
        className="absolute left-[22%] top-[22%] h-[46px] w-[46px] rounded-full bg-[#c88ad8]"
      />
      <button
        onClick={() => onOpenProfile('u2')}
        className="absolute right-[22%] top-[22%] h-[46px] w-[46px] rounded-full bg-[#c88ad8]"
      />
      <button
        onClick={() => onOpenProfile('u3')}
        className="absolute left-[22%] bottom-[22%] h-[46px] w-[46px] rounded-full bg-[#c88ad8]"
      />

      {/* 小 icon（進資料夾） */}
      <button
        onClick={onOpenFolder}
        className="absolute right-[22%] bottom-[22%] grid grid-cols-2 gap-[4px]"
      >
        <span className="h-[10px] w-[10px] rounded-full bg-[#c88ad8]" />
        <span className="h-[10px] w-[10px] rounded-full bg-[#c88ad8]" />
        <span className="h-[10px] w-[10px] rounded-full bg-[#c88ad8]" />
        <span className="h-[10px] w-[10px] rounded-full bg-[#c88ad8]" />
      </button>
    </div>
  )
}