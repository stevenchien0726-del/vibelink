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
      className={`fixed left-1/2 top-0 z-[40] flex h-[60px] w-full max-w-[430px] -translate-x-1/2 items-center justify-center bg-[rgba(245,245,245,0.96)] px-4 backdrop-blur-md transition-transform duration-300 ${
        showTopBar ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <button
        type="button"
        onClick={onClickVibePlus}
        className="flex items-center gap-[4px]"
      >
        <span className="text-[17px] font-medium text-[#111]">
          Vibe Plus
        </span>

        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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