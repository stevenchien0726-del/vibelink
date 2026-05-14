'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  animate,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import { Search } from 'lucide-react'
import PeopleFolderPage from './PeopleFolderPage'
import { supabase } from '../../../../lib/supabase'
import type { Locale } from '@/i18n'

type PickedUser = {
  id: string
  name: string
  avatar: string
}

type PickUserPayload = {
  user: PickedUser
  sourceRect: DOMRect
}

type FolderItem = {
  id: string
  label: string
  emoji?: string
}

type PeopleLibraryPageProps = {
  query?: string
  locale: Locale
  onClose: () => void
  onPickUser?: (payload: PickUserPayload) => void
  onOpenProfile?: (userId: string) => void
}

function getFolders(locale: Locale): FolderItem[] {
  return [
    { id: 'recent', label: locale === 'en' ? 'Recently Followed' : '最近追蹤', emoji: '🆕' },
    { id: 'favorite', label: locale === 'en' ? 'My Favorites' : '我的最愛', emoji: '✨' },
    { id: 'more-interaction', label: locale === 'en' ? 'Frequent Interactions' : '較常互動', emoji: '💬' },
    { id: 'mutual-follow', label: locale === 'en' ? 'Mutual Following' : '互相關注中', emoji: '🔁' },
    { id: 'social-lover', label: locale === 'en' ? 'Social Lovers' : '熱愛社交的人', emoji: '🥳' },
    { id: 'might-care', label: locale === 'en' ? 'People You May Like' : '你可能在意的人', emoji: '👀' },
    { id: 'less-interaction', label: locale === 'en' ? 'Less Interaction' : '較少互動', emoji: '💤' },
    { id: 'creator', label: locale === 'en' ? 'Vibelink Creators' : 'Vibelink創作者', emoji: '🎨' },
    { id: 'official-business', label: locale === 'en' ? 'Official & Business' : '官方和商業帳戶', emoji: '🏢' },
    { id: 'high-reply', label: locale === 'en' ? 'High Replies' : '高頻互動與回覆', emoji: '⚡' },
  ]
}

function getFolderName(id: string, locale: Locale) {
  const map: Record<string, string> = {
  recent: locale === 'en' ? '🆕 Recently Followed' : '🆕 最近追蹤',
  favorite: locale === 'en' ? '✨ My Favorites' : '✨ 我的最愛',
  'more-interaction': locale === 'en' ? '💬 Frequent Interactions' : '💬 較常互動',
  'mutual-follow': locale === 'en' ? '🔁 Mutual Following' : '🔁 互相關注中',
  'social-lover': locale === 'en' ? '🥳 Social Lovers' : '🥳 熱愛社交的人',
  'might-care': locale === 'en' ? '👀 People You May Like' : '👀 你可能在意的人',
  'less-interaction': locale === 'en' ? '💤 Less Interaction' : '💤 較少互動',
  creator: locale === 'en' ? '🎨 Vibelink Creators' : '🎨 Vibelink創作者',
  'official-business': locale === 'en' ? '🏢 Official & Business' : '🏢 官方和商業帳戶',
  'high-reply': locale === 'en' ? '⚡ High Replies' : '⚡ 高頻互動與回覆',
}

  return map[id] || 'People Library'
}

export default function PeopleLibraryPage({
  query,
  locale,
  onClose,
  onPickUser,
  onOpenProfile,
}: PeopleLibraryPageProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [recentUser, setRecentUser] = useState<PickedUser | null>(null)
  const folders = getFolders(locale)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const canDragCloseRef = useRef(true)

  const sheetY = useMotionValue(0)
  const overlayOpacity = useTransform(sheetY, [0, 320], [1, 0.78])
  const sheetScale = useTransform(sheetY, [0, 320], [1, 0.97])

  useEffect(() => {
    async function fetchRecentFollowedUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setRecentUser(null)
        return
      }

      const { data: followRows, error: followError } = await supabase
        .from('follows')
        .select('following_id, created_at')
        .eq('follower_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (followError) {
        console.error('讀取最近追蹤失敗:', followError)
        setRecentUser(null)
        return
      }

      const followingId = followRows?.[0]?.following_id
      console.log('PeopleLibrary recent followRows:', followRows)
console.log('PeopleLibrary followingId:', followingId)

      if (!followingId) {
        setRecentUser(null)
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', followingId)
        .maybeSingle()

      if (profileError || !profileData) {
        console.error('讀取最近追蹤 profile 失敗:', profileError)
        setRecentUser(null)
        return
      }

      setRecentUser({
  id: profileData.id,
  name:
    profileData.display_name ||
    profileData.username ||
    'Vibelink User',

  avatar: profileData.avatar_url || '',
})
    }

      fetchRecentFollowedUser()
}, [onOpenProfile])

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
            canDragCloseRef.current = !el || el.scrollTop <= 0
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

            if (info.offset.y > 130 || info.velocity.y > 650) {
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
            className="h-screen overflow-y-auto px-4 pb-[120px] pt-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                      recentUser={recentUser}
                      onOpenFolder={() => setSelectedFolder(folder.id)}
                      onOpenProfile={(userId) => {
                        onOpenProfile?.(userId)
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
                title={getFolderName(selectedFolder, locale)}
                folderId={selectedFolder}
                onClose={() => setSelectedFolder(null)}
                onPickUser={onPickUser}
                onOpenProfile={onOpenProfile}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function UserAvatarWithName({
  user,
  onClick,
}: {
  user: PickedUser
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <button
  type="button"
  onPointerDownCapture={(e) => {
    e.stopPropagation()
  }}
  onPointerUpCapture={(e) => {
    e.stopPropagation()
    onClick(e as unknown as React.MouseEvent<HTMLButtonElement>)
  }}
  onClick={(e) => {
    e.stopPropagation()
  }}
  className="flex h-[64px] w-[64px] flex-col items-center justify-start bg-transparent p-0 transition-transform active:scale-95"
  aria-label={`Open ${user.name} profile`}
>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="h-[42px] w-[42px] shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="h-[42px] w-[42px] shrink-0 rounded-full bg-[#c893cf]" />
      )}

      <span className="mt-[6px] max-w-[72px] truncate text-center text-[12px] leading-[1.1] text-[#333]">
        {user.name}
      </span>
    </button>
  )
}

function PlaceholderUserButton({
  userId,
  onOpenProfile,
}: {
  userId: string
  onOpenProfile?: (userId: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenProfile?.(userId)}
      className="flex h-[64px] w-[64px] flex-col items-center justify-start bg-transparent p-0 transition-transform active:scale-95"
      aria-label={`Open ${userId} profile`}
    >
      <div className="h-[42px] w-[42px] shrink-0 rounded-full bg-[#c893cf]" />

      <span className="mt-[6px] max-w-[72px] truncate text-center text-[12px] leading-[1.1] text-[#777]">
        （用戶名）
      </span>
    </button>
  )
}

function FolderPreview({
  folderId,
  onOpenFolder,
  onOpenProfile,
  onPickUser,
  recentUser,
}: {
  folderId: string
  onOpenFolder: () => void
  onOpenProfile: (userId: string) => void
  onPickUser?: (payload: PickUserPayload) => void
  recentUser: PickedUser | null
}) {
  return (
    <div className="grid w-full grid-cols-2 place-items-start gap-x-6 gap-y-5 pt-1">
      {folderId === 'recent' && recentUser ? (
        <UserAvatarWithName
  user={recentUser}
  onClick={(e) => {
    e.stopPropagation()

    const sourceRect = e.currentTarget.getBoundingClientRect()

    if (onPickUser) {
      console.log('PeopleLibrary pick user for AI Radar:', recentUser.id)

      onPickUser({
        user: recentUser,
        sourceRect,
      })

      return
    }

    console.log('PeopleLibrary open profile:', recentUser.id)

    onOpenProfile?.(recentUser.id)
  }}
/>
      ) : (
        <PlaceholderUserButton
          userId="user-1"
          onOpenProfile={folderId === 'recent' ? undefined : onOpenProfile}
        />
      )}

      <PlaceholderUserButton userId="user-2" onOpenProfile={onOpenProfile} />

      <PlaceholderUserButton userId="user-3" onOpenProfile={onOpenProfile} />

      <button
        type="button"
        onClick={onOpenFolder}
        className="flex h-[64px] w-[64px] flex-col items-center justify-start bg-transparent p-0 transition-transform active:scale-95"
        aria-label="Open folder"
      >
        <div className="mt-[6px] grid grid-cols-2 gap-[6px]">
          <div className="h-[14px] w-[14px] rounded-full bg-[#c893cf]" />
          <div className="h-[14px] w-[14px] rounded-full bg-[#c893cf]" />
          <div className="h-[14px] w-[14px] rounded-full bg-[#c893cf]" />
          <div className="h-[14px] w-[14px] rounded-full bg-[#c893cf]" />
        </div>
      </button>
    </div>
  )
}