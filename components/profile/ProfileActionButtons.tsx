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
    <div className="mb-5 flex w-full items-center gap-3">
      <button
        type="button"
        onClick={onEdit}
        className="
          flex h-[46px] flex-1 items-center justify-center
          rounded-full
          border border-[#d9d9d9]
          bg-[#f8f8f8]
          px-4
          text-[15px]
          font-medium
          leading-none
          whitespace-nowrap
          text-[var(--app-text)]
          shadow-[0_4px_14px_rgba(0,0,0,0.04)]
          transition-all duration-200
          active:scale-[0.97]
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
          flex h-[46px] flex-1 items-center justify-center
          rounded-full
          border border-[#d9d9d9]
          bg-[#f8f8f8]
          px-4
          text-[15px]
          font-medium
          leading-none
          whitespace-nowrap
          text-[var(--app-text)]
          shadow-[0_4px_14px_rgba(0,0,0,0.04)]
          transition-all duration-200
          active:scale-[0.97]
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