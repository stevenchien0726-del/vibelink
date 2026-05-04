'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  animate,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import SearchPage from '@/pages/SearchPage'
import PeopleLibraryPage from '@/components/home/sections/people/PeopleLibraryPage'
import UploadFullPage from '@/components/home/sections/upload/UploadFullPage'
import type { CapsulePosition } from '@/app/page'
import AIStoryRow from '@/components/AIStoryRow'

import {
  Bell,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  ChevronLeft,
  MoreHorizontal,
} from 'lucide-react'

import FeedGrid, { type FeedMode, type PostItem } from '@/components/home/sections/feed/FeedGrid'

import { supabase } from '@/lib/supabase'

import { ensureUserProfile } from '@/lib/profile'

type StoryItem = {
  id: string
  author: string
}

type HomePageProps = {
  feedCapsulePosition: CapsulePosition
}

type CreatedPostPayload = {
  id: string
  caption: string
  imageUrl: string
  imageUrls: string[]
}

type CommentItem = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles?: {
    display_name?: string | null
    username?: string | null
    avatar_url?: string | null
  } | null
}

const mockPosts: PostItem[] = [
  {
    id: 'p1',
    author: 'Sky.07_21',
    text: 'HI 大家好，今天是開心的一天',
    likes: 50,
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
    ],
    aiTags: ['自然感', '戶外', '療癒'],
  },
  {
    id: 'p2',
    author: 'Ryan_88',
    text: '今天的配對牆先放生活照。',
    likes: 27,
    images: [
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1200&q=80',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
    ],
    aiTags: ['森林感', '清新', '安靜感'],
  },
  {
    id: 'p3',
    author: 'Leo_wave',
    text: '晚上想找人聊天。',
    likes: 13,
    images: [
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
      'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=1200&q=80',
    ],
    aiTags: ['山景', '放鬆感', '自然系'],
  },
  {
    id: 'p4',
    author: 'Ace_02',
    text: '新照片更新。',
    likes: 64,
    images: [
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80',
      'https://images.unsplash.com/photo-1492447166138-50c3889fccb1?w=1200&q=80',
    ],
    aiTags: ['生活感', '戶外', '舒服感'],
  },
  {
    id: 'p5',
    author: 'Mason_v',
    text: '來交朋友。',
    likes: 32,
    images: [
      'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=1200&q=80',
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
    ],
    aiTags: ['自然', '慢節奏', '療癒'],
  },
  {
    id: 'p6',
    author: 'Jay_noir',
    text: '週末想出去走走。',
    likes: 18,
    images: [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
    ],
    aiTags: ['旅行', '風景', '自由感'],
  },
]

const mockStories: StoryItem[] = [
  { id: 's1', author: 'Sky.07_21' },
  { id: 's2', author: 'Ryan_88' },
  { id: 's3', author: 'Leo_wave' },
]

const storyPagesMap: Record<string, { title: string; bg: string }[]> = {
  s1: [
    { title: 'Sky 第1頁', bg: '#cfa2cc' },
    { title: 'Sky 第2頁', bg: '#c79ad2' },
    { title: 'Sky 第3頁', bg: '#d8aed8' },
  ],
  s2: [
    { title: 'Ryan 第1頁', bg: '#c9a3d2' },
    { title: 'Ryan 第2頁', bg: '#d4b1d8' },
    { title: 'Ryan 第3頁', bg: '#c89bc8' },
  ],
  s3: [
    { title: 'Leo 第1頁', bg: '#d2abd0' },
    { title: 'Leo 第2頁', bg: '#c59bc7' },
    { title: 'Leo 第3頁', bg: '#d8b7db' },
  ],
}

export default function HomePage({
  feedCapsulePosition,
}: HomePageProps) {
  

  const [toast, setToast] = useState<string | null>(null)

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  
  const [feedMode, setFeedMode] = useState<FeedMode>('1x1')
  const [realPosts, setRealPosts] = useState<PostItem[]>([])
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null)

  const [commentSheetPost, setCommentSheetPost] = useState<PostItem | null>(null)

const [selectedPostLiked, setSelectedPostLiked] = useState(false)
const [selectedPostSaved, setSelectedPostSaved] = useState(false)
const [selectedPostLikeCount, setSelectedPostLikeCount] = useState(0)

const [comments, setComments] = useState<CommentItem[]>([])
const [commentText, setCommentText] = useState('')
const [commentLoading, setCommentLoading] = useState(false)
const [currentUserId, setCurrentUserId] = useState<string | null>(null)
const [selectedComment, setSelectedComment] = useState<CommentItem | null>(null)
const [isCommentMenuOpen, setIsCommentMenuOpen] = useState(false)

const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false)

const commentSectionRef = useRef<HTMLDivElement | null>(null)

const [detailImageIndex, setDetailImageIndex] = useState(0)
const detailImageTouchStartXRef = useRef<number | null>(null)
const detailImageTouchStartYRef = useRef<number | null>(null)

const detailTouchStartXRef = useRef<number | null>(null)
  useEffect(() => {
  loadPosts()

  supabase.auth.getSession().then(async ({ data }) => {
  console.log('當前 session:', data.session)

  setCurrentUserId(data.session?.user?.id ?? null)

  if (!data.session) {
    setIsAuthModalOpen(true)
    return
  }

  setIsAuthModalOpen(false)

  const profile = await ensureUserProfile()
  console.log('目前登入者 Profile:', profile)
})

  const { data: listener } = supabase.auth.onAuthStateChange(
  async (_event, session) => {
    console.log('登入狀態變化:', session)

    if (session) {
  console.log('登入成功 ✅')
  setIsAuthModalOpen(false)

  const profile = await ensureUserProfile()
  console.log('目前登入者 Profile:', profile)
}
  }
)

  return () => {
    listener.subscription.unsubscribe()
  }
}, [])

function handlePostCreated(post: CreatedPostPayload) {
  const newPost: PostItem = {
    id: post.id,
    author: 'Vibelink User',
    text: post.caption || '',
    likes: 0,
    images: post.imageUrls?.length ? post.imageUrls : [post.imageUrl],
    aiTags: ['真實發文'],
    isMine: true,
    isSaved: false,
  }

  setRealPosts((prev) => [newPost, ...prev])

  // ✅ 顯示 Toast
  setToast('發文成功')

  // ✅ 自動關閉 Upload
  setIsUploadOpen(false)

  // ✅ 1.8 秒後消失
  setTimeout(() => {
    setToast(null)
  }, 1800)
}

  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false)
  const [isPeopleLibraryOpen, setIsPeopleLibraryOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isSearchPageOpen, setIsSearchPageOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null)
  const [storyPage, setStoryPage] = useState(0)
  const [storyProgress, setStoryProgress] = useState(0)
  const [storyDirection, setStoryDirection] = useState<
    'next' | 'prev' | 'story-next' | 'story-prev'
  >('next')
  const [isStoryPaused, setIsStoryPaused] = useState(false)
  const [isFeedCapsulePressed, setIsFeedCapsulePressed] = useState(false)
  const [isTopBarVisible, setIsTopBarVisible] = useState(true)

  const topMenuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const storyTouchStartYRef = useRef<number | null>(null)
  const storyTouchStartXRef = useRef<number | null>(null)
  const lastScrollYRef = useRef(0)
  const scrollTickingRef = useRef(false)

  const storyDragY = useMotionValue(0)
  const storyCardScale = useTransform(storyDragY, [0, 320], [1, 0.94])
  const storyCardOpacity = useTransform(storyDragY, [0, 320], [1, 0.72])
  const storyOverlayOpacity = useTransform(storyDragY, [0, 320], [1, 0.86])

  async function loadPosts() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  

  const { data, error } = await supabase
    .from('posts')
    .select(`
  id,
  caption,
  created_at,
  user_id,
      profiles (
        username,
        display_name,
        avatar_url
      ),
      post_images (
  image_url
)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('讀取 posts 失敗:', error)
    return
  }


  const postIds = (data ?? []).map((post: any) => post.id)

const { data: likeRows } = await supabase
  .from('likes')
  .select('post_id, user_id')
  .in('post_id', postIds)

const { data: savedRows } = await supabase
  .from('saved_posts')
  .select('post_id, user_id')
  .in('post_id', postIds)

const likeCountMap = new Map<string, number>()
const likedSet = new Set<string>()
const savedSet = new Set<string>()

;(likeRows ?? []).forEach((like: any) => {
  likeCountMap.set(
    like.post_id,
    (likeCountMap.get(like.post_id) ?? 0) + 1
  )

  if (like.user_id === user?.id) {
    likedSet.add(like.post_id)
  }
})

;(savedRows ?? []).forEach((saved: any) => {
  if (saved.user_id === user?.id) {
    savedSet.add(saved.post_id)
  }
})

  const mappedPosts: PostItem[] = (data ?? [])
  .map((post: any) => {
    const images = (post.post_images ?? []).map((img: any) => img.image_url)

    return {
      id: post.id,
      author:
        post.profiles?.display_name ||
        post.profiles?.username ||
        'Vibelink User',
      text: post.caption || '',
      likes: likeCountMap.get(post.id) ?? 0,
isLiked: likedSet.has(post.id),
isSaved: savedSet.has(post.id),
      images,
      aiTags: ['真實發文'],
      isMine: post.user_id === user?.id,
    }
  })
  .filter((post) => post.images.length > 0)

  setRealPosts(mappedPosts)
}
  
  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY || window.pageYOffset

      if (scrollTickingRef.current) return
      scrollTickingRef.current = true

      window.requestAnimationFrame(() => {
        const lastY = lastScrollYRef.current
        const delta = currentY - lastY

        if (currentY <= 8) {
          setIsTopBarVisible(true)
        } else if (Math.abs(delta) > 6) {
          if (delta > 0) {
            setIsTopBarVisible(false)
            setIsTopMenuOpen(false)
            setIsSearchOpen(false)
          } else {
            setIsTopBarVisible(true)
          }
        }

        lastScrollYRef.current = currentY
        scrollTickingRef.current = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeStoryViewer = useCallback(() => {
    setSelectedStory(null)
    setStoryPage(0)
    setStoryProgress(0)
    setIsStoryPaused(false)
    storyDragY.set(0)
  }, [storyDragY])

  async function handleLogin() {
  const { error } = await supabase.auth.signInWithOtp({
    email: 'stevenchien0726@gmail.com',
  })

  if (error) {
    console.error(error)
    setToast('登入信寄送失敗')
    return
  }

  setToast('登入信已寄出')
}

async function handleGoogleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })

  if (error) {
    console.error(error)
    setToast('Google 登入失敗')
  }
}

  function handleSubmitSearch() {
    const trimmed = searchText.trim()
    setSearchText(trimmed)
    setIsSearchOpen(false)
    setIsSearchPageOpen(true)
  }

function handleCycleFeedMode() {
  setIsFeedCapsulePressed(true)

  setFeedMode((prev) => {
    return prev === '1x1' ? '2x2' : '1x1'
  })

  window.setTimeout(() => {
    setIsFeedCapsulePressed(false)
  }, 320)
}

function handleDetailTouchStart(e: React.TouchEvent<HTMLDivElement>) {
  const target = e.target as HTMLElement

  if (target.closest('[data-detail-image-area="true"]')) {
    detailTouchStartXRef.current = null
    return
  }

  detailTouchStartXRef.current = e.touches[0].clientX
}

function handleDetailTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
  const startX = detailTouchStartXRef.current
  if (startX == null) return

  const endX = e.changedTouches[0].clientX
  const deltaX = endX - startX

  if (deltaX > 70) {
  setSelectedPost(null)
}

  detailTouchStartXRef.current = null
}

async function loadComments(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      user_id
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('讀取留言失敗:', error)
    return
  }

  setComments((data ?? []) as CommentItem[])
}

function openDetailPost(post: PostItem) {
  setSelectedPost(post)
  setSelectedPostLiked(!!post.isLiked)
  setSelectedPostSaved(!!post.isSaved)
  setSelectedPostLikeCount(post.likes ?? 0)
  setDetailImageIndex(0)
  setCommentText('')
  setComments([])
  loadComments(post.id)
}

function openCommentSheet(post: PostItem) {
  setCommentSheetPost(post)
  setCommentText('')
  setComments([])
  loadComments(post.id)
  setIsCommentSheetOpen(true)
}

async function toggleDetailLike() {
  const activePostId = selectedPost?.id || commentSheetPost?.id
if (!activePostId) return

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const nextLiked = !selectedPostLiked
  setSelectedPostLiked(nextLiked)
  setSelectedPostLikeCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)))

  setRealPosts((prev) =>
  prev.map((post) =>
    post.id === activePostId
      ? {
          ...post,
          isLiked: nextLiked,
          likes: Math.max(0, (post.likes ?? 0) + (nextLiked ? 1 : -1)),
        }
      : post
  )
)

  if (nextLiked) {
    await supabase.from('likes').insert({
      post_id: activePostId,
      user_id: user.id,
    })
  } else {
    await supabase
      .from('likes')
      .delete()
      .eq('post_id', activePostId)
      .eq('user_id', user.id)
  }
}

async function toggleDetailSave() {
  const activePostId = selectedPost?.id || commentSheetPost?.id
if (!activePostId) return

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const postId = activePostId
  const nextSaved = !selectedPostSaved

  setSelectedPostSaved(nextSaved)

  setRealPosts((prev) =>
    prev.map((post) =>
      post.id === postId
        ? {
            ...post,
            isSaved: nextSaved,
          }
        : post
    )
  )

  if (nextSaved) {
    await supabase.from('saved_posts').insert({
      post_id: postId,
      user_id: user.id,
    })
  } else {
    await supabase
      .from('saved_posts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)
  }
}

async function deleteComment() {
  if (!selectedComment?.id) return

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', selectedComment.id)

  if (error) {
    console.error('刪除留言失敗:', error)
    alert('刪除留言失敗，請檢查 comments DELETE RLS')
    return
  }

  setComments((prev) =>
    prev.filter((comment) => comment.id !== selectedComment.id)
  )

  setSelectedComment(null)
  setIsCommentMenuOpen(false)
}

async function submitComment() {
  
  const activePostId = selectedPost?.id || commentSheetPost?.id
if (!activePostId) return

  const text = commentText.trim()
  if (!text) return

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
  setToast('請先登入')
  setIsAuthModalOpen(true)
  return
}


  setCommentLoading(true)

  const { error } = await supabase.from('comments').insert({
    post_id: activePostId,
    user_id: user.id,
    content: text,
  })

  if (error) {
    console.error('送出留言失敗:', error)
    setCommentLoading(false)
    return
  }

  setCommentText('')
  await loadComments(activePostId)
  setCommentLoading(false)
}

function handleDetailImageTouchStart(e: React.TouchEvent<HTMLDivElement>) {
  e.stopPropagation()

  detailImageTouchStartXRef.current = e.touches[0].clientX
  detailImageTouchStartYRef.current = e.touches[0].clientY
}

function handleDetailImageTouchMove(e: React.TouchEvent<HTMLDivElement>) {
  e.stopPropagation()
  e.preventDefault()
}

function handleDetailImageTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
  e.stopPropagation()

  if (!selectedPost) return

  const startX = detailImageTouchStartXRef.current
  const startY = detailImageTouchStartYRef.current
  if (startX == null || startY == null) return

  const endX = e.changedTouches[0].clientX
  const endY = e.changedTouches[0].clientY

  const deltaX = endX - startX
  const deltaY = endY - startY

  if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX < 0) {
      setDetailImageIndex((prev) =>
        Math.min(prev + 1, selectedPost.images.length - 1)
      )
    } else {
      setDetailImageIndex((prev) => Math.max(prev - 1, 0))
    }
  }

  detailImageTouchStartXRef.current = null
  detailImageTouchStartYRef.current = null
}

  function handlePrevStoryPage() {
    if (storyPage > 0) {
      setStoryDirection('prev')
      setStoryPage((prev) => prev - 1)
      setStoryProgress(0)
      return
    }

    openPrevStory()
  }

  function openNextStory() {
    if (!selectedStory) return

    const currentStoryIndex = mockStories.findIndex(
      (story) => story.id === selectedStory.id
    )
    const nextStory = mockStories[currentStoryIndex + 1]

    if (!nextStory) {
      setSelectedStory(null)
      setStoryPage(0)
      setStoryProgress(0)
      setIsStoryPaused(false)
      return
    }

    setStoryDirection('story-next')
    setSelectedStory(nextStory)
    setStoryPage(0)
    setStoryProgress(0)
    setIsStoryPaused(false)
  }

  function openPrevStory() {
    if (!selectedStory) return

    const currentStoryIndex = mockStories.findIndex(
      (story) => story.id === selectedStory.id
    )
    const prevStory = mockStories[currentStoryIndex - 1]

    if (!prevStory) {
      setStoryPage(0)
      setStoryProgress(0)
      setIsStoryPaused(false)
      return
    }

    const prevPages = storyPagesMap[prevStory.id] || []
    const prevLastIndex = Math.max(prevPages.length - 1, 0)

    setStoryDirection('story-prev')
    setSelectedStory(prevStory)
    setStoryPage(prevLastIndex)
    setStoryProgress(0)
    setIsStoryPaused(false)
  }

  function handleNextStoryPage() {
    if (!selectedStory) return

    const pages = storyPagesMap[selectedStory.id] || []
    const lastIndex = pages.length - 1

    if (storyPage >= lastIndex) {
      openNextStory()
      return
    }

    setStoryDirection('next')
    setStoryPage((prev) => prev + 1)
    setStoryProgress(0)
  }

  function handleStoryTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0]
    storyTouchStartYRef.current = touch.clientY
    storyTouchStartXRef.current = touch.clientX
    setIsStoryPaused(true)
  }

  function handleStoryTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const startY = storyTouchStartYRef.current
    const startX = storyTouchStartXRef.current
    if (startY == null || startX == null) return

    const touch = e.touches[0]
    const deltaY = touch.clientY - startY
    const deltaX = Math.abs(touch.clientX - startX)

    if (deltaY > 0 && deltaX < 80) {
      e.preventDefault()
      storyDragY.set(deltaY)
    }
  }

  function handleStoryTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    const startY = storyTouchStartYRef.current
    const startX = storyTouchStartXRef.current

    if (startY == null || startX == null) {
      setIsStoryPaused(false)
      return
    }

    const touch = e.changedTouches[0]
    const deltaY = touch.clientY - startY
    const deltaX = Math.abs(touch.clientX - startX)

    storyTouchStartYRef.current = null
    storyTouchStartXRef.current = null
    setIsStoryPaused(false)

    if (deltaY > 140 && deltaX < 80) {
      closeStoryViewer()
      return
    }

    animate(storyDragY, 0, {
      type: 'spring',
      stiffness: 380,
      damping: 32,
      mass: 0.9,
    })
  }

  useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    const target = e.target as Node

    if (searchRef.current && !searchRef.current.contains(target)) {
      setIsSearchOpen(false)
    }

    if (topMenuRef.current && !topMenuRef.current.contains(target)) {
      setIsTopMenuOpen(false)
    }
  }

  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])

  useEffect(() => {
    if (!selectedStory) return
    if (isStoryPaused) return

    const pages = storyPagesMap[selectedStory.id] || []
    if (pages.length === 0) return

    const duration = 2500
    const intervalMs = 50
    const step = 100 / (duration / intervalMs)

    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        const next = prev + step

        if (next >= 100) {
          if (storyPage >= pages.length - 1) {
            openNextStory()
            return 0
          }

          setStoryDirection('next')
          setStoryPage((p) => p + 1)
          return 0
        }

        return next
      })
    }, intervalMs)

    return () => clearInterval(interval)
  }, [selectedStory, storyPage, isStoryPaused])

  if (isSearchPageOpen) {
    return (
      <SearchPage
        searchText={searchText}
        onBack={() => setIsSearchPageOpen(false)}
        onChangeSearchText={setSearchText}
      />
    )
  }

  return (
  <div className="relative min-h-screen w-full overflow-hidden bg-[#f5f5f5]">

    <motion.div
      className="fixed top-0 left-1/2 z-[40] h-[60px] w-full max-w-[430px] -translate-x-1/2 bg-[rgba(245,245,245,0.96)] px-[14px] py-[8px] backdrop-blur-md"
      ref={searchRef}
      animate={{
        y: isTopBarVisible || isSearchOpen ? 0 : -72,
        opacity: isTopBarVisible || isSearchOpen ? 1 : 0.92,
      }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 34,
        mass: 0.95,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isSearchOpen ? (
          <motion.div
            key="search-bar"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 28,
              mass: 0.9,
            }}
            className="flex h-full items-center gap-2"
          >
            <div className="flex h-[42px] flex-1 items-center gap-2 rounded-full border border-[#e6d8ee] bg-[#f7f1fa] px-4 shadow-[0_8px_22px_rgba(0,0,0,0.08)]">
              <button
                type="button"
                onClick={handleSubmitSearch}
                className="shrink-0 text-[#444]"
              >
                <SearchIcon />
              </button>

              <input
                autoFocus
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitSearch()
                  }
                }}
                placeholder="搜尋"
                className="w-full bg-transparent text-[16px] text-[#333] outline-none placeholder:text-[#999]"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="shrink-0 text-[15px] font-medium text-[#666]"
            >
              CLOSE
            </button>
          </motion.div>
        ) : (
          
<motion.div
  key="default-bar"
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 8 }}
  transition={{ duration: 0.18 }}
  className="relative flex h-full items-center justify-between px-4"
>
  {/* 左：logo 膠囊 + 小選單 */}
  <div className="relative" ref={topMenuRef}>
    <button
      type="button"
      onClick={() => setIsTopMenuOpen((prev) => !prev)}
      className="flex h-[38px] items-center gap-1 rounded-[12px] bg-[#e9e9e9] px-3 transition-all active:scale-[0.96] active:bg-[#dddddd]"
    >
      <img
        src="/vibelink-logo.png"
        alt="Vibelink"
        className="h-[36px] object-contain"
      />

      <motion.span
        animate={{ rotate: isTopMenuOpen ? 180 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex items-center justify-center text-[#222]"
      >
        <ChevronDownIcon />
      </motion.span>
    </button>

    <AnimatePresence>
  {isTopMenuOpen && (
    <motion.div
  initial={{ opacity: 0, scale: 0.94, y: -8 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.96, y: -6 }}
  transition={{ duration: 0.18, ease: 'easeOut' }}
  className="absolute left-0 top-[46px] z-[200] w-[200px] rounded-[20px] border border-[#e4d7ea] bg-[#f3f3f3] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.12)]"
>
  <div className="flex flex-col gap-6">
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-[16px] px-4 py-4 text-[18px] text-[#222] transition-colors active:bg-black/5"
    >
      <FollowingIcon />
      <span>追蹤中</span>
    </button>

    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-[16px] px-4 py-4 text-[18px] text-[#222] transition-colors active:bg-black/5"
    >
      <FavoriteIcon />
      <span>最愛</span>
    </button>
  </div>
</motion.div>
  )}
</AnimatePresence>
  </div>

    {/* 右：功能膠囊 */}
  <div className="flex h-[40px] items-center gap-6 rounded-full bg-[#e5e5e5] px-4 shadow-inner">

    

    <button
      type="button"
      onClick={() => setIsSearchOpen(true)}
      className="flex h-[34px] w-[34px] items-center justify-center rounded-full transition-all active:scale-[0.95] active:bg-black/5"
    >
      <SearchIcon />
    </button>

    <button
      type="button"
      onClick={() => setIsUploadOpen(true)}
      className="flex h-[34px] w-[34px] items-center justify-center rounded-full transition-all active:scale-[0.95] active:bg-black/5"
    >
      <PlusIcon />
    </button>

    <button
      type="button"
      className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-black transition-all active:scale-[0.95] active:bg-black/5"
    >
      <Bell size={20} strokeWidth={2.1} />
    </button>
  </div>
</motion.div>

            )}
      </AnimatePresence>
    </motion.div> 

    <AnimatePresence>
      {isUploadOpen && (
        <UploadFullPage
  onClose={() => setIsUploadOpen(false)}
  onPostCreated={handlePostCreated}
/>
      )}
    </AnimatePresence>

      <main className="min-h-screen box-border px- pb-[90px] pt-[64px]">
        
        <AIStoryRow />

        <section
  className="px-3 pt-3"
  data-block-page-swipe="true"
>
  <FeedGrid
  posts={realPosts}
  feedMode={feedMode}
  setFeedMode={setFeedMode}
  onOpenPost={openDetailPost}
  onOpenComments={openCommentSheet}
/>
</section>

        <div className="pointer-events-none fixed bottom-[96px] left-0 right-0 z-[24] mx-auto w-full max-w-[430px] px-4">
          <div
            className={`flex ${
              feedCapsulePosition === '左'
                ? 'justify-start'
                : feedCapsulePosition === '中'
                  ? 'justify-center'
                  : 'justify-end'
            }`}
          >
            <button
              type="button"
              onClick={handleCycleFeedMode}
              className="pointer-events-auto flex h-[35px] min-w-[85px] items-center justify-center gap-[5px] rounded-full border border-white/40 bg-gray-200/60 text-[#444] shadow-[0_6px_16px_rgba(0,0,0,0.08)] backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: isFeedCapsulePressed ? 'scale(1.06)' : 'scale(1)',
                transformOrigin: 'center center',
              }}
            >
              <GridIcon />
              <span className="whitespace-nowrap text-[12px] font-semibold text-[#555]">
                {feedMode}
              </span>
            </button>
          </div>
        </div>
      </main>

<AnimatePresence>
  {selectedPost && (
    <motion.div
  data-block-page-swipe="true"
  className="fixed inset-0 z-[700] overflow-x-hidden bg-[#f3f3f3]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 360, damping: 34 }}
      onTouchStart={handleDetailTouchStart}
      onTouchEnd={handleDetailTouchEnd}
    >
      <div className="mx-auto h-full w-full max-w-[430px] overflow-x-hidden overflow-y-auto pb-[110px]">
        <div className="sticky top-0 z-[20] flex h-[56px] items-center justify-between bg-[#f3f3f3]/95 px-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setSelectedPost(null)}
            className="flex h-10 w-10 items-center justify-center rounded-full active:scale-90"
          >
            <ChevronLeft size={26} />
          </button>

          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-full px-2 active:scale-95"
          >
            <MoreHorizontal size={22} strokeWidth={2.4} />
            <span className="text-[15px] font-medium">MENU</span>
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          <div className="h-[34px] w-[34px] rounded-full bg-[#d6d6d6]" />
          <div className="text-[15px] font-medium text-[#222]">
            {selectedPost.author}
          </div>
        </div>

        <div
  data-detail-image-area="true"
  data-block-page-swipe="true"
  className="px-3"
  style={{ touchAction: 'pan-y' }}
  onTouchStart={handleDetailImageTouchStart}
  onTouchMove={handleDetailImageTouchMove}
  onTouchEnd={handleDetailImageTouchEnd}
>
  <div className="relative w-full aspect-square overflow-hidden rounded-[18px] bg-[#ddd]">
    <motion.div
  className="flex h-full w-full"
  animate={{ x: `-${detailImageIndex * 100}%` }}
  transition={{ type: 'spring', stiffness: 360, damping: 34 }}
>
      {selectedPost.images.map((image, index) => (
        <div
  key={`${selectedPost.id}-detail-${index}`}
  className="w-full shrink-0 h-full"
>
          <img
  src={image}
  className="block h-full w-full object-cover"
  draggable={false}
/>
        </div>
      ))}
    </motion.div>

    {selectedPost.images.length > 1 && (
      <div className="absolute right-3 top-3 rounded-full bg-black/20 px-3 py-1 text-[14px] text-[#444] backdrop-blur-sm">
        {detailImageIndex + 1}/{selectedPost.images.length}
      </div>
    )}
  </div>

  {selectedPost.images.length > 1 && (
    <div className="mt-2 flex justify-center gap-2">
      {selectedPost.images.map((_, index) => (
        <span
          key={index}
          className={`h-[7px] w-[7px] rounded-full ${
            detailImageIndex === index ? 'bg-[#c86cff]' : 'bg-[#ddd]'
          }`}
        />
      ))}
    </div>
  )}
</div>

        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-5">
            <button onClick={toggleDetailLike} className="flex items-center gap-1.5 active:scale-90">
  <Heart
    size={25}
    color="#c86cff"
    fill={selectedPostLiked ? '#c86cff' : 'none'}
  />
  <span className="text-[15px] text-[#555]">{selectedPostLikeCount}</span>
</button>

            <button className="active:scale-90">
              <MessageCircle size={25} strokeWidth={2.1} />
            </button>
          </div>

          <div className="flex items-center gap-5">
            <button
  onClick={() => {
    commentSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }}
  className="active:scale-90"
>
  <MessageCircle size={25} strokeWidth={2.1} />
</button>

            <button onClick={toggleDetailSave} className="active:scale-90">
  <Bookmark
    size={25}
    color="#c86cff"
    fill={selectedPostSaved ? '#c86cff' : 'none'}
    strokeWidth={2.1}
  />
</button>
          </div>
        </div>

        {selectedPost.text && (
          <div className="px-4 pt-3 text-[15px] text-[#222]">
            {selectedPost.text}
          </div>
        )}

          <div
  ref={commentSectionRef}
  className="mt-5 border-t border-[#ddd] px-4 pt-4"
>
  <div className="mb-4 text-[15px] font-medium text-[#222]">
    留言
  </div>

  <div className="mb-4 flex gap-2">
    <input
      value={commentText}
      onChange={(e) => setCommentText(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') submitComment()
      }}
      placeholder="新增留言..."
      className="h-[42px] flex-1 rounded-full border border-[#ddd] bg-white px-4 text-[14px] text-[#222] outline-none"
    />

    <button
      type="button"
      onClick={submitComment}
      disabled={commentLoading || !commentText.trim()}
      className={`h-[42px] rounded-full px-4 text-[14px] font-medium ${
        commentText.trim()
          ? 'bg-[#c86cff] text-white'
          : 'bg-[#e5e5e5] text-[#999]'
      }`}
    >
      送出
    </button>
  </div>

  {comments.length === 0 ? (
    <div className="text-[14px] text-[#999]">
      尚無留言，成為第一個留言的人
    </div>
  ) : (
    <div className="flex flex-col gap-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
  <div className="h-[32px] w-[32px] rounded-full bg-[#d6d6d6]" />

  <div className="flex-1">
    <div className="text-[13px] font-medium text-[#222]">
      Vibelink User
    </div>

    <div className="mt-1 text-[14px] text-[#444]">
      {comment.content}
    </div>
  </div>

  <button
    type="button"
    onClick={() => {
      setSelectedComment(comment)
      requestAnimationFrame(() => {
        setIsCommentMenuOpen(true)
      })
    }}
    className="mr-[-6px] mt-[2px] flex h-[36px] w-[36px] items-center justify-center rounded-full active:scale-90"
  >
    <MoreHorizontal size={20} strokeWidth={2.2} />
  </button>
</div>
      ))}
    </div>
  )}
</div>
      </div>
      
    </motion.div>
  )}
</AnimatePresence>

      <AnimatePresence>
        {isPeopleLibraryOpen && (
          <PeopleLibraryPage
            query="People Library"
            onClose={() => setIsPeopleLibraryOpen(false)}
          />
        )}
      </AnimatePresence>


<AnimatePresence>
  {isAuthModalOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="w-full max-w-[340px] rounded-[28px] bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 text-center">
          <img
            src="/vibelink-logo.png"
            alt="Vibelink"
            className="mx-auto mb-3 h-[48px]"
          />
          <h2 className="text-[22px] font-semibold text-[#222]">
            登入 Vibelink
          </h2>
          <p className="mt-2 text-[14px] text-[#777]">
            登入後即可發文與使用完整功能
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex h-[48px] w-full items-center justify-center gap-3 rounded-full border border-[#ddd] bg-white text-[15px] font-medium text-[#222] shadow-sm active:scale-[0.97]"
        >
          GOOGLE 帳戶登入
        </button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

<AnimatePresence>
  {isCommentSheetOpen && commentSheetPost && (
    <>
      <motion.div
        className="fixed inset-0 z-[760] bg-black/20"
        onClick={() => {
  setIsCommentSheetOpen(false)
  setCommentSheetPost(null)
}}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="fixed bottom-0 left-1/2 z-[770] flex max-h-[78vh] w-full max-w-[430px] -translate-x-1/2 flex-col rounded-t-[26px] bg-[#f3f3f3] px-4 pt-4 pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.12)]"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        <div className="mb-3 flex justify-center">
          <div className="h-[4px] w-[42px] rounded-full bg-[#bbb]" />
        </div>

        <div className="mb-4 text-center text-[16px] font-medium text-[#222]">
          留言
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          {comments.length === 0 ? (
            <div className="pt-4 text-[14px] text-[#999]">
              尚無留言，成為第一個留言的人
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="h-[32px] w-[32px] rounded-full bg-[#d6d6d6]" />

                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-[#222]">
                      Vibelink User
                    </div>
                    <div className="mt-1 text-[14px] text-[#444]">
                      {comment.content}
                    </div>
                  </div>

                  <div className="relative">
  <button
    type="button"
    onClick={() => {
      setSelectedComment(comment)
      setIsCommentMenuOpen((prev) =>
        selectedComment?.id === comment.id ? !prev : true
      )
    }}
    className="mr-[-6px] mt-[2px] flex h-[36px] w-[36px] items-center justify-center rounded-full active:scale-90"
  >
    <MoreHorizontal size={20} strokeWidth={2.2} />
  </button>

  <AnimatePresence>
    {isCommentMenuOpen && selectedComment?.id === comment.id && (
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -4 }}
        transition={{ duration: 0.16 }}
        className="absolute right-1 top-[34px] z-[950] w-[132px] overflow-hidden rounded-[16px] border border-[#ddd] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
      >
        {comment.user_id === currentUserId ? (
          <button
            type="button"
            onClick={deleteComment}
            className="flex h-[44px] w-full items-center justify-center text-[14px] font-medium text-red-500 active:bg-black/5"
          >
            刪除留言
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              alert('已收到檢舉')
              setIsCommentMenuOpen(false)
              setSelectedComment(null)
            }}
            className="flex h-[44px] w-full items-center justify-center text-[14px] font-medium text-[#222] active:bg-black/5"
          >
            檢舉留言
          </button>
        )}
      </motion.div>
    )}
  </AnimatePresence>
</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-[#ddd] pt-3">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitComment()
            }}
            placeholder="新增留言..."
            className="h-[42px] flex-1 rounded-full border border-[#ddd] bg-white px-4 text-[14px] text-[#222] outline-none"
          />

          <button
            type="button"
            onClick={submitComment}
            disabled={commentLoading || !commentText.trim()}
            className={`h-[42px] rounded-full px-4 text-[14px] font-medium ${
              commentText.trim()
                ? 'bg-[#c86cff] text-white'
                : 'bg-[#e5e5e5] text-[#999]'
            }`}
          >
            送出
          </button>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>

<AnimatePresence>
  {toast && (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.96 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
      className="fixed bottom-[110px] left-1/2 z-[999] -translate-x-1/2"
    >
      <div className="rounded-full bg-black/80 px-5 py-2 text-[14px] text-white shadow-lg backdrop-blur-md">
        {toast}
      </div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M20 20l-3.2-3.2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FollowingIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6.5 18c1-2.8 3.3-4.2 5.5-4.2s4.5 1.4 5.5 4.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FavoriteIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.5L12 16.8 7.2 19l.9-5.5-3.9-3.8 5.4-.8L12 4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="5" y="14" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="14" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 19c1.1-3 3.6-4.5 6.5-4.5s5.4 1.5 6.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16v10H4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M5 8l7 6 7-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}