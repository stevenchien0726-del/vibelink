'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  PencilLine,
  Search,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import PeopleLibraryPage from '@/components/home/sections/people/PeopleLibraryPage'

import OtherUserProfilePage from '@/components/profile/OtherUserProfilePage'
import ChatRoomPage from '@/components/chat/ChatRoomPage'

import type { Locale } from '@/i18n'
import { supabase } from '@/lib/supabase'
import { getCachedSession } from '@/lib/authSessionCache'
import { usePullToRefresh } from '@/src/hooks/usePullToRefresh'

type ConversationItem = {
  id: string
  otherUserId: string
  name: string
  avatarUrl?: string
  lastMessage?: string
  isPinned?: boolean
  isHidden?: boolean
  pinnedAt?: string | null
  hiddenAt?: string | null
  latestMessageAt?: string | null
}
type SearchAccountItem = {
  id: string
  name: string
  sub: string
  avatarUrl?: string
}

type MessagePageProps = {
  onOpenMenu?: () => void
  locale: Locale
}

const messageText = {
  'zh-TW': {
    peopleLibrary: 'People Library',

    searchAccounts: '搜尋用戶帳戶',
    searchAccountsSub: '搜尋你想開始聊天或查看的對象',

    searchPlaceholder: '搜尋 Vibelink 帳戶',

    noAccount: '找不到符合的帳戶',

    editMessage: '編輯訊息',
    editMessageSub: '釘選 / 隱藏',

    pinChat: '釘選重要聊天',
    hideLowInteraction: '隱藏低互動聊天',
  },

  en: {
    peopleLibrary: 'People Library',

    searchAccounts: 'Search Accounts',
    searchAccountsSub:
      'Search for people you want to chat with or view',

    searchPlaceholder: 'Search Vibelink accounts',

    noAccount: 'No matching accounts found',

    editMessage: 'Edit Messages',
    editMessageSub:
      'Manage pinned / hidden',

    pinChat: 'Pin important chats',
    hideLowInteraction: 'Hide low interaction chats',
  },
} as const

export default function MessagePage({
  onOpenMenu,
  locale,
}: MessagePageProps) {
  const [isPeopleLibraryOpen, setIsPeopleLibraryOpen] = useState(false)
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null)
  
  const [isTopCapsulePressed, setIsTopCapsulePressed] = useState(false)

  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false)
const [isEditPanelOpen, setIsEditPanelOpen] = useState(false)
const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
const [isPinEditMode, setIsPinEditMode] = useState(false)

  const [searchText, setSearchText] = useState('')
    const [searchAccounts, setSearchAccounts] = useState<SearchAccountItem[]>([])
  const [isSearchingAccounts, setIsSearchingAccounts] = useState(false)

  const [groupName, setGroupName] = useState('')
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([
    'g1',
    'g3',
  ])

  const [isTopBarHidden, setIsTopBarHidden] = useState(false)
  const lastScrollYRef = useRef(0)

  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [peopleLibraryWarmUsers, setPeopleLibraryWarmUsers] = useState<any[]>([])

const [myProfileWarmImages, setMyProfileWarmImages] = useState<string[]>([])

const [openedChat, setOpenedChat] = useState<ConversationItem | null>(null)

const [messageLoading, setMessageLoading] = useState(true)
const [messageError, setMessageError] = useState('')
const [isRefreshingMessages, setIsRefreshingMessages] = useState(false)
const messageScrollRef = useRef<HTMLDivElement | null>(null)
const reloadConversationsRef = useRef<(() => Promise<void>) | null>(null)

    const filteredAccounts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    if (!keyword) return searchAccounts

    return searchAccounts.filter((account) =>
      account.name.toLowerCase().includes(keyword)
    )
  }, [searchAccounts, searchText])

  const hasAnyTopPanelOpen =
    isSearchPanelOpen || isEditPanelOpen || isCreateGroupOpen

  function closeAllTopPanels() {
    setIsSearchPanelOpen(false)
    setIsEditPanelOpen(false)
    setIsCreateGroupOpen(false)
  }

  function triggerTopCapsuleFeedback() {
    setIsTopCapsulePressed(true)

    window.setTimeout(() => {
      setIsTopCapsulePressed(false)
    }, 320)
  }

  function openSearchPanel() {
    triggerTopCapsuleFeedback()
    closeAllTopPanels()
    setIsSearchPanelOpen(true)
  }

  function openEditPanel() {
    triggerTopCapsuleFeedback()
    closeAllTopPanels()
    setIsEditPanelOpen(true)
  }

  function openCreateGroupPanel() {
    triggerTopCapsuleFeedback()
    closeAllTopPanels()
    setIsCreateGroupOpen(true)
  }

  function toggleGroupMember(memberId: string) {
    setSelectedGroupMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    )
  }

function withTimeout<T>(
  promise: PromiseLike<T>,
  ms = 6000,
  label = 'request'
): Promise<T | null> {
  let timeoutId: number

  return Promise.race([
    Promise.resolve(promise),
    new Promise<null>((resolve) => {
      timeoutId = window.setTimeout(() => {
        console.warn(`${label} timeout`)
        resolve(null)
      }, ms)
    }),
  ]).finally(() => {
    window.clearTimeout(timeoutId)
  })
}

function sortMessageConversations(items: ConversationItem[]) {
  return [...items].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1
    }

    if (a.isPinned && b.isPinned) {
      return (
        new Date(b.pinnedAt ?? 0).getTime() -
        new Date(a.pinnedAt ?? 0).getTime()
      )
    }

    return (
      new Date(b.latestMessageAt ?? 0).getTime() -
      new Date(a.latestMessageAt ?? 0).getTime()
    )
  })
}

async function refreshMessages() {
  if (isRefreshingMessages || messageLoading) return

  setIsRefreshingMessages(true)

  try {
    await withTimeout(
      reloadConversationsRef.current?.() ?? Promise.resolve(),
      9000,
      'message_manual_refresh'
    )
  } finally {
    setIsRefreshingMessages(false)
  }
}

const { pullDistance, pullHandlers } = usePullToRefresh({
  isRefreshing: isRefreshingMessages,
  disabled: messageLoading,
  onRefresh: refreshMessages,
  getScrollTop: () => messageScrollRef.current?.scrollTop ?? 0,
  threshold: 110,
})

  useEffect(() => {
  async function loadConversations(retry = 0) {
    let keepLoadingForRetry = false

    try {
    setMessageLoading(true)
setMessageError('')
    const session = await withTimeout(
      getCachedSession(),
      6000,
      'message_session'
    )

const user = session?.user

if (!user) {
  setMessageLoading(false)
  return
}

    const conversationsResult = await withTimeout(
      supabase
        .from('conversations')
        .select(`
  id,
  user_a,
  user_b
`)
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
      6000,
      'message_conversations'
    )

    const data = conversationsResult?.data
    const error = conversationsResult?.error

    if (!conversationsResult || error) {
  console.error('讀取 conversations 失敗:', error)

  if (retry < 1) {
    keepLoadingForRetry = true

    window.setTimeout(() => {
      loadConversations(retry + 1)
    }, 600)

    return
  }

  setMessageError('訊息讀取失敗，請重新載入')
  setMessageLoading(false)
  return
}

const validConversations = (data ?? []).filter((conversation: any) => {
  return conversation.user_a !== user.id || conversation.user_b !== user.id
})

const conversationIds = validConversations.map((conversation: any) => conversation.id)

    const otherUserIds = validConversations.map((conversation: any) =>
  conversation.user_a === user.id
    ? conversation.user_b
    : conversation.user_a
)

const settingsResult =
  conversationIds.length > 0
    ? await withTimeout(
        supabase
          .from('message_conversation_settings')
          .select(
            'conversation_id, is_pinned, is_hidden, pinned_at, hidden_at'
          )
          .eq('user_id', user.id)
          .in('conversation_id', conversationIds),
        6000,
        'message_conversation_settings'
      )
    : null

const settingsMap = new Map(
  (settingsResult?.data ?? []).map((setting: any) => [
    setting.conversation_id,
    setting,
  ])
)

const profilesResult =
  otherUserIds.length > 0
    ? await withTimeout(
        supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', otherUserIds),
        6000,
        'message_profiles'
      )
    : null

const profilesData = profilesResult?.data ?? []

const profileMap = new Map(
  (profilesData ?? []).map((profile: any) => [profile.id, profile])
)

const mapped = validConversations.map((conversation: any) => {
  const otherUserId =
    conversation.user_a === user.id
      ? conversation.user_b
      : conversation.user_a

  const latestMessage =
    null as { text?: string; created_at?: string } | null

  const profile = profileMap.get(otherUserId) as any
  const setting = settingsMap.get(conversation.id) as any

  return {
    id: conversation.id,
    otherUserId,
    name:
      profile?.display_name ||
      profile?.username ||
      'Vibelink User',
    avatarUrl: profile?.avatar_url || '',
    lastMessage: latestMessage?.text ?? '',
    latestMessageAt: latestMessage?.created_at ?? null,
    isPinned: Boolean(setting?.is_pinned),
    isHidden: Boolean(setting?.is_hidden),
    pinnedAt: setting?.pinned_at ?? null,
    hiddenAt: setting?.hidden_at ?? null,
  }
})

    const conversationMap = new Map<string, ConversationItem>()

mapped.forEach((conversation) => {
  const key = conversation.name

  if (!conversationMap.has(key)) {
    conversationMap.set(key, conversation)
  }
})

setConversations(
  sortMessageConversations(
    Array.from(conversationMap.values()).filter(
      (conversation) => !conversation.isHidden
    )
  )
)
const preloadChats = Array.from(conversationMap.values()).slice(0, 3)

window.setTimeout(() => {
  preloadChats.forEach(async (chat) => {
    try {
      await withTimeout(
        supabase
          .from('chat_messages')
          .select('id')
          .eq('conversation_id', chat.id)
          .limit(8),
        6000,
        'message_chat_preload'
      )
    } catch (err) {
      console.warn('chat preload failed', err)
    }
  })
}, 900)

    } catch (err) {
      console.warn('load conversations failed:', err)
      setMessageError('訊息讀取失敗，請重新載入')
    } finally {
      if (!keepLoadingForRetry) {
        setMessageLoading(false)
      }
    }
  }

  reloadConversationsRef.current = () => loadConversations(0)
  loadConversations()
  window.setTimeout(async () => {
  try {
    const userResult = await withTimeout(
      supabase.auth.getUser(),
      6000,
      'message_warm_people_user'
    )
    const user = userResult?.data.user

    if (!user) return

    const followsResult = await withTimeout(
      supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)
        .limit(12),
      6000,
      'message_warm_people_follows'
    )

    setPeopleLibraryWarmUsers(followsResult?.data ?? [])
  } catch (err) {
    console.warn('People Library warmup failed', err)
  }
}, 1200)

window.setTimeout(async () => {
  try {
    const userResult = await withTimeout(
      supabase.auth.getUser(),
      6000,
      'message_warm_profile_user'
    )
    const user = userResult?.data.user

    if (!user) return

    await withTimeout(
      supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio')
        .eq('id', user.id)
        .maybeSingle(),
      6000,
      'message_warm_profile'
    )

    const postsResult = await withTimeout(
      supabase
        .from('posts')
        .select(`
        id,
        post_images (
          image_url
        )
      `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(9),
      6000,
      'message_warm_posts'
    )

    const postsData = postsResult?.data

    const images =
      postsData
        ?.flatMap((post: any) =>
          post.post_images?.map((img: any) => img.image_url) ?? []
        )
        .filter(Boolean)
        .slice(0, 12) ?? []

    setMyProfileWarmImages(images)
  } catch (err) {
    console.warn('My profile warmup failed', err)
  }
}, 1600)
}, [])

useEffect(() => {
  if (!isSearchPanelOpen) return

  async function loadFollowingUsers() {
    setIsSearchingAccounts(true)

    const searchUserResult = await withTimeout(
      supabase.auth.getUser(),
      6000,
      'message_search_user'
    )

    const user = searchUserResult?.data.user

    if (!user) {
      setSearchAccounts([])
      setIsSearchingAccounts(false)
      return
    }

    const followsResult = await withTimeout(
      supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id),
      6000,
      'message_search_follows'
    )

    const followsData = followsResult?.data
    const followsError = followsResult?.error

    if (!followsResult || followsError) {
      console.error('讀取追蹤用戶失敗:', followsError)
      setSearchAccounts([])
      setIsSearchingAccounts(false)
      return
    }

    const followingIds =
      followsData?.map((item: any) => item.following_id) ?? []

    if (followingIds.length === 0) {
      setSearchAccounts([])
      setIsSearchingAccounts(false)
      return
    }

    const profilesResult = await withTimeout(
      supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio')
        .in('id', followingIds),
      6000,
      'message_search_profiles'
    )

    const profilesData = profilesResult?.data
    const profilesError = profilesResult?.error

    if (!profilesResult || profilesError) {
      console.error('讀取 profiles 失敗:', profilesError)
      setSearchAccounts([])
      setIsSearchingAccounts(false)
      return
    }

    const mapped =
      profilesData?.map((profile: any) => ({
        id: profile.id,
        name:
          profile.display_name ||
          profile.username ||
          'Vibelink User',
        sub:
          profile.bio ||
          (locale === 'en'
            ? 'Following user'
            : '已追蹤的使用者'),
        avatarUrl: profile.avatar_url || '',
      })) ?? []

    setSearchAccounts(mapped)
    setIsSearchingAccounts(false)
  }

  loadFollowingUsers()
    .catch((err) => {
      console.warn('load following users failed:', err)
      setSearchAccounts([])
    })
    .finally(() => {
      setIsSearchingAccounts(false)
    })
}, [isSearchPanelOpen, locale])

async function toggleConversationPin(conversation: ConversationItem) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const shouldPin = !conversation.isPinned
  const now = new Date().toISOString()
  let previousConversations: ConversationItem[] = []

  setConversations((prev) => {
    previousConversations = prev

    return sortMessageConversations(
      prev.map((item) =>
        item.id === conversation.id
          ? {
              ...item,
              isPinned: shouldPin,
              pinnedAt: shouldPin ? now : null,
            }
          : item
      )
    )
  })

  const { error } = await supabase
    .from('message_conversation_settings')
    .upsert(
      {
        user_id: user.id,
        conversation_id: conversation.id,
        is_pinned: shouldPin,
        is_hidden: conversation.isHidden ?? false,
        pinned_at: shouldPin ? now : null,
        hidden_at: conversation.hiddenAt ?? null,
        updated_at: now,
      },
      { onConflict: 'user_id,conversation_id' }
    )

  if (error) {
    console.error('toggle conversation pin failed:', error)
    setConversations(previousConversations)
  }
}

  function handleMessageScroll(e: React.UIEvent<HTMLDivElement>) {
    const currentY = e.currentTarget.scrollTop
    const lastY = lastScrollYRef.current

    if (currentY > lastY + 8 && currentY > 40) {
      setIsTopBarHidden(true)
    }

    if (currentY < lastY - 8) {
      setIsTopBarHidden(false)
    }

    lastScrollYRef.current = currentY
  }

  return (
  <>
    <div className="hidden">
      {myProfileWarmImages.map((src) => (
        <img
          key={`my-profile-warm-${src}`}
          src={src}
          alt=""
          loading="eager"
          decoding="async"
        />
      ))}
    </div>

    <div
  ref={messageScrollRef}
  onScroll={handleMessageScroll}
  {...pullHandlers}
  className="relative flex h-screen flex-col overflow-y-auto bg-[var(--app-bg)] px-4 pt-4 pb-2 text-[var(--app-text)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
>
  {(isRefreshingMessages || pullDistance > 0) && (
    <div
      className="pointer-events-none sticky top-0 z-[120] mb-2 flex h-8 justify-center"
      style={{
        opacity: isRefreshingMessages ? 1 : Math.min(pullDistance / 110, 1),
        transform: `translateY(${Math.min(pullDistance * 0.35, 36)}px)`,
      }}
    >
      <div
        className={`h-6 w-6 rounded-full border-2 text-[var(--app-text)] ${
          isRefreshingMessages ? 'animate-spin' : ''
        }`}
        style={{
          borderColor: 'color-mix(in srgb, currentColor 22%, transparent)',
          borderTopColor: 'currentColor',
          transform: isRefreshingMessages
            ? undefined
            : `rotate(${Math.min(pullDistance * 3, 300)}deg)`,
        }}
      />
    </div>
  )}

  <AnimatePresence>
    {isPinEditMode && (
      <motion.button
  type="button"
  onClick={() => setIsPinEditMode(false)}
  initial={{ x: '-50%', y: -28, opacity: 0 }}
  animate={{ x: '-50%', y: 0, opacity: 1 }}
  exit={{ x: '-50%', y: -28, opacity: 0 }}
  whileTap={{ scale: 0.96 }}
  transition={{
    type: 'spring',
    stiffness: 420,
    damping: 30,
  }}
  className="fixed left-1/2 top-[77px] z-[150] flex h-[54px] min-w-[168px] items-center justify-center rounded-full bg-[#c893cf] px-8 text-[24px] font-medium leading-none text-white"
>
  釘選完成
</motion.button>
    )}
  </AnimatePresence>

      <div className="relative flex-1 px-0 pb-4 pt-[70px]">
        <div
          className={`fixed left-1/2 top-0 z-[100] w-full max-w-[430px] -translate-x-1/2 bg-[var(--app-bg)]/95 px-4 pt-4 pb-3 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isTopBarHidden ? '-translate-y-full' : 'translate-y-0'
          }`}
        >
          <div className="flex items-center justify-between">
  <div className="rounded-full border border-[var(--app-card-border)] bg-[var(--app-card)] p-[8px]">
  <button
    type="button"
    onClick={() => {
      closeAllTopPanels()
      setIsPeopleLibraryOpen(true)
    }}
    className="flex min-w-[150px] items-center justify-center gap-2 rounded-full bg-[var(--app-card)] px-5 py-[8px] text-[var(--app-text)] transition active:scale-[0.96]"
    
  >
    <UserRound size={22} strokeWidth={2.3} />

    <span className="text-[15px] font-medium text-[var(--app-text)]">
      People Library
    </span>
    </button>
</div>

  <div
  className="flex items-center gap-5 px-1 py-[2px] transition"

>
    <button
      type="button"
      onClick={openSearchPanel}
      className="flex h-[26px] w-[26px] items-center justify-center active:scale-95"
    >
      <Search size={22} strokeWidth={2.5} />
    </button>

    <button
      type="button"
      onClick={openEditPanel}
      className="flex h-[26px] w-[26px] items-center justify-center active:scale-95"
    >
      <PencilLine size={22} strokeWidth={2.5} />
    </button>
  </div>
</div>
        </div>

        {hasAnyTopPanelOpen && (
          <>
            <div
              className="fixed inset-0 z-[60] bg-black/10"
              onClick={closeAllTopPanels}
            />

            <div className="fixed left-1/2 top-[92px] z-[70] w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2">
              <div
                className="animate-[fadeIn_0.2s_ease-out]"
                onClick={(e) => e.stopPropagation()}
              >
                {isSearchPanelOpen && (
                  <div className="overflow-hidden rounded-[30px] border border-[var(--app-card-border)] bg-[var(--app-card)]/95 shadow-[0_14px_30px_rgba(0,0,0,0.14)] backdrop-blur-md">
                    <div className="flex items-center justify-between px-4 pt-4">
                      <div>
                        <div className="text-[18px] font-medium text-[var(--app-text)]">
                          {messageText[locale].searchAccounts}
                        </div>
                        <div className="mt-1 text-[12px] text-[var(--app-muted)]">
                          {messageText[locale].searchAccountsSub}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsSearchPanelOpen(false)}
                        className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[var(--app-surface)] active:scale-95"
                      >
                        <X size={22} strokeWidth={2.4} className="text-[var(--app-text)]" />
                      </button>
                    </div>

                    <div className="p-4 pt-3">
                      <div className="mb-4 flex h-[46px] items-center rounded-full bg-[var(--app-surface)] px-4">
                        <Search
                          size={20}
                          strokeWidth={2.4}
                          className="text-[var(--app-text)]"
                        />
                        <input
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          placeholder={messageText[locale].searchPlaceholder}
                          className="ml-3 w-full bg-transparent text-[15px] text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        {isSearchingAccounts ? (
  <div className="rounded-[20px] bg-[var(--app-surface)] px-4 py-5 text-[14px] text-[var(--app-muted)]">
    搜尋追蹤用戶中...
  </div>
) : filteredAccounts.length > 0 ? (
                          filteredAccounts.map((account) => (
                            <button
  key={account.id}
  type="button"
  onClick={() => {
    setIsSearchPanelOpen(false)
    setSelectedProfileUserId(account.id)
  }}
  className="flex items-center gap-3 rounded-[20px] bg-[var(--app-surface)] px-3 py-3 text-left active:scale-[0.99]"
>
                              <div className="flex h-[46px] w-[46px] items-center justify-center overflow-hidden rounded-full bg-[#d9d9d9]">
  {account.avatarUrl ? (
    <img
      src={account.avatarUrl}
      className="h-full w-full object-cover"
    />
  ) : (
    <UserRound
      size={24}
      strokeWidth={2.1}
      className="text-[var(--app-text)]"
    />
  )}
</div>

                              <div className="flex flex-col">
                                <span className="text-[15px] font-medium text-[var(--app-text)]">
                                  {account.name}
                                </span>
                                <span className="text-[12px] text-[var(--app-muted)]">
                                  {account.sub}
                                </span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="rounded-[20px] bg-[var(--app-surface)] px-4 py-5 text-[14px] text-[var(--app-muted)]">
                            {messageText[locale].noAccount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isEditPanelOpen && (
  <div className="overflow-hidden rounded-[30px] border border-[var(--app-card-border)] bg-[var(--app-card)]/95 shadow-[0_14px_30px_rgba(0,0,0,0.14)] backdrop-blur-md">
    <div className="flex flex-col">
      <button
  type="button"
  onClick={() => {
    setIsPinEditMode((prev) => !prev)
    setIsEditPanelOpen(false)
  }}
  className="flex h-[58px] w-full items-center justify-center text-center text-[16px] font-medium text-[var(--app-text)] active:bg-black/5"
>
  編輯釘選
</button>

      <div className="mx-5 h-px bg-[var(--app-card-border)]" />

      <button
  type="button"
  className="flex h-[58px] w-full items-center justify-center text-center text-[16px] font-medium text-[var(--app-text)] active:bg-black/5"
>
  編輯隱藏
</button>
    </div>
  </div>
)}

              </div>
            </div>
          </>
        )}

{messageLoading && (
  <div className="mb-4 rounded-[22px] bg-[#e9e9e9] px-4 py-4 text-[14px] text-[var(--app-muted)]">
    訊息讀取中...
  </div>
)}

{messageError && !messageLoading && (
  <div className="mb-4 rounded-[22px] border border-[var(--app-card-border)] bg-[var(--app-card)] px-4 py-4">
    <div className="mb-3 text-[14px] text-[var(--app-muted)]">
      {messageError}
    </div>

    <button
      type="button"
      onClick={() => {
        setMessageError('')
        setMessageLoading(true)

        window.location.reload()
      }}
      className="rounded-full bg-[#c86cff] px-4 py-2 text-[13px] text-white"
    >
      重新讀取
    </button>
  </div>
)}

        <div className="flex flex-col gap-4 pt-2">
  {conversations.map((conversation) => (
    <button
  key={conversation.id}
  type="button"
  onClick={() => {
    if (isPinEditMode) {
      toggleConversationPin(conversation)
      return
    }

    setOpenedChat(conversation)
  }}
  className="flex items-center gap-4 rounded-[24px] px-1 py-2 text-left active:scale-[0.99]"
>
      <div className="h-[58px] w-[58px] overflow-hidden rounded-full bg-[var(--app-card)]">
        {conversation.avatarUrl && (
          <img
            src={conversation.avatarUrl}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-medium text-[var(--app-text)]">
          {conversation.name}
        </div>

        <div className="mt-1 truncate text-[13px] text-[var(--app-muted)]">
          {conversation.lastMessage || '開始聊天'}
        </div>
      </div>
      {(isPinEditMode || conversation.isPinned) && (
  <span
    role="button"
    tabIndex={0}
    onClick={(e) => {
      e.stopPropagation()
      toggleConversationPin(conversation)
    }}
    className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium active:scale-95 ${
      conversation.isPinned
        ? 'bg-[#c86cff] text-white'
        : 'bg-[var(--app-card)] text-[var(--app-muted)]'
    }`}
  >
    {conversation.isPinned ? '已釘選' : '釘選'}
  </span>
)}

    </button>
  ))}
</div>
      </div>

      {isPeopleLibraryOpen && (
        <PeopleLibraryPage
  query="People Library"
    locale={locale}
  onClose={() => setIsPeopleLibraryOpen(false)}
  onOpenProfile={(userId) => {
  console.log('MessagePage receive open profile:', userId)

  setIsPeopleLibraryOpen(false)

  requestAnimationFrame(() => {
    setSelectedProfileUserId(userId)
  })
}}
/>
      )}
      <AnimatePresence mode="wait">
  {selectedProfileUserId && (
    <OtherUserProfilePage
  userId={selectedProfileUserId}
  onClose={() => setSelectedProfileUserId(null)}
  locale={locale}
/>
  )}
</AnimatePresence>
  {openedChat && (
  <ChatRoomPage
    otherUserId={openedChat.otherUserId}
    userName={openedChat.name}
    userAvatar={openedChat.avatarUrl}
    onClose={() => setOpenedChat(null)}
  />
)}
        </div>
  </>
  )
}
