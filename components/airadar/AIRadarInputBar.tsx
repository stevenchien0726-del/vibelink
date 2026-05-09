'use client'

import { X } from 'lucide-react'

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
}

export default function AIRadarInputBar({
  inputValue,
  setInputValue,
  selectedLibraryUser,
  setSelectedLibraryUser,
  onOpenPeopleLibrary,
  onSubmit,
  hasInput,
  targetRef,
}: Props) {
  return (
    <div className="fixed bottom-[92px] left-1/2 z-[60] flex w-full max-w-[430px] -translate-x-1/2 items-center gap-2 px-4">
      <div ref={targetRef} className="relative h-[50px] w-[150px] shrink-0">
        {selectedLibraryUser ? (
          <div className="flex h-[50px] w-full items-center gap-2 rounded-full bg-[#D9D9D9] px-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <img
              src={selectedLibraryUser.avatar}
              alt={selectedLibraryUser.name}
              className="h-[30px] w-[30px] rounded-full object-cover"
            />

            <span className="min-w-0 flex-1 truncate text-[13px] text-[#222]">
              {selectedLibraryUser.name}
            </span>

            <button
              type="button"
              aria-label="Clear selected user"
              onClick={() => setSelectedLibraryUser(null)}
              className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#cfcfcf] text-[#555] transition active:scale-95"
            >
              <X size={18} strokeWidth={2.4} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label="Open People Library"
            onClick={onOpenPeopleLibrary}
            className="flex h-[50px] w-full items-center justify-center gap-[8px] rounded-full bg-[#D9D9D9] px-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition active:scale-95"
          >
            <UserCircleIcon />
            <span className="text-[22px] font-semibold leading-none text-[#111]">
              +
            </span>
          </button>
        )}
      </div>

      <div className="flex h-[50px] min-w-0 flex-1 items-center rounded-full bg-[#d0d0d0] pl-4 pr-[6px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit()
          }}
          placeholder="AI雷達"
          className="w-full min-w-0 text-[15px] text-[#222] placeholder:text-[#8a8a8a] outline-none"
        />

        <button
          type="button"
          aria-label="Send"
          onClick={onSubmit}
          className="ml-2 grid h-[36px] w-[36px] shrink-0 place-items-center rounded-full bg-transparent transition active:scale-95"
        >
          <EnterArrowIcon active={hasInput || !!selectedLibraryUser} />
        </button>
      </div>
    </div>
  )
}

function UserCircleIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" />
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
  const color = active ? '#9f449f' : '#111111'

  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.2" />
      <path d="M12 16V9" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M8 13l4-4 4 4"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}