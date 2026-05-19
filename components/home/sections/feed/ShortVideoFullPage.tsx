'use client'

import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  X,
  MoreHorizontal,
} from 'lucide-react'

import type { PostItem } from './FeedGrid'
import WideMenuSheet from '@/components/WideMenuSheet'

type Props = {
  open: boolean
  videos: PostItem[]
  initialVideoId?: string
  onClose: () => void
  onLike?: (post: PostItem) => void
  onComment?: (post: PostItem) => void
  onShare?: (post: PostItem) => void
  onSave?: (post: PostItem) => void
  onDelete?: (post: PostItem) => void
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
  onDelete,
}: Props) {
  const dragX = useMotionValue(0)

  const [menuVideo, setMenuVideo] = useState<PostItem | null>(null)
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const orderedVideos = useMemo(() => {
    const foundIndex = videos.findIndex((video) => video.id === initialVideoId)
    const startIndex = foundIndex >= 0 ? foundIndex : 0

    return [
      ...videos.slice(startIndex),
      ...videos.slice(0, startIndex),
    ]
  }, [videos, initialVideoId])

  useEffect(() => {
    if (!open) {
      Object.values(videoRefs.current).forEach((video) => {
        if (!video) return
        video.pause()
        video.currentTime = 0
      })

      setActiveVideoId(null)
      setMenuVideo(null)
      return
    }

    setActiveVideoId(orderedVideos[0]?.id ?? null)
  }, [open, orderedVideos])

  useEffect(() => {
    if (!open) return

    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (!video) return

      if (id === activeVideoId) {
        video.muted = false
        video.play().catch(() => {})
      } else {
        video.pause()
        video.currentTime = 0
      }
    })
  }, [open, activeVideoId])

  useEffect(() => {
    if (!open) return

    const observer = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        const nextId = activeEntry?.target.getAttribute('data-video-id')

        if (nextId && activeEntry.intersectionRatio > 0.62) {
          setActiveVideoId(nextId)
        }
      },
      {
        threshold: [0.25, 0.5, 0.62, 0.75, 0.9],
      }
    )

    Object.values(sectionRefs.current).forEach((node) => {
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [open, orderedVideos])

  if (!open) return null

  function closeWithAnimation() {
    Object.values(videoRefs.current).forEach((video) => {
      if (!video) return
      video.pause()
    })

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
    <AnimatePresence mode="wait">
      <>
        <motion.div
          data-block-page-swipe="true"
          className="fixed inset-0 z-[9999] h-[100dvh] w-full overflow-hidden bg-black"
          initial={{ y: 40, scale: 0.92, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 40, scale: 0.92, opacity: 0 }}
          style={{ x: dragX }}
          transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.85 }}
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
            className="no-scrollbar mx-auto h-[100dvh] w-full max-w-[430px] snap-y snap-mandatory overflow-y-auto overflow-x-hidden bg-black"
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
                  ref={(node) => {
                    sectionRefs.current[video.id] = node
                  }}
                  data-video-id={video.id}
                  data-block-page-swipe="true"
                  className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden bg-black"
                >
                  {videoSrc ? (
                    <video
                      key={videoSrc}
                      ref={(node) => {
                        videoRefs.current[video.id] = node
                      }}
                      src={videoSrc}
                      muted={video.id !== activeVideoId}
                      loop
                      playsInline
                      controls={false}
                      preload="auto"
                      onLoadedData={(e) => {
                        if (video.id === activeVideoId) {
                          e.currentTarget.muted = false
                          e.currentTarget.play().catch(() => {})
                        } else {
                          e.currentTarget.pause()
                          e.currentTarget.currentTime = 0
                        }
                      }}
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
                    className="absolute right-5 top-6 z-[50] flex h-[38px] w-[38px] items-center justify-center rounded-full bg-black/22 text-white backdrop-blur-md active:scale-90"
                  >
                    <X size={24} color="white" strokeWidth={2.8} />
                  </button>

                  {video.isMine && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuVideo(video)
                      }}
                      className="absolute right-[72px] top-6 z-[50] flex h-[38px] w-[38px] items-center justify-center rounded-full bg-black/22 text-white backdrop-blur-md active:scale-90"
                    >
                      <MoreHorizontal size={24} strokeWidth={3} color="white" />
                    </button>
                  )}

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

        <AnimatePresence>
          {menuVideo && (
            <motion.div
              key="short-video-menu"
              initial={{ opacity: 0, y: 36, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 36, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
              className="fixed inset-0 z-[10020]"
            >
              <WideMenuSheet
                variant="mine"
                onClose={() => setMenuVideo(null)}
                onDelete={() => {
                  if (!menuVideo) return

                  onDelete?.(menuVideo)
                  setMenuVideo(null)
                  onClose()
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </AnimatePresence>
  )
}