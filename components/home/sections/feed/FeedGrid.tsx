'use client'

import WideMenuSheet from '@/components/WideMenuSheet'
import { useEffect, useRef, useState } from 'react'
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Bookmark,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { supabase } from '@/lib/supabase'

export type PostItem = {
  id: string
  author: string
  text: string
  likes: number
  images: string[]
  videoUrl?: string
  aiTags: string[]

  feedScore?: number
  feedReasons?: string[]

  isMine?: boolean
  isLiked?: boolean
  isSaved?: boolean
  user_id?: string
  type?: 'post' | 'video'
  isMock?: boolean
}

type FeedGridProps = {
  posts?: PostItem[]
  onOpenPost?: (post: PostItem) => void
  onOpenComments?: (post: PostItem) => void
  onOpenShare?: (post: PostItem) => void
  onDeletePost?: (post: PostItem) => void
  onOpenProfile?: (post: PostItem) => void
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'

function LazyFeedVideo({
  src,
  poster,
}: {
  src: string
  poster: string
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [shouldMountVideo, setShouldMountVideo] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const node = wrapRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShouldMountVideo(entry.isIntersecting)
      },
      {
        root: null,
        rootMargin: '260px 0px',
        threshold: 0.01,
      }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!shouldMountVideo) return

    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.playsInline = true

    const playVideo = async () => {
      try {
        await video.play()
      } catch {
        // 手機瀏覽器可能會擋第一次 autoplay，先不讓它炸掉
      }
    }

    playVideo()
  }, [shouldMountVideo, reloadKey])

  useEffect(() => {
    if (!shouldMountVideo) return

    const timer = window.setTimeout(() => {
      const video = videoRef.current

      if (!video) return

      const stillBlack =
        video.readyState < 2 || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE

      if (stillBlack) {
        setReloadKey((prev) => prev + 1)
      }
    }, 3500)

    return () => window.clearTimeout(timer)
  }, [shouldMountVideo, reloadKey])

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-black">
      <img
        src={poster || FALLBACK_IMAGE}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {shouldMountVideo && (
        <video
          key={`${src}-${reloadKey}`}
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="none"
          poster={poster || FALLBACK_IMAGE}
          className={`absolute inset-0 h-full w-full bg-black object-cover transition-opacity duration-300 ${
            isReady ? 'opacity-100' : 'opacity-0'
          }`}
          onLoadedData={() => setIsReady(true)}
          onCanPlay={() => setIsReady(true)}
          onError={() => {
            setIsReady(false)
            setReloadKey((prev) => prev + 1)
          }}
        />
      )}
    </div>
  )
}

export default function FeedGrid({
  posts = [],
  onOpenPost,
  onOpenComments,
  onOpenShare,
  onDeletePost,
  onOpenProfile,
}: FeedGridProps) {
  const [slideMap, setSlideMap] = useState<Record<string, number>>({})
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null)
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({})
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({})
  const [bigHeartPostId, setBigHeartPostId] = useState<string | null>(null)
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({})

  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const isHorizontalGestureRef = useRef(false)
  const activeTouchPostIdRef = useRef<string | null>(null)

  const lastTapPostIdRef = useRef<string | null>(null)
  const lastTapTimeRef = useRef(0)

  useEffect(() => {
    const nextCounts: Record<string, number> = {}
    const nextLiked: Record<string, boolean> = {}
    const nextSaved: Record<string, boolean> = {}

    posts.forEach((post) => {
      nextCounts[post.id] = post.likes ?? 0
      nextLiked[post.id] = !!post.isLiked
      nextSaved[post.id] = !!post.isSaved
    })

    setLikeCountMap(nextCounts)
    setLikedMap(nextLiked)
    setSavedMap(nextSaved)
  }, [posts])

  const getPostImages = (post: PostItem) => {
    return post.images && post.images.length > 0 ? post.images : [FALLBACK_IMAGE]
  }

  if (!posts || posts.length === 0) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="feed-2x2"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -14, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="grid grid-cols-2 gap-[3px]"
      >
        {posts.map((post) => {
          const image = getPostImages(post)[0]

          return (
            <motion.button
              type="button"
              layout
              key={post.id}
              onClick={() => onOpenPost?.(post)}
              className="relative h-[280px] w-full overflow-hidden rounded-[6px] bg-[#dddddd]"
            >
              {post.videoUrl ? (
                <LazyFeedVideo src={post.videoUrl} poster={image} />
              ) : (
                <img
                  src={image}
                  alt={post.author}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              )}
            </motion.button>
          )
        })}
      </motion.div>
    </AnimatePresence>
  )
}