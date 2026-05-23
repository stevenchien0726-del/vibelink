'use client'

type Props = {
  showTopBar: boolean
  onClickVibePlus: () => void
}

export default function AIRadarTopBar({
  showTopBar,
  onClickVibePlus,
}: Props) {
  return (
    <div
      className={`fixed left-1/2 top-0 z-[40] flex h-[60px] w-full max-w-[430px] -translate-x-1/2 items-center justify-center border-b border-[var(--app-card-border)] bg-[var(--app-bg)]/95 px-4 text-[var(--app-text)] backdrop-blur-md transition-transform duration-300 ${
        showTopBar ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <button
        type="button"
        onClick={onClickVibePlus}
        className="flex items-center gap-[4px] rounded-full px-4 py-2 text-[var(--app-text)] active:scale-[0.97]"
      >
        <span className="text-[17px] font-medium text-[var(--app-text)]">
          Vibe Plus
        </span>

        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          className="text-[var(--app-text)]"
        >
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}