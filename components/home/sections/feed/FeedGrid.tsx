'use client'

import { memo, useEffect, useMemo, useState } from 'react'
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

function getPostPreviewImage(post: PostItem) {
  return (
    post.thumbnailUrl ||
    post.thumbnail_url ||
    post.images?.[0] ||
    FALLBACK_IMAGE
  )
}

function RetryImage({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const [retryKey, setRetryKey] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [failedCount, setFailedCount] = useState(0)

  useEffect(() => {
    setLoaded(false)
    setFailedCount(0)
    setRetryKey(0)
  }, [src])

  useEffect(() => {
    if (!src || loaded || failedCount >= 3) return

    const timer = window.setTimeout(() => {
      if (!loaded) {
        setRetryKey((v) => v + 1)
        setFailedCount((v) => v + 1)
      }
    }, 3500)

    return () => window.clearTimeout(timer)
  }, [src, retryKey, loaded, failedCount])

  const safeSrc =
    failedCount >= 3
      ? FALLBACK_IMAGE
      : `${src}${src.includes('?') ? '&' : '?'}retry=${retryKey}`

  return (
    <img
      key={`${src}-${retryKey}`}
      src={safeSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      draggable={false}
      onLoad={() => {
        setLoaded(true)
      }}
      onError={() => {
        if (failedCount < 3) {
          window.setTimeout(() => {
            setRetryKey((v) => v + 1)
            setFailedCount((v) => v + 1)
          }, 800)
        } else {
          setLoaded(true)
        }
      }}
    />
  )
}

function FeedGrid({ posts = [], onOpenPost }: FeedGridProps) {
  const visiblePosts = useMemo(() => posts.slice(0, 40), [posts])

  if (visiblePosts.length === 0) return null

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
        {visiblePosts.map((post) => {
          const image = getPostPreviewImage(post)
          const isVideoPreview = Boolean(post.videoUrl && image === post.videoUrl)

          return (
            <motion.button
              type="button"
              layout
              key={post.id}
              onClick={() => onOpenPost?.(post)}
              className="relative h-[280px] w-full overflow-hidden rounded-[6px] border border-[var(--app-card-border)] bg-[var(--app-card)]"
            >
              {!post.videoUrl && post.images?.length > 1 && (
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

              {post.videoUrl ? (
                <>
                  {isVideoPreview ? (
                    <video
                      src={post.videoUrl}
                      preload="metadata"
                      muted
                      playsInline
                      poster={post.thumbnailUrl || post.thumbnail_url || undefined}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <RetryImage
                      src={image}
                      alt={post.author || 'Vibelink video'}
                      className="h-full w-full object-cover"
                    />
                  )}

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
                <RetryImage
                  src={image}
                  alt={post.author || 'Vibelink post'}
                  className="h-full w-full object-cover"
                />
              )}
            </motion.button>
          )
        })}
      </motion.div>
    </AnimatePresence>
  )
}

export default memo(FeedGrid)