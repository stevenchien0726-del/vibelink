'use client'

import { uiText } from '@/lib/uiText'

type Props = {
  refreshKey: number
  refreshCount: number
  isSkySeedSearch: boolean
  skyImages: string[]
  onRefresh: () => void
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void
  onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void
}

export default function AIRadarMoreWall({
  refreshKey,
  refreshCount,
  isSkySeedSearch,
  skyImages,
  onRefresh,
  onTouchStart,
  onTouchMove,
  onPointerDown,
  onPointerMove,
  onWheel,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[16px] text-[var(--app-muted)]">
          <span>{uiText('更多人選', 'More People')}</span>
        </div>

        <button
  type="button"
  disabled={refreshCount >= 2}
  onClick={onRefresh}
  className={`rounded-full border border-[var(--app-card-border)] bg-[var(--app-card)] px-3 py-1.5 text-[15px] font-semibold text-[#a855f7] shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition active:scale-95 ${
    refreshCount >= 2 ? 'opacity-40 active:scale-100' : ''
  }`}
>
  <span className="flex items-center gap-[6px]">
    <span className="text-[17px] leading-none text-[#c084fc]">
  ↻
</span>

    <span>
      {refreshCount >= 2
        ? uiText('已完成掃描', 'Scan complete')
        : uiText(`再刷一次 (${2 - refreshCount}/2)`, `Refresh (${2 - refreshCount}/2)`)}
    </span>
  </span>
</button>
      </div>

      <div
        data-horizontal-scroll="true"
        className="-mx-1 overflow-x-auto pb-1 no-scrollbar touch-pan-x"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onWheel={onWheel}
      >
        <div className="flex gap-3 px-1 select-none">
          {Array.from({ length: 8 }).map((_, photoIndex) => {
            const shiftedIndex = photoIndex + refreshKey

            const imagePool = isSkySeedSearch
              ? skyImages
              : [
                  'https://media.gettyimages.com/id/598221526/...',
                  'https://media.istockphoto.com/id/2190079061/...',
                  'https://www.apetogentleman.com/...',
                  'https://i.pinimg.com/...',
                  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKP91...',
                  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpGf42...',
                ]

            const imgSrc = imagePool[shiftedIndex % imagePool.length]

            return (
              <button
                key={`more-wall-${photoIndex}`}
                type="button"
                className="shrink-0"
              >
                <div className="h-[160px] w-[110px] overflow-hidden rounded-[16px] border border-[var(--app-card-border)] bg-[var(--app-card)]">
                  <img
                    src={imgSrc}
                    alt={`photo ${photoIndex + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
