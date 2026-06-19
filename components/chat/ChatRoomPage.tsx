'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion'
import { ChevronLeft, Image as ImageIcon, ArrowUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { uiText } from '@/lib/uiText'
import OtherUserProfilePage from '@/components/profile/OtherUserProfilePage'
import type { Locale } from '@/i18n'

type Props = {
  otherUserId: string
  userName?: string
  userAvatar?: string
  locale?: Locale
  onClose: () => void
}

type MessageItem = {
  id: string
  text: string
  mine?: boolean
  recalled?: boolean
}

type ChatRoomCacheEntry = {
  messages: MessageItem[]
  resolvedAvatar: string
}

const chatRoomCache = new Map<string, ChatRoomCacheEntry>()

function getChatRoomCacheKey(userId: string, roomId: string) {
  return `${userId}:${roomId}`
}

export default function ChatRoomPage({
  otherUserId,
  userName = '(用戶名)',
  userAvatar,
  locale = 'zh-TW',
  onClose,
}: Props) {
  console.log('🔥 ChatRoomPage realtime version mounted')
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [chatLoading, setChatLoading] = useState(true)
  const [chatError, setChatError] = useState('')
  const [input, setInput] = useState('')
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [resolvedAvatar, setResolvedAvatar] = useState(userAvatar || '')
  const [isOtherTyping, setIsOtherTyping] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const typingTimeoutRef = useRef<number | null>(null)
const otherTypingTimeoutRef = useRef<number | null>(null)
const realtimeChannelRef = useRef<any>(null)

  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)

  const dragX = useMotionValue(0)
  const pageOpacity = useTransform(dragX, [0, 260], [1, 0.65])
  const pageScale = useTransform(dragX, [0, 260], [1, 0.96])

  const hasInput = input.trim().length > 0

  useEffect(() => {
    setMounted(true)
    dragX.set(window.innerWidth)

    animate(dragX, 0, {
      type: 'spring',
      stiffness: 360,
      damping: 34,
    })
  }, [dragX])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messages, isOtherTyping])

  function withTimeout<T>(
    promise: PromiseLike<T>,
    ms = 10000,
    label = 'request'
  ): Promise<T | null> {
    return Promise.race([
      Promise.resolve(promise),
      new Promise<null>((resolve) => {
        window.setTimeout(() => {
          console.warn(`${label} timeout`)
          resolve(null)
        }, ms)
      }),
    ])
  }

  function delay(ms: number) {
    return new Promise((resolve) => window.setTimeout(resolve, ms))
  }

  useEffect(() => {
    let cancelled = false

    async function loadOtherUserProfile() {
      if (!otherUserId) return

      const result = await withTimeout(
        supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', otherUserId)
          .maybeSingle(),
        10000,
        'chat_other_avatar'
      )

      const data = result?.data

      if (!cancelled && data?.avatar_url) {
        setResolvedAvatar(data.avatar_url)
      }
    }

    async function initConversation() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !otherUserId) {
        if (!cancelled) setChatLoading(false)
        return
      }

      if (!cancelled) setCurrentUserId(user.id)

      const sortedUsers = [user.id, otherUserId].sort()

      let { data: conversation, error: findError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_a', sortedUsers[0])
        .eq('user_b', sortedUsers[1])
        .maybeSingle()

      if (findError) {
        console.error('讀取 conversation 失敗:', findError)
        setChatError(uiText('聊天室讀取失敗', 'Failed to load chat'))
        setChatLoading(false)
        return
      }

      if (!conversation) {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            user_a: sortedUsers[0],
            user_b: sortedUsers[1],
          })
          .select()
          .single()

        if (createError) {
          console.error('建立 conversation 失敗:', createError)
          setChatError(uiText('聊天室建立失敗', 'Failed to create chat'))
          setChatLoading(false)
          return
        }

        conversation = newConversation
      }

      if (!conversation) {
        setChatError(uiText('找不到聊天室', 'Chat not found'))
        setChatLoading(false)
        return
      }

      if (cancelled) return

      setConversationId(conversation.id)

      const cacheKey = getChatRoomCacheKey(user.id, conversation.id)
      const cachedRoom = chatRoomCache.get(cacheKey)

      if (cachedRoom) {
        setMessages(cachedRoom.messages)
        setResolvedAvatar(cachedRoom.resolvedAvatar || userAvatar || '')
        setChatError('')
        setChatLoading(false)
      }

      const { data: messageRows, error: messageError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true })

      if (messageError) {
        if (cachedRoom) return
        console.error('讀取聊天訊息失敗:', messageError)
        setChatError(uiText('聊天室讀取失敗', 'Failed to load chat'))
        setChatLoading(false)
        return
      }

      setMessages(
        (messageRows ?? []).map((msg) => ({
          id: msg.id,
          text: msg.recalled ? '已收回訊息' : msg.text,
          mine: msg.sender_id === user.id,
          recalled: msg.recalled,
        }))
      )

      chatRoomCache.set(cacheKey, {
        messages: (messageRows ?? []).map((msg) => ({
          id: msg.id,
          text: msg.recalled ? 'Message recalled' : msg.text,
          mine: msg.sender_id === user.id,
          recalled: msg.recalled,
        })),
        resolvedAvatar,
      })

      if (cancelled) return

      setChatLoading(false)
    }

    async function initChatRoom() {
      await initConversation()
      await delay(600)
      await loadOtherUserProfile()
    }

    initChatRoom()

    return () => {
      cancelled = true
    }
  }, [otherUserId])

  useEffect(() => {
  if (!conversationId || !currentUserId) {
    console.log('🟡 realtime skipped:', {
      conversationId,
      currentUserId,
    })
    return
  }

  console.log('🟣 realtime init:', {
    conversationId,
    currentUserId,
    otherUserId,
  })

  const channel: any = supabase.channel(`chat-room-${conversationId}`, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    })

    realtimeChannelRef.current = channel

    channel
            .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: any) => {
                    console.log('📩 realtime payload:', payload)

          const eventType = payload.eventType
          const row: any = payload.new
          const oldRow: any = payload.old

          if (eventType === 'INSERT') {
            if (!row) return

            if (row.sender_id === currentUserId) {
              console.log('📩 skip my own realtime message')
              return
            }

            console.log('📩 receive other message:', row)

            setIsOtherTyping(false)

if (otherTypingTimeoutRef.current) {
  window.clearTimeout(otherTypingTimeoutRef.current)
  otherTypingTimeoutRef.current = null
}

setMessages((prev) => {
              if (prev.some((msg) => msg.id === row.id)) return prev

              return [
                ...prev,
                {
                  id: row.id,
                  text: row.recalled ? '已收回訊息' : row.text,
                  mine: false,
                  recalled: row.recalled,
                },
              ]
            })

            return
          }

          if (eventType === 'UPDATE') {
            if (!row) return

            console.log('♻️ realtime update message:', row)

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === row.id
                  ? {
                      ...msg,
                      text: row.recalled ? '已收回訊息' : row.text,
                      recalled: row.recalled,
                    }
                  : msg
              )
            )

            return
          }

          if (eventType === 'DELETE') {
            const deletedId = oldRow?.id

            if (!deletedId) return

            console.log('🗑️ realtime delete message:', deletedId)

            setMessages((prev) => prev.filter((msg) => msg.id !== deletedId))
          }
        }
      )
                  .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()

        console.log('🟠 presence sync state:', state)

                const otherTyping = Object.values(state)
          .flat()
          .some((presence: any) => {
            return presence?.user_id === otherUserId && presence?.typing === true
          })

        setIsOtherTyping(otherTyping)

        if (otherTypingTimeoutRef.current) {
          window.clearTimeout(otherTypingTimeoutRef.current)
          otherTypingTimeoutRef.current = null
        }

        if (otherTyping) {
          otherTypingTimeoutRef.current = window.setTimeout(() => {
            setIsOtherTyping(false)
            otherTypingTimeoutRef.current = null
          }, 1800)
        }
      })
      .on('presence', { event: 'track' }, ({ key, newPresences }: any) => {
        console.log('⌨️ presence track:', {
          key,
          newPresences,
          otherUserId,
        })

                const otherTyping = newPresences.some((presence: any) => {
          return presence?.user_id === otherUserId && presence?.typing === true
        })

        setIsOtherTyping(otherTyping)

        if (otherTypingTimeoutRef.current) {
          window.clearTimeout(otherTypingTimeoutRef.current)
          otherTypingTimeoutRef.current = null
        }

        if (otherTyping) {
          otherTypingTimeoutRef.current = window.setTimeout(() => {
            setIsOtherTyping(false)
            otherTypingTimeoutRef.current = null
          }, 1800)
        }
      })
      .on('presence', { event: 'untrack' }, ({ key, leftPresences }: any) => {
        console.log('⌨️ presence untrack:', {
          key,
          leftPresences,
        })

        const leftOther = leftPresences.some((presence: any) => {
          return presence?.user_id === otherUserId
        })

        if (leftOther) {
          setIsOtherTyping(false)
        }
      })
            .subscribe(async (status: any) => {
        console.log('🟢 realtime status:', status)

        if (status === 'SUBSCRIBED') {
          console.log('🟢 realtime subscribed')

          await channel.track({
            user_id: currentUserId,
            typing: false,
          })
        }
      })

    return () => {
  if (typingTimeoutRef.current) {
    window.clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = null
  }

  if (otherTypingTimeoutRef.current) {
    window.clearTimeout(otherTypingTimeoutRef.current)
    otherTypingTimeoutRef.current = null
  }

  setIsOtherTyping(false)

  channel.untrack()
  supabase.removeChannel(channel)
  realtimeChannelRef.current = null
}
  }, [conversationId, currentUserId, otherUserId])

    async function updateTypingPresence(typing: boolean) {
    if (!realtimeChannelRef.current || !currentUserId) {
      console.log('🔴 typing skipped:', {
        hasChannel: !!realtimeChannelRef.current,
        currentUserId,
        typing,
      })
      return
    }

    console.log('⌨️ typing track:', {
      currentUserId,
      typing,
    })

    await realtimeChannelRef.current.track({
      user_id: currentUserId,
      typing,
    })
  }

  function handleInputChange(value: string) {
    setInput(value)

    updateTypingPresence(value.trim().length > 0)

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      updateTypingPresence(false)
    }, 1200)
  }

  function closeWithAnimation() {
    animate(dragX, window.innerWidth, {
      type: 'spring',
      stiffness: 360,
      damping: 34,
      onComplete: onClose,
    })
  }

  async function handleSend() {
    const text = input.trim()

    if (!text || !conversationId) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    updateTypingPresence(false)

    const tempId = crypto.randomUUID()

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        text,
        mine: true,
      },
    ])

    setInput('')

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        receiver_id: otherUserId,
        text,
      })
      .select()
      .single()

    if (error || !data) {
      console.error('送出訊息失敗:', error)
      return
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === tempId
          ? {
              ...msg,
              id: data.id,
            }
          : msg
      )
    )
  }

  async function handleRecallMessage(messageId: string) {
    await supabase
      .from('chat_messages')
      .update({
        recalled: true,
        text: '',
      })
      .eq('id', messageId)

    setMessages((prev) => prev.filter((message) => message.id !== messageId))

    setSelectedMessageId(null)
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartXRef.current = e.touches[0].clientX
    touchStartYRef.current = e.touches[0].clientY
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const startX = touchStartXRef.current
    const startY = touchStartYRef.current

    if (startX == null || startY == null) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    if (deltaX > 0 && Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault()
      dragX.set(deltaX)
    }
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    const startX = touchStartXRef.current
    if (startX == null) return

    const deltaX = e.changedTouches[0].clientX - startX

    if (deltaX > 90) {
      closeWithAnimation()
    } else {
      animate(dragX, 0, {
        type: 'spring',
        stiffness: 360,
        damping: 34,
      })
    }

    touchStartXRef.current = null
    touchStartYRef.current = null
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999999] bg-[var(--app-bg)] text-[var(--app-text)]"
        style={{
          x: dragX,
          opacity: pageOpacity,
          scale: pageScale,
          touchAction: 'pan-y',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-[var(--app-bg)]">
          <div className="flex h-[56px] items-center gap-3 border-b border-[var(--app-card-border)] bg-[var(--app-card)] px-3">
            <button
              type="button"
              onClick={closeWithAnimation}
              className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-[var(--app-text)] active:scale-90"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 rounded-full px-1 py-1 active:scale-[0.97]"
            >
              <div className="h-[34px] w-[34px] overflow-hidden rounded-full bg-[#d49be0]">
                {resolvedAvatar ? (
                  <img src={resolvedAvatar} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[14px] font-semibold text-white">
                    {userName.slice(0, 1)}
                  </div>
                )}
              </div>

              <div className="text-[15px] font-medium text-[var(--app-text)]">
                {userName}
              </div>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            {chatLoading && (
              <div className="pb-4 text-center text-[14px] text-[var(--app-muted)]">
                {uiText('聊天室讀取中...', 'Loading chat...')}
              </div>
            )}

            {chatError && !chatLoading && (
              <div className="pb-4 text-center">
                <div className="mb-3 text-[14px] text-[var(--app-muted)]">
                  {chatError}
                </div>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="rounded-full bg-[#c86cff] px-4 py-2 text-[13px] text-white"
                >
                  {uiText('重新讀取', 'Retry')}
                </button>
              </div>
            )}

            <div className="flex min-h-full flex-col justify-end gap-3">
              <AnimatePresence initial={false}>
                {messages
                  .filter((message) => !message.recalled)
                  .map((message) => (
                    <motion.div
                      key={message.id}
                      layout
                      initial={{
                        opacity: 0,
                        y: 14,
                        scale: 0.92,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.92,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 520,
                        damping: 34,
                        mass: 0.7,
                      }}
                      className={`relative flex ${
                        message.mine ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        onContextMenu={(e) => {
                          e.preventDefault()

                          if (message.mine && !message.recalled) {
                            setSelectedMessageId(message.id)
                          }
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation()

                          if (!message.mine || message.recalled) return

                          const timer = window.setTimeout(() => {
                            setSelectedMessageId(message.id)
                          }, 520)

                          const clear = () => {
                            window.clearTimeout(timer)
                            window.removeEventListener('touchend', clear)
                            window.removeEventListener('touchmove', clear)
                          }

                          window.addEventListener('touchend', clear)
                          window.addEventListener('touchmove', clear)
                        }}
                        onTouchMove={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                        className={`inline-block min-w-[54px] max-w-[72%] rounded-[16px] px-4 py-3 text-left text-[15px] leading-[1.4] shadow-sm ${
                          message.mine
                            ? 'bg-[#ead3f5] text-[#222]'
                            : 'bg-[var(--app-card)] text-[var(--app-text)]'
                        } ${message.recalled ? 'text-[var(--app-muted)]' : ''}`}
                      >
                        {message.text}
                      </div>

                      {selectedMessageId === message.id &&
                        message.mine &&
                        !message.recalled && (
                          <div className="absolute right-0 top-[-44px] z-[20] rounded-[16px] border border-[var(--app-card-border)] bg-[var(--app-surface)] px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.16)]">
                            <button
                              type="button"
                              onClick={() => handleRecallMessage(message.id)}
                              className="text-[14px] font-medium text-red-500"
                            >
                              收回
                            </button>
                          </div>
                        )}
                    </motion.div>
                  ))}

                {isOtherTyping && (
                  <motion.div
                    key="typing-indicator"
                    initial={{
                      opacity: 0,
                      y: 12,
                      scale: 0.92,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: 6,
                      scale: 0.92,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 520,
                      damping: 34,
                    }}
                    className="flex justify-start"
                  >
                    <div className="flex h-[42px] items-center gap-1 rounded-[16px] bg-[var(--app-card)] px-4 shadow-sm">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-[7px] w-[7px] rounded-full bg-[var(--app-muted)]"
                          animate={{
                            y: [0, -5, 0],
                            opacity: [0.35, 1, 0.35],
                          }}
                          transition={{
                            duration: 0.72,
                            repeat: Infinity,
                            delay: i * 0.14,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>
          </div>

          <div
            className="border-t border-[var(--app-card-border)] bg-[var(--app-bg)] px-3 py-3"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 rounded-full border border-[var(--app-card-border)] bg-[var(--app-surface)] px-3 py-2 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
              <button
                type="button"
                className="flex h-[38px] w-[38px] items-center justify-center rounded-full text-[var(--app-text)] active:scale-90"
              >
                <ImageIcon size={22} strokeWidth={2.2} />
              </button>

              <input
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSend()
                  }
                }}
                placeholder={uiText('訊息', 'Message')}
                className="flex-1 bg-transparent text-[15px] text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={!hasInput}
                className={`flex h-[36px] w-[36px] items-center justify-center rounded-full active:scale-90 ${
                  hasInput
                    ? 'bg-[#c86cff] text-white'
                    : 'bg-transparent text-[var(--app-text)]'
                }`}
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {isProfileOpen && (
          <OtherUserProfilePage
            userId={otherUserId}
            onClose={() => setIsProfileOpen(false)}
            locale={locale}
            onOpenChat={() => setIsProfileOpen(false)}
          />
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
