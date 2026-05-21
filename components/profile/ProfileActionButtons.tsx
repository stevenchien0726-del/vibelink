'use client'

type Props = {
  editLabel: string
  shareLabel: string
  onEdit: () => void
  onShare: () => void
}

export default function ProfileActionButtons({
  editLabel,
  shareLabel,
  onEdit,
  onShare,
}: Props) {
  return (
    <div className="mb-4 flex w-full items-center gap-3">
      <button
        type="button"
        onClick={onEdit}
        className="
  flex h-[44px] flex-1 items-center justify-center
  rounded-[18px]
  border-[1.5px]
  border-solid
  border-[#6d6d6d]
  html.dark:border-white/65
  bg-transparent
  px-3
  text-[15px]
  leading-none
  whitespace-nowrap
  text-[var(--app-text)]
  transition-all
  active:scale-[0.98]
"
        style={{
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
      >
        {editLabel}
      </button>

      <button
        type="button"
        onClick={onShare}
        className="
  flex h-[44px] flex-1 items-center justify-center
  rounded-[18px]
  border-[1.5px]
  border-solid
  border-[#6d6d6d]
  html.dark:border-white/65
  bg-transparent
  px-3
  text-[15px]
  leading-none
  whitespace-nowrap
  text-[var(--app-text)]
  transition-all
  active:scale-[0.98]
"
        style={{
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
      >
        {shareLabel}
      </button>
    </div>
  )
}