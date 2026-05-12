'use client'

type Props = {
  user: any
  getCandidateDescription: (user: any) => string
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void
  onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void
onOpenProfile?: (user: any) => void
}

export default function AIRadarResultCard({
  user,
  getCandidateDescription,
  onTouchStart,
  onTouchMove,
  onPointerDown,
  onPointerMove,
  onWheel,
onOpenProfile,
}: Props) {
  const userImages =
    user.images && user.images.length > 0
      ? user.images
      : [(user as any).image ?? (user as any).avatar_url].filter(Boolean)

  const uniqueImages = Array.from(
  new Set(userImages)
).filter((image): image is string => typeof image === 'string')
  .slice(0, 5)

  return (
    <div className="space-y-3">
      <div className="px-1">
        <div className="mb-2 text-[15px] font-semibold text-[#1f1f1f]">
          {user.name ?? user.display_name ?? user.username}
        </div>

        <div className="text-[14px] leading-[1.45] text-[#2d2d2d]">
          {getCandidateDescription(user)}
        </div>
      </div>

      {uniqueImages.length > 0 && (
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
              {uniqueImages.map((imgSrc, photoIndex) => (
                <button
  key={`${user.id}-photo-${photoIndex}-${imgSrc}`}
  type="button"
  onClick={() => onOpenProfile?.(user)}
  className="shrink-0 text-left transition active:scale-[0.98]"
>
                  <div className="h-[160px] w-[110px] overflow-hidden rounded-[16px] bg-[#ead8f5] shadow-[0_3px_10px_rgba(0,0,0,0.05)]">
                    <img
                      src={imgSrc}
                      alt={`${user.name ?? user.display_name ?? 'user'} photo ${
                        photoIndex + 1
                      }`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}