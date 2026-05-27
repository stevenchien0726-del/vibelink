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
  onOpenPost?: (post: PostItem) => void
  onOpenComments?: (post: PostItem) => void
  onOpenShare?: (post: PostItem) => void
  onDeletePost?: (post: PostItem) => void
  onOpenProfile?: (post: PostItem) => void
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'

const MOBILE_SAFE_INITIAL_LIMIT = 24

function getVideoSrc(post: PostItem) {
  return post.videoUrl || (post as any).video_url || ''
}

function getPreviewImage(post: PostItem) {
  return (
    post.thumbnailUrl ||
    post.thumbnail_url ||
    (post as any).thumbnail ||
    (post as any).poster_url ||
    (post as any).cover_url ||
    post.images?.[0] ||
    ''
  )
}

function NormalImage({
  src,
  alt,
}: {
  src: string
  alt: string
}) {
  const [failed, setFailed] = useState(false)

  return (
    <img
      src={failed ? FALLBACK_IMAGE : src}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}

function VideoPreview({
  post,
}: {
  post: PostItem
}) {
  const previewImage = getPreviewImage(post)
  const videoSrc = getVideoSrc(post)

  const [displaySrc, setDisplaySrc] = useState(previewImage || '')
  const [imageReady, setImageReady] = useState(false)
  const [imageFailed, setImageFailed] = useState(!previewImage)
  const [videoReady, setVideoReady] = useState(false)

  const retryRef = useRef(0)

  useEffect(() => {
    setDisplaySrc(previewImage || '')
    setImageReady(false)
    setImageFailed(!previewImage)
    setVideoReady(false)
    retryRef.current = 0
  }, [previewImage, videoSrc])

  function retryLoadImage() {
    if (!previewImage) {
      setImageFailed(true)
      return
    }

    if (retryRef.current >= 3) {
      setImageFailed(true)
      return
    }

    retryRef.current += 1

    const nextSrc = `${previewImage}${
      previewImage.includes('?') ? '&' : '?'
    }retry=${Date.now()}`

    const img = new Image()

    img.onload = () => {
      setDisplaySrc(nextSrc)
      setImageReady(true)
      setImageFailed(false)
    }

    img.onerror = () => {
      window.setTimeout(retryLoadImage, 700 * retryRef.current)
    }

    img.src = nextSrc
  }

  const showImage = displaySrc && !imageFailed
  const showVideo = imageFailed && videoSrc

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#15151a]">
      {showImage && (
        <img
          src={displaySrc}
          alt=""
          loading="eager"
          decoding="async"
          draggable={false}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            imageReady ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageReady(true)}
          onError={retryLoadImage}
        />
      )}

      {showVideo && (
        <video
          src={videoSrc}
          muted
          playsInline
          preload="metadata"
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
          onLoadedData={() => setVideoReady(true)}
          onCanPlay={() => setVideoReady(true)}
        />
      )}

      {!imageReady && !videoReady && (
        <div className="absolute inset-0 bg-[#17171d]">
          <div className="h-full w-full animate-pulse bg-white/[0.035]" />
        </div>
      )}
    </div>
  )
}

function FeedGrid({ posts = [], onOpenPost }: FeedGridProps) {
  const visiblePosts = useMemo(() => {
    return posts.slice(0, MOBILE_SAFE_INITIAL_LIMIT)
  }, [posts])

  if (visiblePosts.length === 0) return null

  const preloadVideos = visiblePosts
  .filter(
    (post) =>
      Boolean(getVideoSrc(post) || post.type === 'video')
  )
  .slice(0, 4)

  const preloadImages = visiblePosts
  .filter(
    (post) =>
      !Boolean(getVideoSrc(post) || post.type === 'video')
  )
  .flatMap((post) => post.images?.slice(0, 2) ?? [])
  .filter(Boolean)
  .slice(0, 10)

  return (
    <AnimatePresence mode="wait">

      <div className="hidden">
  {preloadVideos.map((post) => {
    const videoSrc = getVideoSrc(post)

    if (!videoSrc) return null

    return (
      <video
        key={`feed-preload-video-${post.id}`}
        src={videoSrc}
        muted
        playsInline
        preload="metadata"
      />
    )
  })}

  {preloadImages.map((src, index) => (
    <img
      key={`feed-preload-image-${index}-${src}`}
      src={src}
      alt=""
      loading="eager"
      decoding="async"
    />
  ))}
</div>
       
      <motion.div
        key="feed-2x2"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -14, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="grid grid-cols-2 gap-[3px]"
      >
        {visiblePosts.map((post, index) => {
          const isVideo = Boolean(getVideoSrc(post) || post.type === 'video')
          const previewImage = getPreviewImage(post)

          return (
            <motion.button
              type="button"
              layout
              key={`${post.type || 'post'}-${post.id}-${index}`}
              onClick={() => onOpenPost?.(post)}
              className="relative h-[280px] w-full overflow-hidden rounded-[6px] border border-[var(--app-card-border)] bg-black"
            >
              {isVideo ? (
                <>
                  <VideoPreview post={post} />

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

                  <NormalImage
                    src={previewImage || FALLBACK_IMAGE}
                    alt={post.author || 'Vibelink post'}
                  />
                </>
              )}
            </motion.button>
          )
        })}
      </motion.div>
    </AnimatePresence>
  )
}

export default memo(FeedGrid)