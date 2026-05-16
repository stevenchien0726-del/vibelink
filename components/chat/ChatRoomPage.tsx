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

export default function ChatRoomPage({
  otherUserId,
  userName = '(用戶名)',
  userAvatar,
  locale = 'zh-TW',
  onClose,
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [input, setInput] = useState('')
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

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
    async function initConversation() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !otherUserId) return

      const sortedUsers = [user.id, otherUserId].sort()

      let { data: conversation, error: findError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_a', sortedUsers[0])
        .eq('user_b', sortedUsers[1])
        .maybeSingle()

      if (findError) {
        console.error('讀取 conversation 失敗:', findError)
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
          return
        }

        conversation = newConversation
      }

      if (!conversation) return

      setConversationId(conversation.id)

      const { data: messageRows, error: messageError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true })

      if (messageError) {
        console.error('讀取聊天訊息失敗:', messageError)
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
    }

    initConversation()
  }, [otherUserId])

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

    setMessages((prev) =>
  prev.filter((message) => message.id !== messageId)
)

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
        className="fixed inset-0 z-[999999] bg-[#f3f3f3]"
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
        <div className="mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-[#f3f3f3]">
          <div className="flex h-[56px] items-center gap-3 border-b border-[#dddddd] bg-[#d9d9d9] px-3">
            <button
              type="button"
              onClick={closeWithAnimation}
              className="flex h-[36px] w-[36px] items-center justify-center rounded-full active:scale-90"
            >
              <ChevronLeft size={24} />
            </button>

            <button
  type="button"
  onClick={() => setIsProfileOpen(true)}
  className="flex items-center gap-3 rounded-full px-1 py-1 active:scale-[0.97]"
>
  <div className="h-[34px] w-[34px] overflow-hidden rounded-full bg-[#d49be0]">
    {userAvatar && (
      <img
        src={userAvatar}
        className="h-full w-full object-cover"
      />
    )}
  </div>

  <div className="text-[15px] font-medium text-[#222]">
    {userName}
  </div>
</button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <div className="flex min-h-full flex-col justify-end gap-3">
              
               {messages
  .filter((message) => !message.recalled)
  .map((message) => (
    <div
      key={message.id}
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
                        : 'bg-[#e2e2e2] text-[#222]'
                    } ${message.recalled ? 'text-[#777]' : ''}`}
                  >
                    {message.text}
                  </div>

                  {selectedMessageId === message.id &&
                    message.mine &&
                    !message.recalled && (
                      <div className="absolute right-0 top-[-44px] z-[20] rounded-[16px] bg-white px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.16)]">
                        <button
                          type="button"
                          onClick={() => handleRecallMessage(message.id)}
                          className="text-[14px] font-medium text-red-500"
                        >
                          收回
                        </button>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>

          <div
            className="border-t border-transparent bg-transparent px-3 py-3"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
              <button
                type="button"
                className="flex h-[38px] w-[38px] items-center justify-center rounded-full active:scale-90"
              >
                <ImageIcon size={22} strokeWidth={2.2} />
              </button>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSend()
                  }
                }}
                placeholder="訊息"
                className="flex-1 bg-transparent text-[15px] text-[#222] outline-none placeholder:text-[#777]"
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={!hasInput}
                className={`flex h-[36px] w-[36px] items-center justify-center rounded-full active:scale-90 ${
                  hasInput
                    ? 'bg-[#c86cff] text-white'
                    : 'bg-transparent text-[#222]'
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
  />
)}
      
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}