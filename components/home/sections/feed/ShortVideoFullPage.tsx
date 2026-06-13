'use client'

import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  X,
  MoreHorizontal,
  Volume2,
  VolumeX,
} from 'lucide-react'

import type { PostItem } from './FeedGrid'
import WideMenuSheet from '@/components/WideMenuSheet'
import { supabase } from '@/lib/supabase'

type Props = {
  open: boolean
  videos: PostItem[]
  initialVideoId?: string
  reportedVideoIds?: string[]
  setReportedVideoIds?: Dispatch<SetStateAction<string[]>>
  onClose: () => void
  onLike?: (post: PostItem) => void
  onComment?: (post: PostItem) => void
  onShare?: (post: PostItem) => void
  onSave?: (post: PostItem) => void
  onDelete?: (post: PostItem) => void
  onArchive?: (post: PostItem) => void
  onOpenProfile?: (userId: string) => void
}

export default function ShortVideoFullPage({
  open,
  videos,
  initialVideoId,
  reportedVideoIds = [],
  setReportedVideoIds,
  onClose,
  onLike,
  onComment,
  onShare,
  onSave,
  onDelete,
  onArchive,
  onOpenProfile,
}: Props) {
  const dragX = useMotionValue(0)

  const [menuVideo, setMenuVideo] = useState<PostItem | null>(null)
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  const [reloadMap, setReloadMap] = useState<Record<string, number>>({})
  const [soundOn, setSoundOn] = useState(false)
  const [showSoundIcon, setShowSoundIcon] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
  video.muted = !soundOn
  video.play().catch(() => {})
}
      else {
  video.pause()
}
    })
  }, [open, activeVideoId, soundOn])

  useEffect(() => {
  if (!open || !activeVideoId) return

  const timer = window.setTimeout(() => {
    const video = videoRefs.current[activeVideoId]

    if (!video) return

    const isStuck =
      video.readyState < 2 ||
      video.paused ||
      video.currentTime === 0

    const reloadCount = reloadMap[activeVideoId] ?? 0

if (isStuck && reloadCount < 2) {
  if (isStuck && reloadCount >= 2) {
  console.warn('短影片多次重載仍失敗，停止自動重試:', activeVideoId)
}

      console.warn('短影片卡住，自動重新讀取:', activeVideoId)

      setReloadMap((prev) => ({
        ...prev,
        [activeVideoId]: (prev[activeVideoId] ?? 0) + 1,
      }))
    }
  }, 3500)

  return () => window.clearTimeout(timer)
}, [open, activeVideoId, reloadMap])

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

  function isVideoReported(videoId: string) {
    return reportedVideoIds.includes(videoId)
  }

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

  async function handleDeleteVideo(video: PostItem) {
  if (!video?.id || deletingId) return

  setDeletingId(video.id)

  try {
    await supabase
      .from('short_video_likes')
      .delete()
      .eq('short_video_id', video.id)

    await supabase
      .from('saved_short_videos')
      .delete()
      .eq('short_video_id', video.id)

    await supabase
      .from('short_video_comments')
      .delete()
      .eq('short_video_id', video.id)

    const { error } = await supabase
      .from('short_videos')
      .delete()
      .eq('id', video.id)

    if (error) throw error

    onDelete?.(video)
    setMenuVideo(null)
    closeWithAnimation()
  } catch (error) {
    console.error('刪除短影片失敗:', error)
    alert('刪除失敗，請再試一次。')
  } finally {
    setDeletingId(null)
  }
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
          className="fixed inset-0 z-[9999] h-[100dvh] w-full overflow-hidden overscroll-contain bg-black touch-pan-y"
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
            className="no-scrollbar mx-auto h-[100dvh] w-full max-w-[430px] snap-y snap-mandatory overflow-y-auto overflow-x-hidden overscroll-contain bg-black touch-pan-y"
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
              overscrollBehavior: 'contain',
            }}
          >
            {orderedVideos.map((video, index) => {
  
  const activeIndex = orderedVideos.findIndex(
  (item) => item.id === activeVideoId
)

const distanceFromActive =
  activeIndex >= 0 ? Math.abs(index - activeIndex) : 999

const shouldRenderVideo = distanceFromActive <= 2
const shouldPreloadVideo = distanceFromActive <= 2
const isActiveVideo = video.id === activeVideoId
const isReported = isVideoReported(video.id)
              const videoSrc = video.videoUrl || (video as any).video_url

              return (
                <section
  key={video.id}
  onClick={async (e) => {
  e.stopPropagation()
    if (video.id !== activeVideoId) return

    const nextSoundOn = !soundOn

const activeVideo = videoRefs.current[video.id]

if (activeVideo) {
  try {
    activeVideo.muted = !nextSoundOn
    activeVideo.defaultMuted = false
    activeVideo.volume = 1

    if (nextSoundOn) {
      await activeVideo.play()
    }

    setSoundOn(nextSoundOn)
    setShowSoundIcon(true)

window.clearTimeout((window as any).__vibeSoundTimer)

;(window as any).__vibeSoundTimer = window.setTimeout(() => {
  setShowSoundIcon(false)
}, 2300)
  } catch (err) {
    console.error('開啟聲音失敗:', err)
  }
}
  }}
                  ref={(node) => {
                    sectionRefs.current[video.id] = node
                  }}
                  data-video-id={video.id}
                  data-block-page-swipe="true"
                  className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden bg-black"
                >
                  {videoSrc && shouldRenderVideo ? (
  <video
                      key={`${videoSrc}-${reloadMap[video.id] ?? 0}`}
                      ref={(node) => {
                        videoRefs.current[video.id] = node
                      }}
                      src={videoSrc}
                      muted={video.id !== activeVideoId || !soundOn}
                      loop
                      playsInline
                      webkit-playsinline="true"
disablePictureInPicture
                      controls={false}
                      preload={isActiveVideo ? 'auto' : shouldPreloadVideo ? 'metadata' : 'none'}
                      onLoadedData={(e) => {
  const el = e.currentTarget

  if (isActiveVideo) {
    el.muted = !soundOn

    window.setTimeout(() => {
      el.play().catch(() => {})
    }, 80)
  } else {
    el.pause()
  }
}}

onError={() => {
  console.warn('影片載入失敗，重新讀取:', video.id)

  setReloadMap((prev) => ({
    ...prev,
    [video.id]: (prev[video.id] ?? 0) + 1,
  }))
}}
                      className={`absolute inset-0 z-[10] h-full w-full bg-black object-cover ${
                        isReported ? 'blur-xl opacity-60' : ''
                      }`}
                    />
                  
  ) : (() => {
  const thumbnailSrc =
    (video as any).thumbnailUrl ||
    (video as any).thumbnail_url ||
    video.images?.[0] ||
    null

  if (!thumbnailSrc) {
    return <div className="absolute inset-0 z-[10] bg-black" />
  }

  return (
    <img
      src={thumbnailSrc}
      className={`absolute inset-0 z-[10] h-full w-full bg-black object-cover ${
        isReported ? 'blur-xl opacity-60' : ''
      }`}
      draggable={false}
      onError={(e) => {
        const el = e.currentTarget
        el.removeAttribute('src')
        el.style.display = 'none'
      }}
    />
  )
})()}

                  {isReported && (
                    <div className="pointer-events-none absolute inset-0 z-[45] flex items-center justify-center bg-black/45 px-6 text-center text-[15px] font-medium text-white">
                      你已檢舉這支短影片，內容已暫時隱藏
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 z-[20] bg-gradient-to-b from-black/20 via-transparent to-black/55" />
                  <AnimatePresence>
  {showSoundIcon && video.id === activeVideoId && (
    <motion.div
      initial={{ opacity: 0, scale: 0.72 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.72 }}
      transition={{
        type: 'spring',
        stiffness: 320,
        damping: 24,
      }}
      className="pointer-events-none absolute left-1/2 top-1/2 z-[60] flex h-[82px] w-[82px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/42 backdrop-blur-xl"
    >
      {soundOn ? (
        <Volume2
          size={38}
          color="white"
          strokeWidth={2.6}
        />
      ) : (
        <VolumeX
          size={38}
          color="white"
          strokeWidth={2.6}
        />
      )}
    </motion.div>
  )}
</AnimatePresence>
                  
                  <button
                    type="button"
                    onClick={closeWithAnimation}
                    className="absolute right-5 top-6 z-[50] flex h-[38px] w-[38px] items-center justify-center rounded-full bg-black/22 text-white backdrop-blur-md active:scale-90"
                  >
                    <X size={24} color="white" strokeWidth={2.8} />
                  </button>

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

                  <div className="absolute bottom-[118px] right-5 z-[50] flex flex-col items-center gap-6 text-white">
                    <button
  type="button"
  onClick={(e) => {
    e.stopPropagation()
    if (!video.user_id) return
    onOpenProfile?.(video.user_id)
  }}
  className="flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#d9d9d9] shadow-[0_4px_14px_rgba(0,0,0,0.25)] active:scale-90"
>
  {(video as any).avatarUrl ? (
    <img
      src={(video as any).avatarUrl}
      alt={video.author || 'Vibelink User'}
      className="h-full w-full rounded-full object-cover"
      draggable={false}
    />
  ) : (
    <span className="text-[17px] font-semibold text-[#555]">
      {(video.author || 'V').slice(0, 1)}
    </span>
  )}
</button>

                    <button
  type="button"
  onClick={(e) => {
    e.stopPropagation()
    onLike?.(video)
  }}
>
                      <Heart
                        size={34}
                        color="white"
                        fill={video.isLiked ? '#c86cff' : 'none'}
                        strokeWidth={2.4}
                      />
                    </button>

                    <button
  type="button"
  onClick={(e) => {
    e.stopPropagation()
    onComment?.(video)
  }}
>
                      <MessageCircle size={34} strokeWidth={2.4} />
                    </button>

                    <button
  type="button"
  onClick={(e) => {
    e.stopPropagation()
    onShare?.(video)
  }}
>
                      <Send size={33} strokeWidth={2.2} />
                    </button>

                    <button
  type="button"
  onClick={(e) => {
    e.stopPropagation()
    onSave?.(video)
  }}
>
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

                    {video.text?.trim() ? (
  <div className="text-[14px] leading-[1.45] text-white/95">
    {video.text}
  </div>
) : null}
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
  variant={menuVideo.isMine ? 'mine' : 'other'}
  isReported={reportedVideoIds.includes(menuVideo.id)}
  onClose={() => setMenuVideo(null)}
  onReport={() => {
    setReportedVideoIds?.((prev) =>
      prev.includes(menuVideo.id)
        ? prev.filter((id) => id !== menuVideo.id)
        : [...prev, menuVideo.id]
    )

    setMenuVideo(null)
  }}
  onArchive={() => {
    if (!menuVideo) return


    onArchive?.(menuVideo)
    setMenuVideo(null)
    closeWithAnimation()
  }}
  onDelete={() => {
  if (!menuVideo) return
  handleDeleteVideo(menuVideo)
}}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </AnimatePresence>
  )
}
