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
  thumbnailUrl?: string
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
          const image =
  post.thumbnailUrl ||
  post.images?.[0] ||
  ''

          return (
            <motion.button
              type="button"
              layout
              key={post.id}
              onClick={() => onOpenPost?.(post)}
              className="relative h-[280px] w-full overflow-hidden rounded-[6px] bg-[#dddddd]"
            >
              {post.videoUrl ? (
  <>
    {image ? (
  <img
    src={image}
    alt={post.author}
    className="h-full w-full object-cover"
    draggable={false}
    onError={(e) => {
      e.currentTarget.style.display = 'none'
    }}
  />
) : (
  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1f1f1f] via-[#3a3a3a] to-[#111111]">
    <div className="text-[13px] font-semibold text-white/70">
      Vibe Video
    </div>
  </div>
)}

    <div className="pointer-events-none absolute inset-0 bg-black/5" />

    <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/45 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
      ▶
    </div>
  </>
) : image ? (
  <img
    src={image}
    alt={post.author}
    className="h-full w-full object-cover"
    draggable={false}
    onError={(e) => {
      e.currentTarget.style.display = 'none'
    }}
  />
) : (
  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1f1f1f] via-[#3a3a3a] to-[#111111]">
    <div className="text-[13px] font-semibold text-white/70">
      Vibe Video
    </div>
    </div>
)}
            </motion.button>
          )
        })}
      </motion.div>
    </AnimatePresence>
  )
}