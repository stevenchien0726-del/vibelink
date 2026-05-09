'use client'

type Props = {
  user: any
  getCandidateDescription: (user: any) => string
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void
  onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void
}

export default function AIRadarResultCard({
  user,
  getCandidateDescription,
  onTouchStart,
  onTouchMove,
  onPointerDown,
  onPointerMove,
  onWheel,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="px-1">
        <div className="mb-2 text-[15px] font-semibold text-[#1f1f1f]">
          {user.name}
        </div>

        <div className="text-[14px] leading-[1.45] text-[#2d2d2d]">
          {getCandidateDescription(user)}
        </div>
      </div>

      <div className="space-y-3">
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
            {Array.from({ length: 5 }).map((_, photoIndex) => {
              const userImages =
                user.images && user.images.length > 0
                  ? user.images
                  : [(user as any).image ?? (user as any).avatar_url].filter(Boolean)

              const imgSrc = userImages[photoIndex % userImages.length]

              return (
                <button
                  key={`${user.id}-photo-${photoIndex}`}
                  type="button"
                  className="shrink-0 text-left transition active:scale-[0.98]"
                >
                  <div className="h-[160px] w-[110px] overflow-hidden rounded-[16px] bg-[#ead8f5] shadow-[0_3px_10px_rgba(0,0,0,0.05)]">
                    <img
                      src={imgSrc}
                      alt={`${user.name} photo ${photoIndex + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}