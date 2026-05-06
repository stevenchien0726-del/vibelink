'use client'

import { AnimatePresence, motion, PanInfo } from 'framer-motion'
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
  if (!open) return null

  const foundIndex = videos.findIndex((video) => video.id === initialVideoId)
  const startIndex = foundIndex >= 0 ? foundIndex : 0

  let dragStartX = 0
  
  const orderedVideos = [
    ...videos.slice(startIndex),
    ...videos.slice(0, startIndex),
  ]

  return (
    <AnimatePresence>
      <motion.div
  data-block-page-swipe="true"
  className="fixed inset-0 z-[9999] h-[100dvh] w-screen overflow-hidden bg-black"
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ type: 'spring', stiffness: 360, damping: 34 }}
  onPanStart={(_, info: PanInfo) => {
    dragStartX = info.point.x
  }}
  onPanEnd={(_, info: PanInfo) => {
    const deltaX = info.point.x - dragStartX

    // 左滑返回 feed
    if (deltaX < -80) {
      onClose()
    }
  }}
>
        <div className="h-[100dvh] w-screen overflow-y-auto snap-y snap-mandatory bg-black">
          {orderedVideos.map((video) => {
            const videoSrc = video.videoUrl || (video as any).video_url

            return (
              <section
                key={video.id}
                className="relative h-[100dvh] w-screen snap-start overflow-hidden bg-black"
              >
                {videoSrc ? (
                  <video
                    key={videoSrc}
                    src={videoSrc}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onLoadedData={(e) =>
                      e.currentTarget.play().catch(() => {})
                    }
                    className="fixed left-0 top-0 z-[10] h-[100dvh] w-[430px] object-cover bg-black"
                  />
                ) : (
                  <div className="fixed left-0 top-0 z-[10] flex h-[100dvh] w-[430px] items-center justify-center bg-black text-white">
                    找不到影片 URL
                  </div>
                )}

                <div className="pointer-events-none fixed left-0 top-0 z-[20] h-[100dvh] w-[430px] bg-gradient-to-b from-black/20 via-transparent to-black/55" />

                <button
                  type="button"
                  onClick={onClose}
                  className="fixed left-[372px] top-[24px] z-[99999] flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/85 text-black shadow-md active:scale-90"
                >
                  <X size={22} />
                </button>

                <div className="fixed bottom-[118px] left-[350px] z-[99999] flex flex-col items-center gap-6 text-white">
                  <button
                    type="button"
                    className="h-[48px] w-[48px] rounded-full bg-[#c48ac8]"
                  />

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

                <div className="fixed bottom-[72px] left-[24px] z-[99999] w-[250px] text-white">
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