'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronLeft, Heart, MessageCircle, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { getUiLocale } from '@/lib/uiText'

type Props = {
  onClose: () => void
  onOpenProfile?: (userId: string) => void
  onOpenPost?: (postId: string) => void
  onOpenShortVideo?: (shortVideoId: string) => void
  onUnreadCountChange?: (count: number) => void
}

type NotificationItem = {
  id: string
  type: 'like' | 'comment' | 'follow'
  title: string
  body: string | null
  is_read: boolean
  created_at: string
  actor_user_id: string | null
  post_id?: string | null
  short_video_id?: string | null
  actor_username?: string | null
  actor_display_name?: string | null
  actor_avatar_url?: string | null
}

const NOTIFICATIONS_TIMEOUT_MS = 4500
const notificationsCache = new Map<string, NotificationItem[]>()
const notificationsInFlight = new Map<string, Promise<NotificationItem[]>>()

const notificationText = {
  'zh-TW': {
    title: '通知',
    loading: '載入通知中...',
    emptyTitle: '目前沒有通知',
    emptyDescription: '新的追蹤、按讚、留言與互動通知之後會顯示在這裡。',
    loadError: '通知載入逾時或暫時失敗，請稍後再試。',
    retry: '重新載入',
    justNow: '剛剛',
    minutesAgo: (minutes: number) => `${minutes} 分鐘前`,
    hoursAgo: (hours: number) => `${hours} 小時前`,
    daysAgo: (days: number) => `${days} 天前`,
    dateLocale: 'zh-TW',
    likePost: (name: string) => `${name} 按讚了你的貼文`,
    commentPost: (name: string) => `${name} 留言了你的貼文`,
    follow: (name: string) => `${name} 開始追蹤你`,
  },
  en: {
    title: 'Notifications',
    loading: 'Loading notifications...',
    emptyTitle: 'No notifications yet',
    emptyDescription: 'New follows, likes, comments, and interactions will appear here.',
    loadError: 'Notifications timed out or failed temporarily. Please try again later.',
    retry: 'Reload',
    justNow: 'Just now',
    minutesAgo: (minutes: number) => `${minutes}m ago`,
    hoursAgo: (hours: number) => `${hours}h ago`,
    daysAgo: (days: number) => `${days}d ago`,
    dateLocale: 'en-US',
    likePost: (name: string) => `${name} liked your post`,
    commentPost: (name: string) => `${name} commented on your post`,
    follow: (name: string) => `${name} started following you`,
  },
} as const

function withNotificationsTimeout<T>(
  promise: PromiseLike<T>,
  label: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} timeout`))
      }, NOTIFICATIONS_TIMEOUT_MS)
    }),
  ]).finally(() => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
  })
}

async function getCurrentNotificationUserId() {
  const {
    data: { user },
  } = await withNotificationsTimeout(
    supabase.auth.getUser(),
    'notifications_auth_user'
  )

  return user?.id ?? null
}

async function fetchNotificationsForUser(userId: string) {
  const inFlight = notificationsInFlight.get(userId)

  if (inFlight) return inFlight

  const request = withNotificationsTimeout(
    supabase
      .from('notifications_with_profiles')
      .select(`
        id,
        type,
        title,
        body,
        is_read,
        created_at,
        actor_user_id,
        post_id,
        short_video_id,
        actor_username,
        actor_display_name,
        actor_avatar_url
      `)
      .eq('recipient_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    'notifications_query'
  )
    .then(({ data, error }) => {
      if (error) throw error

      const notifications = (data ?? []) as NotificationItem[]
      notificationsCache.set(userId, notifications)

      return notifications
    })
    .finally(() => {
      notificationsInFlight.delete(userId)
    })

  notificationsInFlight.set(userId, request)

  return request
}

export async function preloadNotificationsPageData(userId?: string | null) {
  const resolvedUserId = userId ?? (await getCurrentNotificationUserId())

  if (!resolvedUserId) return

  await fetchNotificationsForUser(resolvedUserId)
}

function getNotificationIcon(type: NotificationItem['type']) {
  if (type === 'like') return <Heart size={22} strokeWidth={2.2} />
  if (type === 'comment') return <MessageCircle size={22} strokeWidth={2.2} />
  return <UserPlus size={22} strokeWidth={2.2} />
}

function formatTime(
  createdAt: string,
  text: (typeof notificationText)['zh-TW'] | (typeof notificationText)['en']
) {
  const time = new Date(createdAt).getTime()
  const diff = Date.now() - time
  const minutes = Math.floor(diff / 1000 / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return text.justNow
  if (minutes < 60) return text.minutesAgo(minutes)
  if (hours < 24) return text.hoursAgo(hours)
  if (days < 7) return text.daysAgo(days)

  return new Date(createdAt).toLocaleDateString(text.dateLocale)
}

function getNotificationTitle(
  item: NotificationItem,
  text: (typeof notificationText)['zh-TW'] | (typeof notificationText)['en']
) {
  const name = item.actor_display_name || item.actor_username || 'Vibelink User'

  if (item.type === 'like') return text.likePost(name)
  if (item.type === 'comment') return text.commentPost(name)
  return text.follow(name)
}
export default function NotificationsPage({
  onClose,
  onOpenProfile,
  onOpenPost,
onOpenShortVideo,
  onUnreadCountChange,
}: Props) {
  const text = notificationText[getUiLocale()]
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const requestIdRef = useRef(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    let cancelled = false
    mountedRef.current = true

    loadNotifications(() => cancelled)

    return () => {
      cancelled = true
      mountedRef.current = false
      requestIdRef.current += 1
    }
  }, [])

  async function loadNotifications(isCancelled = () => !mountedRef.current) {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    const isStale = () => isCancelled() || requestId !== requestIdRef.current
    let hasCache = false

    try {
      if (isStale()) return
      setLoadError(false)

      const userId = await getCurrentNotificationUserId()

      if (isStale()) return

      if (!userId) {
        setItems([])
        return
      }

      const cachedNotifications = notificationsCache.get(userId)
      hasCache = Boolean(cachedNotifications)

      if (cachedNotifications) {
        setItems(cachedNotifications)
        setLoading(false)
      } else {
        setLoading(true)
      }

      const notifications = await fetchNotificationsForUser(userId)

      if (isStale()) return

      setItems(notifications)

      const unreadIds = notifications
        .filter((item: NotificationItem) => !item.is_read)
        .map((item: NotificationItem) => item.id)

      void markNotificationsAsRead(unreadIds, userId)
    } catch (error) {
      if (!isStale()) {
        console.warn('load notifications failed:', error)
        if (!hasCache) {
          setItems([])
          setLoadError(true)
        }
      }
    } finally {
      if (!isStale()) {
        setLoading(false)
      }
    }
  }

  async function markNotificationsAsRead(
    notificationIds: string[],
    userId: string
  ) {
    if (notificationIds.length === 0) return

    setItems((prev) =>
      prev.map((item) =>
        notificationIds.includes(item.id)
          ? {
              ...item,
              is_read: true,
            }
          : item
      )
    )
    const cachedNotifications = notificationsCache.get(userId)

    if (cachedNotifications) {
      notificationsCache.set(
        userId,
        cachedNotifications.map((item) =>
          notificationIds.includes(item.id)
            ? {
                ...item,
                is_read: true,
              }
            : item
        )
      )
    }

    onUnreadCountChange?.(0)

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_user_id', userId)
      .in('id', notificationIds)

    if (error) {
      console.warn('mark notifications as read failed:', error)
    }
  }

  function handleOpenNotification(item: NotificationItem) {
    if (
  (item.type === 'like' || item.type === 'comment') &&
  item.short_video_id
) {
  onClose()
  onOpenShortVideo?.(item.short_video_id)
  return
}

    if ((item.type === 'like' || item.type === 'comment') && item.post_id) {
      onClose()
      onOpenPost?.(item.post_id)
      return
    }

    if (item.actor_user_id) {
      onClose()
      onOpenProfile?.(item.actor_user_id)
    }
  }

  return (
    <motion.div
      data-block-page-swipe="true"
      className="fixed inset-0 z-[1200] flex justify-center bg-[var(--app-bg)] text-[var(--app-text)]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{
        type: 'spring',
        stiffness: 360,
        damping: 34,
      }}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative min-h-screen w-full max-w-[430px] bg-[var(--app-bg)] text-[var(--app-text)]">
        <div className="fixed left-1/2 top-0 z-[20] w-full max-w-[430px] -translate-x-1/2 bg-[var(--app-bg)]/95 px-4 pb-3 pt-3 backdrop-blur-md">
          <div className="relative flex h-[40px] items-center justify-center">
            <button
              type="button"
              onClick={onClose}
              className="absolute left-0 flex h-[40px] w-[40px] items-center justify-center rounded-full active:scale-95"
            >
              <ChevronLeft size={24} strokeWidth={2.2} />
            </button>

            <div className="text-[20px] font-medium tracking-[0.02em]">
              {text.title}
            </div>
          </div>
        </div>

        <div className="min-h-screen px-4 pb-[120px] pt-[72px]">
          {loading ? (
            <div className="flex min-h-[70vh] items-center justify-center text-[14px] text-[var(--app-muted)]">
              {text.loading}
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 pb-[120px] text-center">
              <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[var(--app-surface)]">
                <Bell size={34} strokeWidth={2} />
              </div>

              <div className="mt-5 text-[18px] font-medium">
                {text.emptyTitle}
              </div>

              <div className="mt-2 max-w-[260px] text-[14px] leading-relaxed text-[var(--app-muted)]">
                {text.emptyDescription}
              </div>

              {loadError && (
                <>
                  <div className="mt-2 max-w-[260px] text-[14px] leading-relaxed text-[var(--app-muted)]">
                    {text.loadError}
                  </div>

                  <button
                    type="button"
                    onClick={() => loadNotifications()}
                    className="mt-5 rounded-full bg-[var(--app-surface)] px-5 py-2 text-[14px] font-medium text-[var(--app-text)] active:scale-95"
                  >
                    {text.retry}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenNotification(item)}
                  className="flex w-full gap-3 rounded-[20px] bg-[var(--app-surface)] px-4 py-4 text-left active:scale-[0.99]"
                >
                  <div className="relative h-[42px] w-[42px] shrink-0">
                    {item.actor_avatar_url ? (
                      <img
                        src={item.actor_avatar_url}
                        alt="avatar"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--app-card)] text-[#c86cff]">
                        {getNotificationIcon(item.type)}
                      </div>
                    )}

                    <div className="absolute bottom-[-2px] right-[-2px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#c86cff] text-white shadow-md">
                      {getNotificationIcon(item.type)}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-medium text-[var(--app-text)]">
                      {getNotificationTitle(item, text)}
                    </div>

                    {item.body && (
                      <div className="mt-1 text-[13px] leading-relaxed text-[var(--app-muted)]">
                        {item.body}
                      </div>
                    )}

                    <div className="mt-1 text-[12px] text-[var(--app-muted)]">
                      {formatTime(item.created_at, text)}
                    </div>
                  </div>

                  {!item.is_read && (
                    <div className="mt-2 h-[8px] w-[8px] shrink-0 rounded-full bg-[#c86cff]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
