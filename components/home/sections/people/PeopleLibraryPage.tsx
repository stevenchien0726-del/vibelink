'use client'

import { useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  animate,
  useMotionValue,
  useTransform,
} from 'framer-motion'
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
  onPickUser?: (user: { id: string; name: string; avatar: string }) => void
}

const folders: FolderItem[] = [
  { id: 'recent', label: '最近追蹤', emoji: '🆕' },
  { id: 'favorite', label: '我的最愛', emoji: '✨' },
  { id: 'more-interaction', label: '較常互動', emoji: '💬' },
  { id: 'mutual-follow', label: '互相關注中', emoji: '🔁' },
  { id: 'social-lover', label: '熱愛社交的人', emoji: '🥳' },
  { id: 'might-care', label: '你可能在意的人', emoji: '👀' },
  { id: 'less-interaction', label: '較少互動', emoji: '💤' },
  { id: 'creator', label: 'Vibelink創作者', emoji: '🎨' },
  { id: 'official-business', label: '官方和商業帳戶', emoji: '🏢' },
  { id: 'high-reply', label: '高頻互動與回覆', emoji: '⚡' },
]

function getFolderName(id: string) {
  const map: Record<string, string> = {
    recent: '🆕 最近追蹤',
    favorite: '✨ 我的最愛',
    'more-interaction': '💬 較常互動',
    'mutual-follow': '🔁 互相關注中',
    'social-lover': '🥳 熱愛社交的人',
    'might-care': '👀 你可能在意的人',
    'less-interaction': '💤 較少互動',
    creator: '🎨 Vibelink創作者',
    'official-business': '🏢 官方和商業帳戶',
    'high-reply': '⚡ 高頻互動與回覆',
  }

  return map[id] || 'People Library'
}

export default function PeopleLibraryPage({
  query,
  onClose,
  onPickUser,
}: PeopleLibraryPageProps) {

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const canDragCloseRef = useRef(true)

  const sheetY = useMotionValue(0)
  const overlayOpacity = useTransform(sheetY, [0, 320], [1, 0.78])
  const sheetScale = useTransform(sheetY, [0, 320], [1, 0.97])

  function closeSheet() {
    animate(sheetY, 540, {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1],
      onComplete: onClose,
    })
  }

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    canDragCloseRef.current = el.scrollTop <= 0
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[220] flex justify-center bg-[rgba(243,243,243,0.96)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ opacity: overlayOpacity }}
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
          style={{
            y: sheetY,
            scale: sheetScale,
          }}
          drag={selectedFolder ? false : 'y'}
          dragListener={!selectedFolder}
          dragDirectionLock
          dragMomentum={false}
          dragElastic={{ top: 0, bottom: 0.14 }}
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragStart={() => {
            const el = scrollRef.current
            if (!el) {
              canDragCloseRef.current = true
              return
            }
            canDragCloseRef.current = el.scrollTop <= 0
          }}
          onDrag={(_, info) => {
            if (selectedFolder) return

            if (!canDragCloseRef.current) {
              sheetY.set(0)
              return
            }

            if (info.offset.y < 0) {
              sheetY.set(0)
            }
          }}
          onDragEnd={(_, info) => {
            if (selectedFolder) return

            if (!canDragCloseRef.current) {
              animate(sheetY, 0, {
                type: 'spring',
                stiffness: 420,
                damping: 34,
                mass: 0.9,
              })
              return
            }

            const draggedDownEnough = info.offset.y > 130
            const fastEnough = info.velocity.y > 650

            if (draggedDownEnough || fastEnough) {
              closeSheet()
              return
            }

            animate(sheetY, 0, {
              type: 'spring',
              stiffness: 420,
              damping: 34,
              mass: 0.9,
            })
          }}
        >
          <div
  ref={scrollRef}
  onScroll={handleScroll}
  className="h-screen overflow-y-auto px-4 pb-[120px] pt-3 
  [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
>
  
            <div className="mb-4 flex items-center gap-3 pt-2">
              <div className="flex h-[36px] flex-1 items-center rounded-full bg-[#d9d9d9] px-4 text-[#222]">
                <Search size={18} strokeWidth={2.2} />
                <span className="ml-2 truncate text-[15px]">
                  {query || 'People Library'}
                </span>
              </div>

              <button
                type="button"
                onClick={closeSheet}
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
  folderId={folder.id}
  onOpenFolder={() => setSelectedFolder(folder.id)}
  onOpenProfile={(userId) => {
    console.log('open profile:', folder.id, userId)
  }}
  onPickUser={onPickUser}
/>
                  </div>

                  <div className="mt-3 text-center text-[14px] leading-[1.2] text-[#444]">
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
  folderId,
  onOpenFolder,
  onOpenProfile,
  onPickUser,
}: {
  folderId: string
  onOpenFolder: () => void
  onOpenProfile: (userId: string) => void
  onPickUser?: (user: { id: string; name: string; avatar: string }) => void
}) {

  return (
    <div className="grid w-full grid-cols-[1fr_1fr] items-center gap-4">
      <div className="flex flex-col items-center gap-5">
        <button
  type="button"
  onClick={() => {
    if (folderId === 'recent') {
      onPickUser?.({
        id: 'user-1',
        name: 'Sky_07_21',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
      })
      return
    }

    onOpenProfile('user-1')
  }}
  className="grid h-[42px] w-[42px] place-items-center bg-transparent p-0 transition-transform active:scale-95"
  aria-label="Open user 1 profile"
>
  {folderId === 'recent' ? (
    <img
      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      alt="Sky_07_21"
      className="h-[42px] w-[42px] rounded-full object-cover"
    />
  ) : (
    <div className="h-[42px] w-[42px] rounded-full bg-[#c893cf]" />
  )}
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