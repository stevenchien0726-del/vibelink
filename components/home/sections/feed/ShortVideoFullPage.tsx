'use client'

import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion'
import { Heart, MessageCircle, Send, Bookmark, X } from 'lucide-react'
import type { PostItem } from './FeedGrid'

type Props = {
  open: boolean
  videos: PostItem[]
  initialVideoId?: string
  onClose: () => void
  onLike?: (post: PostItem) => void
  onComment?: (post: PostItem) => void
  onShare?: (post: PostItem) => void
  onSave?: (post: PostItem) => void
}

export default function ShortVideoFullPage({
  open,
  videos,
  initialVideoId,
  onClose,
  onLike,
  onComment,
  onShare,
  onSave,
}: Props) {
  const dragX = useMotionValue(0)

  if (!open) return null

  const foundIndex = videos.findIndex((video) => video.id === initialVideoId)
  const startIndex = foundIndex >= 0 ? foundIndex : 0

  const orderedVideos = [
    ...videos.slice(startIndex),
    ...videos.slice(0, startIndex),
  ]

  function closeWithAnimation() {
    animate(dragX, window.innerWidth, {
      duration: 0.22,
      ease: 'easeOut',
      onComplete: () => {
        dragX.set(0)
        onClose()
      },
    })
  }

  function resetDrag() {
    animate(dragX, 0, {
      type: 'spring',
      stiffness: 420,
      damping: 36,
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        data-block-page-swipe="true"
        className="fixed inset-0 z-[9999] h-[100dvh] w-full overflow-hidden bg-black"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        style={{ x: dragX }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        drag="x"
        dragDirectionLock
        dragElastic={0.12}
        dragMomentum={false}
        dragConstraints={{ left: 0, right: 360 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 110 || info.velocity.x > 650) {
            closeWithAnimation()
            return
          }

          resetDrag()
        }}
      >
        <div
          data-block-page-swipe="true"
          className="no-scrollbar mx-auto h-[100dvh] w-full max-w-[430px] overflow-y-auto overflow-x-hidden snap-y snap-mandatory bg-black"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          {orderedVideos.map((video) => {
            const videoSrc = video.videoUrl || (video as any).video_url

            return (
              <section
                key={video.id}
                data-block-page-swipe="true"
                className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden bg-black"
              >
                {videoSrc ? (
                  <video
                    key={videoSrc}
                    src={videoSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onLoadedData={(e) =>
                      e.currentTarget.play().catch(() => {})
                    }
                    className="absolute inset-0 z-[10] h-full w-full bg-black object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 z-[10] flex items-center justify-center bg-black text-white">
                    找不到影片 URL
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 z-[20] bg-gradient-to-b from-black/20 via-transparent to-black/55" />

                <button
                  type="button"
                  onClick={closeWithAnimation}
                  className="absolute right-5 top-6 z-[50] flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/85 text-black shadow-md active:scale-90"
                >
                  <X size={22} />
                </button>

                <div className="absolute bottom-[118px] right-5 z-[50] flex flex-col items-center gap-6 text-white">
                  <button
  type="button"
  onClick={() => {
  console.log('前往用戶 Profile:', video.user_id)
}}
  className="flex h-[48px] w-[48px] items-center justify-center rounded-full border-2 border-white bg-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] active:scale-90"
>
  <span className="text-[17px] font-semibold text-[#555]">
    {(video.author || 'V').slice(0, 1)}
  </span>
</button>

                  <button type="button" onClick={() => onLike?.(video)}>
                    <Heart
                      size={34}
                      color="white"
                      fill={video.isLiked ? '#c86cff' : 'none'}
                      strokeWidth={2.4}
                    />
                  </button>

                  <button type="button" onClick={() => onComment?.(video)}>
                    <MessageCircle size={34} strokeWidth={2.4} />
                  </button>

                  <button type="button" onClick={() => onShare?.(video)}>
                    <Send size={33} strokeWidth={2.2} />
                  </button>

                  <button type="button" onClick={() => onSave?.(video)}>
                    <Bookmark
                      size={34}
                      color="white"
                      fill={video.isSaved ? '#c86cff' : 'none'}
                      strokeWidth={2.3}
                    />
                  </button>
                </div>

                <div className="absolute bottom-[72px] left-6 z-[50] w-[250px] text-white">
                  <div className="mb-2 text-[15px] font-semibold">
                    {video.author || '用戶名'}
                  </div>

                  <div className="text-[14px] leading-[1.45] text-white/95">
                    {video.text || '用戶文案......'}
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}