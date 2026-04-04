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
        className="fixed inset-0 z-[220] flex justify-center bg-[rgba(243,243,243,0.96)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-[#f3f3f3]"
          initial={{ scale: 0.94, opacity: 0, y: 18 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.98, opacity: 0, y: 10 }}
          transition={{
            duration: 0.24,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="px-4 pt-3 pb-[100px]">
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
                className="flex h-[36px] min-w-[82px] items-center justify-center rounded-full bg-[#d9d9d9] px-4 text-[14px] font-medium text-[#222]"
              >
                CLOSE
              </button>
            </div>

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

function FolderPreview({
  onOpenFolder,
  onOpenProfile,
}: {
  onOpenFolder: () => void
  onOpenProfile: (userId: string) => void
}) {
  return (
    <div className="grid w-full grid-cols-[1fr_1fr] items-center gap-4">
      <div className="flex flex-col items-center gap-5">
        <button
          type="button"
          onClick={() => onOpenProfile('user-1')}
          className="grid h-[42px] w-[42px] place-items-center bg-transparent p-0 transition-transform active:scale-95"
          aria-label="Open user 1 profile"
        >
          <div className="h-[42px] w-[42px] rounded-full bg-[#c893cf]" />
        </button>

        <button
          type="button"
          onClick={() => onOpenProfile('user-2')}
          className="grid h-[42px] w-[42px] place-items-center bg-transparent p-0 transition-transform active:scale-95"
          aria-label="Open user 2 profile"
        >
          <div className="h-[42px] w-[42px] rounded-full bg-[#c893cf]" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-5">
        <button
          type="button"
          onClick={() => onOpenProfile('user-3')}
          className="grid h-[42px] w-[42px] place-items-center bg-transparent p-0 transition-transform active:scale-95"
          aria-label="Open user 3 profile"
        >
          <div className="h-[42px] w-[42px] rounded-full bg-[#c893cf]" />
        </button>

        <button
          type="button"
          onClick={onOpenFolder}
          className="grid grid-cols-2 gap-[6px] bg-transparent p-0 transition-transform active:scale-95"
          aria-label="Open folder"
        >
          <div className="h-[14px] w-[14px] rounded-full bg-[#c893cf]" />
          <div className="h-[14px] w-[14px] rounded-full bg-[#c893cf]" />
          <div className="h-[14px] w-[14px] rounded-full bg-[#c893cf]" />
          <div className="h-[14px] w-[14px] rounded-full bg-[#c893cf]" />
        </button>
      </div>
    </div>
  )
}