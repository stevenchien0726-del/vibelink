'use client'

import { memo, useMemo } from 'react'
import type { FakeUser } from '@/data/fakeUsers'

type AIRadarCardUser = FakeUser & {
  image?: string
  humanFeeling?: string
  vibe_tags?: string[]
}

type Props = {
  user: AIRadarCardUser
  getCandidateDescription: (user: AIRadarCardUser) => string
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void
  onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void
  onOpenProfile?: (user: AIRadarCardUser) => void
}

function AIRadarResultCard({
  user,
  getCandidateDescription,
  onTouchStart,
  onTouchMove,
  onPointerDown,
  onPointerMove,
  onWheel,
  onOpenProfile,
}: Props) {
  const uniqueImages = useMemo(() => {
    const userImages =
      user.images && user.images.length > 0
        ? user.images
        : [user.image ?? user.avatar].filter(Boolean)

    return Array.from(new Set(userImages))
      .filter((image): image is string => typeof image === 'string')
      .slice(0, 5)
  }, [user])

  const candidateDescription = useMemo(
    () => getCandidateDescription(user),
    [getCandidateDescription, user]
  )

  return (
    <div className="space-y-3">
      <div className="px-1">
        <div className="mb-2 text-[15px] font-semibold text-[var(--app-text)]">
          {user.displayName ?? user.username}
        </div>

        <div className="text-[14px] leading-[1.5] text-[var(--app-text)]">
          {candidateDescription}
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
                  <div className="h-[160px] w-[110px] overflow-hidden rounded-[16px] border border-[var(--app-card-border)] bg-[var(--app-card)] shadow-[0_3px_10px_rgba(0,0,0,0.08)]">
                    <img
                      src={imgSrc}
                      alt={`${user.displayName ?? user.username ?? 'user'} photo ${
                        photoIndex + 1
                      }`}
                      loading="lazy"
                      decoding="async"
                      width={110}
                      height={160}
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

export default memo(AIRadarResultCard)
