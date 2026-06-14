'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  animate,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import { Search } from 'lucide-react'
import PeopleFolderPage from './PeopleFolderPage'
import type { FolderUser, FolderUsersMap } from './PeopleFolderPage'
import { supabase } from '../../../../lib/supabase'
import type { Locale } from '@/i18n'
import { useBodyScrollLock } from '@/src/hooks/useBodyScrollLock'

import {
  sortPeopleLibraryUsers,
  type PeopleLibraryUser,
} from './sortPeopleLibraryUsers'

type PickedUser = FolderUser

type PickUserPayload = {
  user: PickedUser
  sourceRect: DOMRect
}

type FolderItem = {
  id: string
  label: string
  emoji?: string
}

type PeopleFollowRow = {
  following_id: string | null
  created_at: string | null
}

type PeopleFavoriteRow = {
  favorite_user_id: string | null
  created_at: string | null
}

type PeopleProfileRow = {
  id: string
  username?: string | null
  display_name?: string | null
  avatar_url?: string | null
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
    { id: 'less-interaction', label: locale === 'en' ? 'Less Interaction' : '較少互動', emoji: '💤' },
    { id: 'creator', label: locale === 'en' ? 'Vibelink Creators' : 'Vibelink創作者', emoji: '🎨' },
    { id: 'official-business', label: locale === 'en' ? 'Official & Business' : '官方和商業帳戶', emoji: '🏢' },
  ]
}

function getFolderName(id: string, locale: Locale) {
  const map: Record<string, string> = {
    recent: locale === 'en' ? '🆕 Recently Followed' : '🆕 最近追蹤',
    favorite: locale === 'en' ? '✨ My Favorites' : '✨ 我的最愛',
    'more-interaction': locale === 'en' ? '💬 Frequent Interactions' : '💬 較常互動',
    'less-interaction': locale === 'en' ? '💤 Less Interaction' : '💤 較少互動',
    creator: locale === 'en' ? '🎨 Vibelink Creators' : '🎨 Vibelink創作者',
    'official-business': locale === 'en' ? '🏢 Official & Business' : '🏢 官方和商業帳戶',
  }

  return map[id] || 'People Library'
}

function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
  label: string
): Promise<T | null> {
  let timeoutId: number | null = null

  return Promise.race([
    Promise.resolve(promise),
    new Promise<null>((resolve) => {
      timeoutId = window.setTimeout(() => {
        console.warn(`${label} timeout`)
        resolve(null)
      }, ms)
    }),
  ]).finally(() => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId)
    }
  })
}

const PEOPLE_LIBRARY_TIMEOUT_MS = 6000
const PEOPLE_LIBRARY_PROFILE_BATCH_SIZE = 80
const peopleLibraryUsersCache = new Map<string, PeopleLibraryUser[]>()
const peopleLibraryInFlight = new Map<string, Promise<PeopleLibraryUser[]>>()

export default function PeopleLibraryPage({
  query,
  locale,
  onClose,
  onPickUser,
  onOpenProfile,
}: PeopleLibraryPageProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [allPeopleUsers, setAllPeopleUsers] = useState<PeopleLibraryUser[]>([])
  const [peopleLoading, setPeopleLoading] = useState(true)
  const [peopleError, setPeopleError] = useState('')

  const folders = useMemo(() => getFolders(locale), [locale])

  const folderUsers = useMemo<FolderUsersMap>(() => {
    const emptyFolders = Object.fromEntries(
      folders.map((folder) => [folder.id, [] as FolderUser[]])
    ) as FolderUsersMap

    const sortedFolders = Object.fromEntries(
      Object.entries(sortPeopleLibraryUsers(allPeopleUsers)).map(
        ([folderId, users]) => [
          folderId,
          users.map((user) => ({
            id: user.id,
            name: user.name,
            avatar: user.avatar ?? '',
          })),
        ]
      )
    ) as FolderUsersMap

    return {
      ...emptyFolders,
      ...sortedFolders,
    }
  }, [allPeopleUsers, folders])

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const canDragCloseRef = useRef(true)

  const sheetY = useMotionValue(0)
  const overlayOpacity = useTransform(sheetY, [0, 320], [1, 0.78])
  const sheetScale = useTransform(sheetY, [0, 320], [1, 0.97])

  useBodyScrollLock(true)

  useEffect(() => {
    let cancelled = false

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function fetchPeopleLibraryUsers(retry = 0) {
      try {
        setPeopleLoading(true)
        setPeopleError('')

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) throw authError

        if (!user) {
          if (!cancelled) setAllPeopleUsers([])
          return
        }

        const { data: followRows, error: followError } = await supabase
          .from('follows')
          .select('following_id, created_at')
          .eq('follower_id', user.id)
          .order('created_at', { ascending: false })
          .limit(300)

        if (followError) throw followError

        const { data: favoriteRows, error: favoriteError } = await supabase
          .from('favorite_users')
          .select('favorite_user_id, created_at')
          .eq('user_id', user.id)

        if (favoriteError) throw favoriteError

        const followingIds =
          followRows?.map((row: any) => row.following_id).filter(Boolean) ?? []

        const favoriteIds =
          favoriteRows?.map((row: any) => row.favorite_user_id).filter(Boolean) ?? []

        const mergedIds = Array.from(new Set([...followingIds, ...favoriteIds]))

        if (mergedIds.length === 0) {
          if (!cancelled) setAllPeopleUsers([])
          return
        }

        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', mergedIds)

        if (profileError) throw profileError

        const followMap = new Map(
          (followRows ?? []).map((row: any) => [row.following_id, row.created_at])
        )

        const favoriteMap = new Map(
          (favoriteRows ?? []).map((row: any) => [
            row.favorite_user_id,
            row.created_at,
          ])
        )

        const mappedUsers: PeopleLibraryUser[] =
          profiles?.map((profile: any) => ({
            id: profile.id,
            name: profile.display_name || profile.username || 'Vibelink User',
            avatar: profile.avatar_url || '',
            followedAt: followMap.get(profile.id) ?? null,
            favoritedAt: favoriteMap.get(profile.id) ?? null,
            isFavorite: favoriteMap.has(profile.id),

            accountType: 'normal',
            isCreator: false,

            messageCount: 0,
            commentCount: 0,
            likeCount: 0,
            profileViewCount: 0,
          })) ?? []

        if (!cancelled) {
          setAllPeopleUsers(mappedUsers)
        }
      } catch (error) {
        console.error('People Library 讀取失敗:', error)

        if (retry < 1) {
          window.setTimeout(() => {
            fetchPeopleLibraryUsers(retry + 1)
          }, 600)
          return
        }

        if (!cancelled) {
          setPeopleError(
            locale === 'en'
              ? 'People Library failed to load. Please try again.'
              : 'People Library 讀取失敗，請再試一次'
          )
          setAllPeopleUsers([])
        }
      }
    }

    async function fetchProfilesInBatches(userIds: string[]) {
      const batches: string[][] = []

      for (
        let index = 0;
        index < userIds.length;
        index += PEOPLE_LIBRARY_PROFILE_BATCH_SIZE
      ) {
        batches.push(
          userIds.slice(index, index + PEOPLE_LIBRARY_PROFILE_BATCH_SIZE)
        )
      }

      const batchResults = await Promise.allSettled(
        batches.map((batch, index) =>
          withTimeout(
            supabase
              .from('profiles')
              .select('id, username, display_name, avatar_url')
              .in('id', batch),
            PEOPLE_LIBRARY_TIMEOUT_MS,
            `people_library_profiles_${index}`
          )
        )
      )

      return batchResults.flatMap((result): PeopleProfileRow[] => {
        if (result.status === 'rejected') {
          console.warn('People Library profiles batch failed:', result.reason)
          return []
        }

        if (!result.value) return []

        if (result.value.error) {
          console.warn('People Library profiles batch error:', result.value.error)
          return []
        }

        return (result.value.data ?? []) as PeopleProfileRow[]
      })
    }

    async function fetchPeopleLibraryUsersFast() {
      setPeopleError('')
      let hasCachedUsers = false

      try {
        const authResult = await withTimeout(
          supabase.auth.getUser(),
          PEOPLE_LIBRARY_TIMEOUT_MS,
          'people_library_auth_user'
        )

        const user = authResult?.data.user

        if (authResult?.error) {
          console.warn('People Library auth failed:', authResult.error)
        }

        if (!user) {
          if (!cancelled) {
            setAllPeopleUsers([])
          }
          return
        }

        const cachedUsers = peopleLibraryUsersCache.get(user.id)
        hasCachedUsers = Boolean(cachedUsers)

        if (cachedUsers) {
          if (!cancelled) {
            setAllPeopleUsers(cachedUsers)
            setPeopleLoading(false)
          }
        } else if (!cancelled) {
          setPeopleLoading(true)
          setAllPeopleUsers([])
        }

        const existingRequest = peopleLibraryInFlight.get(user.id)
        const freshUsers =
          existingRequest ??
          (async () => {
            const [followResult, favoriteResult] = await Promise.allSettled([
          withTimeout(
            supabase
              .from('follows')
              .select('following_id, created_at')
              .eq('follower_id', user.id)
              .order('created_at', { ascending: false })
              .limit(300),
            PEOPLE_LIBRARY_TIMEOUT_MS,
            'people_library_follows'
          ),
          withTimeout(
            supabase
              .from('favorite_users')
              .select('favorite_user_id, created_at')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(300),
            PEOPLE_LIBRARY_TIMEOUT_MS,
            'people_library_favorite_users'
          ),
        ])

            const followRows =
          followResult.status === 'fulfilled' &&
          followResult.value &&
          !followResult.value.error
            ? ((followResult.value.data ?? []) as PeopleFollowRow[])
            : []

            const favoriteRows =
          favoriteResult.status === 'fulfilled' &&
          favoriteResult.value &&
          !favoriteResult.value.error
            ? ((favoriteResult.value.data ?? []) as PeopleFavoriteRow[])
            : []

            if (followResult.status === 'rejected') {
          console.warn('People Library follows failed:', followResult.reason)
        } else if (followResult.value?.error) {
          console.warn('People Library follows error:', followResult.value.error)
        }

            if (favoriteResult.status === 'rejected') {
          console.warn('People Library favorites failed:', favoriteResult.reason)
        } else if (favoriteResult.value?.error) {
          console.warn('People Library favorites error:', favoriteResult.value.error)
        }

            const followingIds = followRows
          .map((row) => row.following_id)
          .filter((id): id is string => Boolean(id))

            const favoriteIds = favoriteRows
          .map((row) => row.favorite_user_id)
          .filter((id): id is string => Boolean(id))

            const mergedIds = Array.from(new Set([...followingIds, ...favoriteIds]))

            if (mergedIds.length === 0) return []

            const profiles = await fetchProfilesInBatches(mergedIds)

            const followMap = new Map(
          followRows.map((row) => [row.following_id, row.created_at])
        )

            const favoriteMap = new Map(
          favoriteRows.map((row) => [
            row.favorite_user_id,
            row.created_at,
          ])
        )

            const mappedUsers: PeopleLibraryUser[] = profiles.map((profile) => ({
          id: profile.id,
          name: profile.display_name || profile.username || 'Vibelink User',
          avatar: profile.avatar_url || '',
          followedAt: followMap.get(profile.id) ?? null,
          favoritedAt: favoriteMap.get(profile.id) ?? null,
          isFavorite: favoriteMap.has(profile.id),
          accountType: 'normal',
          isCreator: false,
          messageCount: 0,
          commentCount: 0,
          likeCount: 0,
          profileViewCount: 0,
        }))

            return mappedUsers
          })().finally(() => {
            peopleLibraryInFlight.delete(user.id)
          })

        if (!existingRequest) {
          peopleLibraryInFlight.set(user.id, freshUsers)
        }

        const mappedUsers = await freshUsers

        peopleLibraryUsersCache.set(user.id, mappedUsers)

        if (!cancelled) {
          setAllPeopleUsers(mappedUsers)
        }
      } catch (error) {
        console.warn('People Library partial load failed:', error)

        if (!cancelled) {
          if (!hasCachedUsers) {
            setAllPeopleUsers([])
          }
        }
      } finally {
        if (!cancelled) {
          setPeopleLoading(false)
        }
      }
    }

    async function reloadPeopleLibrary() {
      setPeopleLoading(true)
      setPeopleError('')

      try {
        await fetchPeopleLibraryUsersFast()
      } catch (error) {
        console.warn('People Library reload failed:', error)

        if (!cancelled) {
          setPeopleError(
            locale === 'en'
              ? 'People Library failed to load. Please try again.'
              : 'People Library 讀取失敗，請再試一次'
          )
          setAllPeopleUsers([])
        }
      } finally {
        if (!cancelled) {
          setPeopleLoading(false)
        }
      }
    }

    reloadPeopleLibrary()

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setPeopleLoading(false)
      }
    }, 10000)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [locale])

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
        data-block-page-swipe="true"
        className="fixed inset-0 z-[1400] flex justify-center overscroll-contain bg-[var(--app-bg)]/95 text-[var(--app-text)] touch-pan-y"
        initial={{ opacity: 0 }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onPointerUp={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ opacity: overlayOpacity }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          className="relative z-[1401] h-[100dvh] w-full max-w-[430px] overflow-hidden overscroll-contain bg-[var(--app-bg)] touch-pan-y"
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
          dragPropagation={false}
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
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="h-[100dvh] overflow-y-auto overscroll-contain px-4 pb-[120px] pt-3 touch-pan-y [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="mb-4 flex items-center gap-3 pt-2">
              <div className="flex h-[36px] flex-1 items-center rounded-full border border-[var(--app-card-border)] bg-[var(--app-card)] px-4 text-[var(--app-text)]">
                <Search size={18} strokeWidth={2.2} />
                <span className="ml-2 truncate text-[15px]">
                  {query || 'People Library'}
                </span>
              </div>

              <button
                type="button"
                onClick={closeSheet}
                className="flex h-[36px] min-w-[82px] items-center justify-center rounded-full border border-[var(--app-card-border)] bg-[var(--app-card)] px-4 text-[14px] font-medium text-[var(--app-text)] active:scale-[0.97]"
              >
                {locale === 'en' ? 'CLOSE' : '關閉'}
              </button>
            </div>

            {peopleLoading && (
              <div className="mb-4 rounded-[18px] border border-[var(--app-card-border)] bg-[var(--app-card)] px-4 py-3 text-center text-[13px] text-[var(--app-muted)]">
                {locale === 'en'
                  ? 'Loading People Library...'
                  : 'People Library 讀取中...'}
              </div>
            )}

            {peopleError && !peopleLoading && (
              <div className="mb-4 rounded-[18px] border border-[var(--app-card-border)] bg-[var(--app-card)] px-4 py-3 text-center">
                <p className="mb-2 text-[13px] text-[var(--app-muted)]">
                  {peopleError}
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="rounded-full bg-[#c893cf] px-4 py-2 text-[13px] font-medium text-white"
                >
                  {locale === 'en' ? 'Retry' : '重新讀取'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              {folders.map((folder) => (
                <div key={folder.id} className="flex flex-col items-center">
                  <div className="flex h-[170px] w-full items-center justify-center rounded-[20px] border border-[var(--app-card-border)] bg-[var(--app-card)] px-4">
                    <FolderPreview
                      users={folderUsers[folder.id] ?? []}
                      onOpenFolder={() => setSelectedFolder(folder.id)}
                      onOpenProfile={(userId) => {
                        onOpenProfile?.(userId)
                      }}
                      onPickUser={onPickUser}
                    />
                  </div>

                  <div className="mt-3 text-center text-[14px] leading-[1.2] text-[var(--app-muted)]">
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
                users={folderUsers[selectedFolder] ?? []}
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
        e.preventDefault()
        e.stopPropagation()
      }}
      onPointerUpCapture={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick(e)
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

      <span className="mt-[6px] max-w-[72px] truncate text-center text-[12px] leading-[1.1] text-[var(--app-text)]">
        {user.name}
      </span>
    </button>
  )
}

function PlaceholderUserSlot() {
  return <div className="h-[64px] w-[64px]" aria-hidden="true" />
}

function MoreUsersPreview({
  users,
  onOpenFolder,
}: {
  users: FolderUser[]
  onOpenFolder: () => void
}) {
  const previewUsers = users.slice(3, 7)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onOpenFolder()
      }}
      className="flex h-[64px] w-[64px] flex-col items-center justify-start bg-transparent p-0 transition-transform active:scale-95"
      aria-label="Open folder"
    >
      {previewUsers.length > 0 ? (
        <div className="mt-[6px] grid grid-cols-2 gap-[6px]">
          {previewUsers.map((user) =>
            user.avatar ? (
              <img
                key={user.id}
                src={user.avatar}
                alt=""
                className="h-[14px] w-[14px] rounded-full object-cover"
              />
            ) : (
              <div
                key={user.id}
                className="h-[14px] w-[14px] rounded-full border border-[var(--app-card-border)] bg-[#b8b8b8]/55"
              />
            )
          )}
        </div>
      ) : (
        <div className="mt-[6px] grid grid-cols-2 gap-[6px]">
          <div className="h-[14px] w-[14px] rounded-full bg-[#c893cf]" />
          <div className="h-[14px] w-[14px] rounded-full bg-[#c893cf]" />
          <div className="h-[14px] w-[14px] rounded-full bg-[#c893cf]" />
          <div className="h-[14px] w-[14px] rounded-full bg-[#c893cf]" />
        </div>
      )}
    </button>
  )
}

function FolderPreview({
  users,
  onOpenFolder,
  onOpenProfile,
  onPickUser,
}: {
  users: FolderUser[]
  onOpenFolder: () => void
  onOpenProfile: (userId: string) => void
  onPickUser?: (payload: PickUserPayload) => void
}) {
  const visibleUsers = users.slice(0, 3)

  return (
    <div className="grid w-full grid-cols-2 place-items-start gap-x-6 gap-y-5 pt-1">
      {[0, 1, 2].map((slotIndex) => {
        const user = visibleUsers[slotIndex]

        if (!user) {
          return <PlaceholderUserSlot key={`slot-${slotIndex}`} />
        }

        return (
          <UserAvatarWithName
            key={user.id}
            user={user}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()

              const sourceRect = e.currentTarget.getBoundingClientRect()

              if (onPickUser) {
                onPickUser({
                  user,
                  sourceRect,
                })

                return
              }

              onOpenProfile?.(user.id)
            }}
          />
        )
      })}

      <MoreUsersPreview users={users} onOpenFolder={onOpenFolder} />
    </div>
  )
}
