'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

import type { Locale } from '@/i18n'

import ShareSheet from '@/components/ShareSheet'

import ShortVideoFullPage from '@/components/home/sections/feed/ShortVideoFullPage'

import {
  MoreHorizontal,
} from 'lucide-react'

import type { PostItem } from '@/components/home/sections/feed/FeedGrid'
import OtherUserProfilePage from '@/components/profile/OtherUserProfilePage'

import { supabase } from '@/lib/supabase'

import NotificationsPage from '@/components/profile/NotificationsPage'
import HomeTopBar from '@/src/components/home/homepage/HomeTopBar'
import HomeFeedSection from '@/src/components/home/homepage/HomeFeedSection'
import HomeAuthModal from '@/src/components/home/homepage/HomeAuthModal'
import HomeDetailPostModal from '@/src/components/home/homepage/HomeDetailPostModal'
import { useHomeFeed } from '@/src/components/home/homepage/useHomeFeed'

type StoryItem = {
  id: string
  author: string
}

type HomePageProps = {
  locale: Locale
}

type CreatedPostPayload = {
  id: string
  user_id?: string

  author?: string

  caption: string

  likes?: number

  imageUrl: string
  imageUrls: string[]

  aiTags?: string[]
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
  locale,
}: HomePageProps) {

  const [toast, setToast] = useState<string | null>(null)

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null)
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null)

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

const detailLastTapTimeRef = useRef(0)

const [isShareSheetOpen, setIsShareSheetOpen] = useState(false)

const [isDetailMenuOpen, setIsDetailMenuOpen] = useState(false)

const [isShortVideoPageOpen, setIsShortVideoPageOpen] = useState(false)
const [shortVideoStartId, setShortVideoStartId] = useState<string | undefined>()

const detailTouchStartXRef = useRef<number | null>(null)
const {
  realPosts,
  setRealPosts,
  realVideos,
  setRealVideos,
  mockSavedPostIds,
  setMockSavedPostIds,
  isLoadingShortVideosRef,
  safeTask,
  delay,
  loadPosts,
  loadShortVideos,
  mergedPosts,
  shortVideoPosts,
unreadNotificationCount,
setUnreadNotificationCount,
loadUnreadNotificationCount,
} = useHomeFeed({
  setIsAuthModalOpen,
  setCurrentUserId,
  setToast,
})
function handlePostCreated(post: CreatedPostPayload) {
  const newPost: PostItem = {
    id: post.id,
    user_id: post.user_id,

    author: post.author || 'You',
    text: post.caption || '',
    likes: post.likes ?? 0,

    images: post.imageUrls?.length ? post.imageUrls : [post.imageUrl],

    aiTags: post.aiTags ?? [],
    type: 'post',

    isMine: true,
    isLiked: false,
    isSaved: false,
  }

  setRealPosts((prev) => [newPost, ...prev])

  setToast('發文成功')
  setIsUploadOpen(false)

  setTimeout(() => {
    setToast(null)
  }, 1800)
}

  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false)
  const [isFavoriteFeedOpen, setIsFavoriteFeedOpen] = useState(false)
  const [isFollowingFeedOpen, setIsFollowingFeedOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

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

  const [detailBigHeartVisible, setDetailBigHeartVisible] = useState(false)

async function handleDeletePost(post: PostItem) {
  if (!post.id) return

  const { error } = await supabase
    .from(post.videoUrl ? 'short_videos' : 'posts')
    .delete()
    .eq('id', post.id)

  if (error) {
    console.error('刪除失敗:', error)
    return
  }

  if (post.videoUrl || post.type === 'video') {
  setRealVideos((prev) => prev.filter((p) => p.id !== post.id))
  return
}

setRealPosts((prev) => prev.filter((p) => p.id !== post.id))
}

async function createShortVideoLikeNotification(
  post: PostItem,
  actorUserId: string
) {
  if (!post.user_id) return
  if (post.user_id === actorUserId) return
  const duplicated = await hasRecentNotification({
  recipientUserId: post.user_id,
  actorUserId,
  type: 'like',
  shortVideoId: post.id,
})

if (duplicated) return


  await supabase.from('notifications').insert({
    recipient_user_id: post.user_id,
    actor_user_id: actorUserId,

    type: 'like',

    post_id: null,
    short_video_id: post.id,

    title: '有人按讚了你的短影片',
    body: `${post.author || '你的短影片'} 收到新的按讚`,

    is_read: false,
  })
}

async function toggleShortVideoLike(post: PostItem) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const isLiked = !!post.isLiked
  const nextLiked = !isLiked

  setRealVideos((prev) =>
    prev.map((item) =>
      item.id === post.id
        ? {
            ...item,
            isLiked: nextLiked,
            likes: Math.max(0, (item.likes ?? 0) + (nextLiked ? 1 : -1)),
          }
        : item
    )
  )

  if (isLiked) {
    await supabase
      .from('short_video_likes')
      .delete()
      .eq('short_video_id', post.id)
      .eq('user_id', user.id)

    return
  }

  await supabase.from('short_video_likes').insert({
  short_video_id: post.id,
  user_id: user.id,
})

void createShortVideoLikeNotification(post, user.id)
}

async function toggleShortVideoSave(post: PostItem) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const isSaved = !!post.isSaved
  const nextSaved = !isSaved

  setRealVideos((prev) =>
    prev.map((item) =>
      item.id === post.id
        ? {
            ...item,
            isSaved: nextSaved,
          }
        : item
    )
  )

  if (isSaved) {
    await supabase
      .from('saved_short_videos')
      .delete()
      .eq('short_video_id', post.id)
      .eq('user_id', user.id)

    return
  }

  await supabase.from('saved_short_videos').insert({
    short_video_id: post.id,
    user_id: user.id,
  })
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

async function loadComments(postId: string, type?: 'post' | 'video') {
    if (postId.startsWith('mock-')) {
    setComments([])
    return
  }
  const tableName = type === 'video' ? 'short_video_comments' : 'comments'
  const idColumn = type === 'video' ? 'short_video_id' : 'post_id'

  const { data, error } = await supabase
    .from(tableName)
    .select(`
      id,
      content,
      created_at,
      user_id
    `)
    .eq(idColumn, postId)
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

  loadComments(post.id, post.type === 'video' || post.videoUrl ? 'video' : 'post')
}

function openCommentSheet(post: PostItem) {
  setCommentSheetPost(post)
  setCommentText('')
  setComments([])

  loadComments(post.id, post.type === 'video' || post.videoUrl ? 'video' : 'post')

  setIsCommentSheetOpen(true)
}

function handleDetailDoubleLike() {
  if (!selectedPost) return

  if (!selectedPostLiked) {
    toggleDetailLike()
  }

  setDetailBigHeartVisible(true)

  setTimeout(() => {
    setDetailBigHeartVisible(false)
  }, 700)
}

async function createLikeNotification(
  post: PostItem,
  actorUserId: string
) {
  if (!post.user_id) return

  // 不通知自己
  if (post.user_id === actorUserId) return

  const duplicated = await hasRecentNotification({
    recipientUserId: post.user_id,
    actorUserId,
    type: 'like',

    postId: post.id,
  })

  if (duplicated) return

  await supabase.from('notifications').insert({
    recipient_user_id: post.user_id,
    actor_user_id: actorUserId,

    type: 'like',

    post_id: post.id,

    title: '有人按讚了你的貼文',

    body: `${post.author || '你的貼文'} 收到新的按讚`,

    is_read: false,
  })
}

async function hasRecentNotification({
  recipientUserId,
  actorUserId,
  type,
  postId,
  shortVideoId,
}: {
  recipientUserId: string
  actorUserId: string
  type: 'like' | 'comment' | 'follow'
  postId?: string | null
  shortVideoId?: string | null
}) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  let query = supabase
    .from('notifications')
    .select('id')
    .eq('recipient_user_id', recipientUserId)
    .eq('actor_user_id', actorUserId)
    .eq('type', type)
    .gte('created_at', since)
    .limit(1)

  if (postId) query = query.eq('post_id', postId)
  if (shortVideoId) query = query.eq('short_video_id', shortVideoId)

  const { data } = await query

  return (data ?? []).length > 0
}

async function createCommentNotification(
  post: PostItem,
  actorUserId: string,
  commentText: string
) {
  if (!post.user_id) return

  // 不通知自己
  if (post.user_id === actorUserId) return

  const isVideo =
    post.type === 'video' || !!post.videoUrl

  const duplicated = await hasRecentNotification({
    recipientUserId: post.user_id,
    actorUserId,
    type: 'comment',

    postId: isVideo ? null : post.id,

    shortVideoId: isVideo ? post.id : null,
  })

  if (duplicated) return

  await supabase.from('notifications').insert({
    recipient_user_id: post.user_id,
    actor_user_id: actorUserId,

    type: 'comment',

    post_id: isVideo ? null : post.id,

    short_video_id: isVideo ? post.id : null,

    title: isVideo
      ? '有人留言了你的短影片'
      : '有人留言了你的貼文',

    body:
      commentText.length > 36
        ? `${commentText.slice(0, 36)}...`
        : commentText,

    is_read: false,
  })
}

async function toggleDetailLike() {
  const activePostId = selectedPost?.id || commentSheetPost?.id

if (!activePostId) {
  console.log('❌ 沒有 postId')
  return
}
if (!activePostId) return
if (selectedPost?.isMock) {
  const nextLiked = !selectedPostLiked

  setSelectedPostLiked(nextLiked)
  setSelectedPostLikeCount((prev) =>
    Math.max(0, prev + (nextLiked ? 1 : -1))
  )

  return
}

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

if (selectedPost) {
  void createLikeNotification(selectedPost, user.id)
}
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

  const postId = activePostId
  const nextSaved = !selectedPostSaved

  // ✅ mock 貼文不打 Supabase
  if (selectedPost?.isMock) {
    const nextSavedIds = selectedPostSaved
      ? mockSavedPostIds.filter((id) => id !== selectedPost.id)
      : [...mockSavedPostIds, selectedPost.id]

    setMockSavedPostIds(nextSavedIds)

    localStorage.setItem(
      'vibelink_mock_saved_posts',
      JSON.stringify(nextSavedIds)
    )

    setSelectedPostSaved(nextSaved)
    return
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

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
  const activePost = selectedPost || commentSheetPost
  const activePostId = activePost?.id

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

  const isVideo = activePost?.type === 'video' || !!activePost?.videoUrl

const { data: insertedComment, error } = await supabase
  .from(isVideo ? 'short_video_comments' : 'comments')
  .insert({
    [isVideo ? 'short_video_id' : 'post_id']: activePostId,
    user_id: user.id,
    content: text,
  })
  .select('id')
  .single()

  if (error) {
    console.error('送出留言失敗:', error)
    setCommentLoading(false)
    return
  }

  if (activePost) {
  void createCommentNotification(activePost, user.id, text)
}

setCommentText('')
await loadComments(activePostId, isVideo ? 'video' : 'post')
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

  const absX = Math.abs(deltaX)
const absY = Math.abs(deltaY)

const isTap = absX < 12 && absY < 12
const now = Date.now()

if (isTap) {
  if (now - detailLastTapTimeRef.current < 280) {
    handleDetailDoubleLike()
    detailLastTapTimeRef.current = 0
  } else {
    detailLastTapTimeRef.current = now
  }
}

  if (absX > 45 && absX > absY) {
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

const realVideosLengthRef = useRef(realVideos.length)
realVideosLengthRef.current = realVideos.length

const loadShortVideosRef = useRef(loadShortVideos)
loadShortVideosRef.current = loadShortVideos

const openDetailPostRef = useRef(openDetailPost)
openDetailPostRef.current = openDetailPost

const safeTaskRef = useRef(safeTask)
safeTaskRef.current = safeTask

const handleOpenFeedPost = useCallback(
  (post: PostItem) => {
    if (post.type === 'video' || post.videoUrl) {
      setShortVideoStartId(post.id)
      setIsShortVideoPageOpen(true)

      if (realVideosLengthRef.current === 0 && !isLoadingShortVideosRef.current) {
        isLoadingShortVideosRef.current = true

        void safeTaskRef.current(async () => {
          const { data } = await supabase.auth.getSession()
          const user = data.session?.user ?? null
          await loadShortVideosRef.current(user)
        }, 'lazy_load_short_videos').finally(() => {
          isLoadingShortVideosRef.current = false
        })
      }

      return
    }

    openDetailPostRef.current(post)
  },
  []
)

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
  <div
  data-auth-modal-open={isAuthModalOpen ? 'true' : 'false'}
  className="relative min-h-screen w-full overflow-x-hidden bg-[var(--app-bg)] text-[var(--app-text)]"
>

    <HomeTopBar
      isTopBarVisible={isTopBarVisible}
      isSearchOpen={isSearchOpen}
      isTopMenuOpen={isTopMenuOpen}
      searchText={searchText}
      searchRef={searchRef}
      topMenuRef={topMenuRef}
      setSearchText={setSearchText}
      setIsSearchOpen={setIsSearchOpen}
      setIsTopMenuOpen={setIsTopMenuOpen}
      setIsFollowingFeedOpen={setIsFollowingFeedOpen}
      setIsFavoriteFeedOpen={setIsFavoriteFeedOpen}
      setIsUploadOpen={setIsUploadOpen}
setIsNotificationsOpen={setIsNotificationsOpen}
unreadNotificationCount={unreadNotificationCount}
handleSubmitSearch={handleSubmitSearch}
    />

    <AnimatePresence>
      {isUploadOpen && (
        <UploadFullPage
  onClose={async () => {
  setIsUploadOpen(false)
  const { data } = await supabase.auth.getSession()
const user = data.session?.user ?? null

void safeTask(() => loadPosts(user), 'upload_reload_posts')

if (realVideos.length > 0) {
  void safeTask(() => loadShortVideos(user), 'upload_reload_short_videos')
}
}}
  onPostCreated={handlePostCreated}
/>
      )}
    </AnimatePresence>

      <HomeFeedSection
        mergedPosts={mergedPosts}
        handleOpenFeedPost={handleOpenFeedPost}
        openCommentSheet={openCommentSheet}
        setIsShareSheetOpen={setIsShareSheetOpen}
        handleDeletePost={handleDeletePost}
        setSelectedProfileUserId={setSelectedProfileUserId}
        isFollowingFeedOpen={isFollowingFeedOpen}
        setIsFollowingFeedOpen={setIsFollowingFeedOpen}
        isFavoriteFeedOpen={isFavoriteFeedOpen}
        setIsFavoriteFeedOpen={setIsFavoriteFeedOpen}
        setShortVideoStartId={setShortVideoStartId}
        setIsShortVideoPageOpen={setIsShortVideoPageOpen}
        openDetailPost={openDetailPost}
      />

<HomeDetailPostModal
  selectedPost={selectedPost}
  setSelectedPost={setSelectedPost}
  setSelectedProfileUserId={setSelectedProfileUserId}
  isDetailMenuOpen={isDetailMenuOpen}
  setIsDetailMenuOpen={setIsDetailMenuOpen}
  handleDetailTouchStart={handleDetailTouchStart}
  handleDetailTouchEnd={handleDetailTouchEnd}
  handleDetailImageTouchStart={handleDetailImageTouchStart}
  handleDetailImageTouchMove={handleDetailImageTouchMove}
  handleDetailImageTouchEnd={handleDetailImageTouchEnd}
  handleDetailDoubleLike={handleDetailDoubleLike}
  detailImageIndex={detailImageIndex}
  detailBigHeartVisible={detailBigHeartVisible}
  selectedPostLiked={selectedPostLiked}
  selectedPostLikeCount={selectedPostLikeCount}
  toggleDetailLike={toggleDetailLike}
  setIsShareSheetOpen={setIsShareSheetOpen}
  selectedPostSaved={selectedPostSaved}
  toggleDetailSave={toggleDetailSave}
  commentSectionRef={commentSectionRef}
  commentText={commentText}
  setCommentText={setCommentText}
  submitComment={submitComment}
  commentLoading={commentLoading}
  comments={comments}
  setSelectedComment={setSelectedComment}
  setIsCommentMenuOpen={setIsCommentMenuOpen}
/>

      <AnimatePresence>
        {isPeopleLibraryOpen && (
          <PeopleLibraryPage
  query="People Library"
  locale={locale}
  onClose={() => setIsPeopleLibraryOpen(false)}
  onOpenProfile={(userId) => {
  console.log('HomePage receive open profile:', userId)

  setSelectedPost(null)
  setIsPeopleLibraryOpen(false)

  requestAnimationFrame(() => {
    setSelectedProfileUserId(userId)
  })
}}
/>
        )}
      </AnimatePresence>


<HomeAuthModal
  isAuthModalOpen={isAuthModalOpen}
  handleGoogleLogin={handleGoogleLogin}
/>

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
        className="fixed bottom-0 left-1/2 z-[770] flex max-h-[78vh] w-full max-w-[430px] -translate-x-1/2 flex-col rounded-t-[26px]  px-4 pt-4 pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.12)]"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        <div className="mb-3 flex justify-center">
          <div className="h-[4px] w-[42px] rounded-full bg-[var(--app-muted)]" />
        </div>

        <div className="mb-4 text-center text-[16px] font-medium text-[var(--app-text)]">
          留言
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          {comments.length === 0 ? (
            <div className="pt-4 text-[14px] text-[var(--app-muted)]">
              尚無留言，成為第一個留言的人
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="h-[32px] w-[32px] rounded-full bg-[#d6d6d6]" />

                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-[var(--app-text)]">
                      Vibelink User
                    </div>
                    <div className="mt-1 text-[14px] text-white">
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
        className="absolute right-1 top-[34px] z-[950] w-[132px] overflow-hidden rounded-[16px] border border-[var(--app-card-border)] bg-[var(--app-surface)] shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
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
            className="flex h-[44px] w-full items-center justify-center text-[14px] font-medium text-[var(--app-text)] active:bg-black/5"
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

        <div className="flex gap-2 border-t border-[var(--app-card-border)] pt-3">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitComment()
            }}
            placeholder="新增留言..."
            className="h-[42px] flex-1 rounded-full border border-[var(--app-card-border)] bg-[var(--app-surface)] px-4 text-[14px] text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
          />

          <button
            type="button"
            onClick={submitComment}
            disabled={commentLoading || !commentText.trim()}
            className={`h-[42px] rounded-full px-4 text-[14px] font-medium ${
              commentText.trim()
                ? 'bg-[#c86cff] text-white'
                : 'bg-[#e5e5e5] text-[var(--app-muted)]'
            }`}
          >
            送出
          </button>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>



<ShareSheet
  open={isShareSheetOpen}
  onClose={() => setIsShareSheetOpen(false)}
/>

<ShortVideoFullPage
  open={isShortVideoPageOpen}
  videos={shortVideoPosts}
  initialVideoId={shortVideoStartId}
  onClose={() => setIsShortVideoPageOpen(false)}
  onLike={toggleShortVideoLike}
  onComment={openCommentSheet}
  onShare={() => setIsShareSheetOpen(true)}
  onSave={toggleShortVideoSave}
  onDelete={handleDeletePost}
  onOpenProfile={(userId) => {
  if (!userId) return

  // 自己的短影片頭像不開 Profile
  if (userId === currentUserId) {
    return
  }

  // 只有對方短影片才開對方 Profile
  setSelectedProfileUserId(userId)
}}
/>

<AnimatePresence>
  {isNotificationsOpen && (
    <NotificationsPage
      onClose={() => {
        setIsNotificationsOpen(false)
        setUnreadNotificationCount(0)
      }}
      onOpenProfile={(userId) => {
        setIsNotificationsOpen(false)
        setUnreadNotificationCount(0)

        setSelectedProfileUserId(userId)
      }}
      onOpenPost={(postId) => {
        const post = mergedPosts.find(
          (item) => item.id === postId
        )

        setIsNotificationsOpen(false)
        setUnreadNotificationCount(0)

        if (post) {
          openDetailPost(post)
        } else {
          setToast('找不到這篇貼文，可能已被刪除')
        }
      }}
      onOpenShortVideo={(shortVideoId) => {
  setIsNotificationsOpen(false)
  setUnreadNotificationCount(0)

  setShortVideoStartId(shortVideoId)
  setIsShortVideoPageOpen(true)
}}
    />
  )}
</AnimatePresence>

<AnimatePresence mode="wait">
  {selectedProfileUserId && (
    <OtherUserProfilePage
      locale={locale}
      userId={selectedProfileUserId}
      onClose={() => setSelectedProfileUserId(null)}
    />
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

