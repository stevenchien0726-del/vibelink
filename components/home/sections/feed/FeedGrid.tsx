'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export type PostItem = {
  id: string
  author: string
  text: string
  likes: number
  images: string[]
  videoUrl?: string
  thumbnailUrl?: string
  thumbnail_url?: string
  aiTags: string[]
  feedScore?: number
  feedReasons?: string[]
  isMine?: boolean
  isLiked?: boolean
  isSaved?: boolean
  user_id?: string
  type?: 'post' | 'video'
  isMock?: boolean
  isPinned?: boolean
  pinned_at?: string | null
  reply_permission?: 'everyone' | 'following' | 'off'
}

type FeedGridProps = {
  posts?: PostItem[]
  reportedPostIds?: string[]
  reportedVideoIds?: string[]
  onOpenPost?: (post: PostItem) => void
  onOpenComments?: (post: PostItem) => void
  onOpenShare?: (post: PostItem) => void
  onDeletePost?: (post: PostItem) => void
  onOpenProfile?: (post: PostItem) => void
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'

const MOBILE_SAFE_INITIAL_LIMIT = 24
const INITIAL_RENDER_COUNT = 8
const BATCH_RENDER_COUNT = 4
const BATCH_RENDER_DELAY = 260

const THUMBNAIL_TIMEOUT = 9000
const MAX_THUMBNAIL_RETRY = 2

function getVideoSrc(post: PostItem) {
  return post.videoUrl || (post as any).video_url || ''
}

function getPreviewImage(post: PostItem) {
  const preview =
    post.thumbnailUrl ||
    post.thumbnail_url ||
    (post as any).thumbnail ||
    (post as any).poster_url ||
    (post as any).cover_url ||
    post.images?.[0] ||
    ''

  if (
    preview.endsWith('.mp4') ||
    preview.endsWith('.mov') ||
    preview.includes('/short-videos/')
  ) {
    return ''
  }

  return preview
}

function NormalImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  return (
    <img
      src={failed ? FALLBACK_IMAGE : src || FALLBACK_IMAGE}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}

function VideoPreview({ post }: { post: PostItem }) {
  const previewImage = getPreviewImage(post)

  const [displaySrc, setDisplaySrc] = useState(previewImage || FALLBACK_IMAGE)
  const [imageReady, setImageReady] = useState(false)
  const [imageFailed, setImageFailed] = useState(!previewImage)

  const retryRef = useRef(0)
  const timeoutRef = useRef<number | null>(null)

  function clearTimer() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  function retryThumbnail() {
    if (!previewImage) {
      setImageFailed(true)
      setDisplaySrc(FALLBACK_IMAGE)
      return
    }

    if (retryRef.current >= MAX_THUMBNAIL_RETRY) {
      setImageFailed(true)
      setDisplaySrc(FALLBACK_IMAGE)
      return
    }

    retryRef.current += 1

    const nextSrc = `${previewImage}${
      previewImage.includes('?') ? '&' : '?'
    }retry=${Date.now()}`

    const img = new Image()

    img.onload = () => {
      clearTimer()
      setDisplaySrc(nextSrc)
      setImageReady(true)
      setImageFailed(false)
    }

    img.onerror = () => {
      window.setTimeout(retryThumbnail, 1200 * retryRef.current)
    }

    img.src = nextSrc
  }

  useEffect(() => {
    clearTimer()

    retryRef.current = 0
    setImageReady(false)
    setImageFailed(!previewImage)
    setDisplaySrc(previewImage || FALLBACK_IMAGE)

    if (previewImage) {
      timeoutRef.current = window.setTimeout(() => {
        retryThumbnail()
      }, THUMBNAIL_TIMEOUT)
    }

    return () => {
      clearTimer()
    }
  }, [previewImage])

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#15151a]">
      <img
        src={imageFailed ? FALLBACK_IMAGE : displaySrc}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          imageReady ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => {
          clearTimer()
          setImageReady(true)
        }}
        onError={retryThumbnail}
      />

      {!imageReady && (
        <div className="absolute inset-0 bg-[#17171d]">
          <div className="h-full w-full animate-pulse bg-white/[0.035]" />
        </div>
      )}
    </div>
  )
}

const FeedCard = memo(function FeedCard({
  post,
  index,
  isReported,
  onOpenPost,
}: {
  post: PostItem
  index: number
  isReported: boolean
  onOpenPost?: (post: PostItem) => void
}) {
  const isVideo = Boolean(getVideoSrc(post) || post.type === 'video')
  const previewImage = getPreviewImage(post)

  return (
    <motion.button
      type="button"
      key={`${post.type || 'post'}-${post.id}-${index}`}
      onClick={() => onOpenPost?.(post)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="relative h-[280px] w-full overflow-hidden rounded-[6px] border border-[var(--app-card-border)] bg-black"
    >
      {isVideo ? (
        <>
          <div
            className={`h-full w-full ${
              isReported ? 'blur-xl opacity-60' : ''
            }`}
          >
            <VideoPreview post={post} />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-black/10" />

          <div className="pointer-events-none absolute right-[10px] top-[10px] z-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="h-[20px] w-[20px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]"
            >
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          </div>
        </>
      ) : (
        <>
          {post.images?.length > 1 && (
            <div className="pointer-events-none absolute right-[10px] top-[10px] z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="h-[20px] w-[20px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]"
              >
                <rect
                  x="7"
                  y="5"
                  width="11"
                  height="11"
                  rx="2"
                  stroke="white"
                  strokeWidth="2"
                />
                <rect
                  x="4"
                  y="8"
                  width="11"
                  height="11"
                  rx="2"
                  stroke="white"
                  strokeWidth="2"
                />
              </svg>
            </div>
          )}

          <div
            className={`h-full w-full ${
              isReported ? 'blur-xl opacity-60' : ''
            }`}
          >
            <NormalImage
              src={previewImage || FALLBACK_IMAGE}
              alt={post.author || 'Vibelink post'}
            />
          </div>
        </>
      )}

      {isReported && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/45 px-4 text-center text-[14px] font-medium text-white">
          已檢舉，內容已隱藏
        </div>
      )}
    </motion.button>
  )
})

function FeedGrid({
  posts = [],
  reportedPostIds = [],
  reportedVideoIds = [],
  onOpenPost,
}: FeedGridProps) {
  const [renderCount, setRenderCount] = useState(INITIAL_RENDER_COUNT)

  useEffect(() => {
    setRenderCount(INITIAL_RENDER_COUNT)

    let cancelled = false
    let current = INITIAL_RENDER_COUNT
    const maxCount = Math.min(MOBILE_SAFE_INITIAL_LIMIT, posts.length)

    function loadNextBatch() {
      if (cancelled) return

      current = Math.min(current + BATCH_RENDER_COUNT, maxCount)
      setRenderCount(current)

      if (current < maxCount) {
        window.setTimeout(loadNextBatch, BATCH_RENDER_DELAY)
      }
    }

    const timer = window.setTimeout(loadNextBatch, BATCH_RENDER_DELAY)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [posts])

  const visiblePosts = useMemo(() => {
    return posts.slice(0, renderCount)
  }, [posts, renderCount])

  if (visiblePosts.length === 0) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="feed-2x2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-2 gap-[3px]"
      >
        {visiblePosts.map((post, index) => (
          <FeedCard
            key={`${post.type || 'post'}-${post.id}-${index}`}
            post={post}
            index={index}
            isReported={
              Boolean(getVideoSrc(post) || post.type === 'video')
                ? reportedVideoIds.includes(post.id)
                : reportedPostIds.includes(post.id)
            }
            onOpenPost={onOpenPost}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

export default memo(FeedGrid)
