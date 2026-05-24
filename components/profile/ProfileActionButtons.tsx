'use client'

type Props = {
  editLabel: string
  shareLabel: string
  onEdit: () => void
  onShare: () => void
}

const buttonStyle: React.CSSProperties = {
  WebkitAppearance: 'none',
  appearance: 'none',
  height: 44,
  borderRadius: 999,
  border: '1.5px solid rgba(255,255,255,0.22)',
  background: 'rgba(255,255,255,0.075)',
  color: 'var(--app-text)',
  boxShadow:
    'inset 0 0 0 1px rgba(255,255,255,0.04), 0 6px 18px rgba(0,0,0,0.18)',
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
          flex flex-1 items-center justify-center
          px-4
          text-[15px]
          font-medium
          leading-none
          whitespace-nowrap
          transition-transform duration-200
          active:scale-[0.97]
        "
        style={buttonStyle}
      >
        {editLabel}
      </button>

      <button
        type="button"
        onClick={onShare}
        className="
          flex flex-1 items-center justify-center
          px-4
          text-[15px]
          font-medium
          leading-none
          whitespace-nowrap
          transition-transform duration-200
          active:scale-[0.97]
        "
        style={buttonStyle}
      >
        {shareLabel}
      </button>
    </div>
  )
}