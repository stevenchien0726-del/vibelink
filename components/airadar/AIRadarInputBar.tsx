'use client'

import { memo, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Locale } from '@/i18n'

type SelectedUser = {
  id: string
  name: string
  avatar: string
}

type Props = {
  inputValue: string
  setInputValue: (value: string) => void
  selectedLibraryUser: SelectedUser | null
  setSelectedLibraryUser: (user: SelectedUser | null) => void
  onOpenPeopleLibrary: () => void
  onSubmit: () => void
  hasInput: boolean
  targetRef: React.RefObject<HTMLDivElement | null>

  locale: Locale
}

const inputText = {
  'zh-TW': {
    placeholder: 'AI雷達',
    clearSelectedUser: '清除選取用戶',
    openPeopleLibrary: '開啟 People Library',
    send: '送出',
  },

  en: {
    placeholder: 'AI Radar',
    clearSelectedUser: 'Clear selected user',
    openPeopleLibrary: 'Open People Library',
    send: 'Send',
  },
} as const

const MAX_TEXTAREA_LINES = 4
const TEXTAREA_LINE_HEIGHT = 20
const MAX_TEXTAREA_HEIGHT = MAX_TEXTAREA_LINES * TEXTAREA_LINE_HEIGHT
const INPUT_LIMIT_MESSAGE = '已達到輸入上限'

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = 'auto'
  textarea.style.height = `${Math.min(
    textarea.scrollHeight,
    MAX_TEXTAREA_HEIGHT
  )}px`

  return Math.min(
    MAX_TEXTAREA_LINES,
    Math.max(1, Math.ceil(textarea.scrollHeight / TEXTAREA_LINE_HEIGHT))
  )
}

function fitsTextareaLimit(
  textarea: HTMLTextAreaElement,
  nextValue: string
) {
  const previousValue = textarea.value
  const previousHeight = textarea.style.height

  textarea.value = nextValue
  textarea.style.height = 'auto'

  const fits = textarea.scrollHeight <= MAX_TEXTAREA_HEIGHT

  textarea.value = previousValue
  textarea.style.height = previousHeight

  return fits
}

function AIRadarInputBar({
  inputValue,
  setInputValue,
  selectedLibraryUser,
  setSelectedLibraryUser,
  onOpenPeopleLibrary,
  onSubmit,
  hasInput,
  targetRef,
  locale,
}: Props) {
  const canSend = hasInput || !!selectedLibraryUser
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const lastAcceptedValueRef = useRef(inputValue)
  const [textareaLineCount, setTextareaLineCount] = useState(1)

  function handleTextareaChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const textarea = event.currentTarget
    const nextValue = textarea.value

    if (!fitsTextareaLimit(textarea, nextValue)) {
      alert(INPUT_LIMIT_MESSAGE)
      textarea.value = inputValue
      setTextareaLineCount(resizeTextarea(textarea))
      return
    }

    lastAcceptedValueRef.current = nextValue
    setInputValue(nextValue)
    setTextareaLineCount(resizeTextarea(textarea))
  }

  useEffect(() => {
    const textarea = textareaRef.current

    if (!textarea) return

    if (!fitsTextareaLimit(textarea, inputValue)) {
      alert(INPUT_LIMIT_MESSAGE)
      setInputValue(lastAcceptedValueRef.current)
      return
    }

    lastAcceptedValueRef.current = inputValue
    setTextareaLineCount(resizeTextarea(textarea))
  }, [inputValue, setInputValue])

  return (
    <div className="flex w-full items-center gap-2 px-4">
      <div ref={targetRef} className="relative h-[50px] w-[130px] shrink-0">
        {selectedLibraryUser ? (
          <div className="flex h-[50px] w-full items-center gap-2 rounded-full bg-[#D9D9D9] px-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            {selectedLibraryUser.avatar ? (
              <img
                src={selectedLibraryUser.avatar}
                alt={selectedLibraryUser.name}
                loading="lazy"
                decoding="async"
                width={30}
                height={30}
                className="h-[30px] w-[30px] rounded-full object-cover"
              />
            ) : (
              <div className="h-[30px] w-[30px] shrink-0 rounded-full bg-[#c893cf]" />
            )}

            <span className="min-w-0 flex-1 truncate text-[13px] text-[#222]">
              {selectedLibraryUser.name}
            </span>

            <button
              type="button"
              aria-label={inputText[locale].clearSelectedUser}
              onClick={() => setSelectedLibraryUser(null)}
              className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#cfcfcf] text-[#555] transition active:scale-95"
            >
              <X size={18} strokeWidth={2.4} />
            </button>
          </div>
        ) : (
          <button
  type="button"
  aria-label={inputText[locale].openPeopleLibrary}
  onClick={onOpenPeopleLibrary}
  className="flex h-[50px] w-full items-center justify-center gap-[8px] rounded-full border border-[var(--app-card-border)] bg-[var(--app-surface)] px-[20px] text-[var(--app-text)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition active:scale-95"
>
  <UserCircleIcon />

  <span className="text-[22px] font-semibold leading-none text-[var(--app-text)]">
    +
  </span>
</button>
        )}
      </div>

      <div
        className={`flex min-w-0 flex-1 items-center rounded-[25px] bg-[#d0d0d0] pl-4 pr-[6px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] ${
          textareaLineCount > 1
            ? 'min-h-[50px] py-[15px]'
            : 'min-h-[40px] py-[10px]'
        }`}
      >
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleTextareaChange}
          placeholder={inputText[locale].placeholder}
          rows={1}
          className="max-h-[80px] min-h-[20px] w-full min-w-0 resize-none overflow-hidden border-0 bg-transparent p-0 text-[15px] leading-[20px] text-[#222] placeholder:text-[#8a8a8a] outline-none"
        />

        <button
  type="button"
  aria-label={inputText[locale].send}
  onClick={() => onSubmit()}
  className="relative ml-2 flex h-[40px] w-[40px] shrink-0 items-center justify-center self-center overflow-visible rounded-full bg-transparent transition active:scale-95"
>
  <EnterArrowIcon active={canSend} />
</button>
      </div>
    </div>
  )
}

export default memo(AIRadarInputBar)

function UserCircleIcon() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      className="text-[var(--app-text)]"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.9"
      />

      <circle
        cx="12"
        cy="9"
        r="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M7 18c1-2.2 2.9-3.5 5-3.5s4 1.3 5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function EnterArrowIcon({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active ? (
        <motion.img
          key="active-send-icon"
          src="/image/send-button-icon.png"
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.75 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="h-[54px] w-[54px] object-contain"
        />
      ) : null}
    </AnimatePresence>
  )
}
