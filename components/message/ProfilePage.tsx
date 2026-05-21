'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'

import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileActionButtons from '@/components/profile/ProfileActionButtons'
import ProfileTopBar from '@/components/profile/ProfileTopBar'
import ProfileTabs from '@/components/profile/ProfileTabs'
import ProfileMenuSheet from '@/components/profile/ProfileMenuSheet'
import EditProfilePage from '@/components/profile/EditProfilePage'
import ProfilePostDetailModal from '@/components/profile/ProfilePostDetailModal'
import ProfilePostGridTabs from '@/components/profile/ProfilePostGridTabs'

import { profileText } from '@/lib/profile/profileText'

import type { Locale } from '@/i18n'

import UploadFullPage from '@/components/home/sections/upload/UploadFullPage'
import AccountManagePage from '@/components/message/AccountManagePage'
import SettingsPage from '@/pages/SettingsPage'
import AnalyticsPage from '@/components/profile/AnalyticsPage'
import ArchivedContentPage from '@/components/profile/ArchivedContentPage'
import NotificationsPage from '@/components/profile/NotificationsPage'
import ShareProfilePage from '@/components/profile/ShareProfilePage'
import PostInsightsPage from '@/components/profile/PostInsightsPage'

import {
  loadMyFollowerCount as fetchMyFollowerCount,
} from '@/lib/profile/profileApi'

import {
  openSelectedPostHandler,
  submitCommentHandler,
  deleteCommentHandler,
} from '../../lib/profile/postDetailHandlers'

import { supabase } from '@/lib/supabase'


import WideMenuSheet from '@/components/WideMenuSheet'
import ShareSheet from '@/components/ShareSheet'
import ShortVideoFullPage from '@/components/home/sections/feed/ShortVideoFullPage'
import OtherUserProfilePage from '@/components/profile/OtherUserProfilePage'

import LinkPortSheet from '@/components/profile/LinkPortSheet'
import { mockPosts } from '@/lib/mockPosts'

type ProfilePageProps = {
  onCloseMenu?: () => void

  locale: Locale
  onChangeLocale: (locale: Locale) => void
}


export default function ProfilePage({
  locale,
  onChangeLocale,
}: ProfilePageProps) {

    const safeLocale: Locale = locale ?? 'zh-TW'
  const text = profileText[safeLocale]

  function withTimeout<T>(
  promise: PromiseLike<T>,
  ms = 4000,
  label = 'request'
): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(`${label} timeout`))
      }, ms)
    }),
  ])
}
  
  useEffect(() => {
  let alive = true

 async function init(retry = 0) {
  try {
    setProfileLoading(true)
    setProfileError('')

    const {
  data: { session },
} = await supabase.auth.getSession()

    const user = session?.user

    if (!alive) return

    if (!user) {
      setCurrentUserId(null)
      setProfileLoading(false)
      return
    }

    setCurrentUserId(user.id)

    await withTimeout(
  ensureMyProfile(),
  4000,
  'ensure_my_profile'
)

await withTimeout(
  Promise.all([
    loadMyFollowerCount(),
    loadMyPosts(),
    loadMyShortVideos(),
    loadSavedPosts(),
  ]),
  4000,
  'my_profile_data'
)

    if (!alive) return

    setProfileLoading(false)
  } catch (error) {
    console.error('自己 Profile 初始化失敗:', error)

    if (retry < 1) {
      window.setTimeout(() => {
        init(retry + 1)
      }, 600)

      return
    }

    if (!alive) return

    setProfileError('Profile 讀取失敗')
    setProfileLoading(false)
  }
}

  init()

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user

    if (!user) {
      setCurrentUserId(null)
      return
    }

    setCurrentUserId(user.id)

    setTimeout(() => {
      if (!alive) return

      Promise.all([
        ensureMyProfile(),
        loadMyFollowerCount(),
        loadMyPosts(),
        loadMyShortVideos(),
        loadSavedPosts(),
      ])
    }, 0)
  })

  return () => {
    alive = false
    subscription.unsubscribe()
  }
}, [])

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isLinkPortOpen, setIsLinkPortOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [showSettingsPage, setShowSettingsPage] = useState(false)
  const [showAnalyticsPage, setShowAnalyticsPage] = useState(false)

  const [showArchivedPage, setShowArchivedPage] = useState(false)
  const [showNotificationsPage, setShowNotificationsPage] = useState(false)
  const [showShareProfilePage, setShowShareProfilePage] = useState(false)
  const [showPostInsightsPage, setShowPostInsightsPage] = useState(false)

  const [showAccountManagePage, setShowAccountManagePage] = useState(false)
  const [isFavoritesPublic, setIsFavoritesPublic] = useState(true)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [profile, setProfile] = useState<any>(null)
const [followerCount, setFollowerCount] = useState(0)

const [profileLoading, setProfileLoading] = useState(true)
const [profileError, setProfileError] = useState('')

  const tabTouchStartX = useRef<number | null>(null)
  const tabTouchDeltaX = useRef(0)

  const [myPosts, setMyPosts] = useState<any[]>([])
  const [myShortVideos, setMyShortVideos] = useState<any[]>([])
  const [selectedShortVideoId, setSelectedShortVideoId] = useState<string | undefined>()
const [isShortVideoPageOpen, setIsShortVideoPageOpen] = useState(false)
const [shortVideoProfileUserId, setShortVideoProfileUserId] =
  useState<string | null>(null)

  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const [archivedPosts, setArchivedPosts] = useState<any[]>([])
  const [archivedShortVideos, setArchivedShortVideos] = useState<any[]>([])

  useEffect(() => {
  const savedPosts = localStorage.getItem(
    'vibelink_archived_posts'
  )

  if (savedPosts) {
    try {
      setArchivedPosts(JSON.parse(savedPosts))
    } catch (error) {
      console.error('讀取典藏貼文失敗:', error)
    }
  }

  const savedVideos = localStorage.getItem(
    'vibelink_archived_short_videos'
  )

  if (savedVideos) {
    try {
      setArchivedShortVideos(JSON.parse(savedVideos))
    } catch (error) {
      console.error('讀取典藏短影片失敗:', error)
    }
  }
}, [])


  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false)
  const [selectedPostImageIndex, setSelectedPostImageIndex] = useState(0)

  const [selectedPostLiked, setSelectedPostLiked] = useState(false)
const [selectedPostLikeCount, setSelectedPostLikeCount] = useState(0)

  const [selectedPostSaved, setSelectedPostSaved] = useState(false)

  const [comments, setComments] = useState<any[]>([])
const [commentText, setCommentText] = useState('')
const [commentLoading, setCommentLoading] = useState(false)

const [currentUserId, setCurrentUserId] = useState<string | null>(null)
const [selectedComment, setSelectedComment] = useState<any>(null)
const [isCommentMenuOpen, setIsCommentMenuOpen] = useState(false)
const [isShareSheetOpen, setIsShareSheetOpen] = useState(false)

  const postImageTouchStartX = useRef<number | null>(null)
  const postImageTouchDeltaX = useRef(0)
  const postImageLastTapTimeRef = useRef(0)

  const postDetailTouchStartX = useRef<number | null>(null)
const postDetailTouchStartY = useRef<number | null>(null)

  const gridItems = myPosts.filter(
  (post) =>
    post.post_images?.length > 0 &&
    !archivedPosts.some((archived) => archived.id === post.id)
)

  async function ensureMyProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('尚未登入')
    return
  }

  const { data: existingProfile, error: selectError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (selectError) {
  console.error('讀取 profile 失敗:', selectError)
  throw selectError
}

  if (existingProfile) {
    setProfile(existingProfile)
    return
  }

  const fallbackName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Vibelink User'

  const newProfile = {
    id: user.id,
    username: `user_${user.id.slice(0, 5)}`,
    display_name: fallbackName,
    avatar_url: user.user_metadata?.avatar_url || null,
    bio: '',
  }

  const { data: createdProfile, error: insertError } = await supabase
    .from('profiles')
    .insert(newProfile)
    .select()
    .single()

  if (insertError) {
  console.error('建立 profile 失敗:', insertError)
  throw insertError
}

  setProfile(createdProfile)
}

async function loadMyFollowerCount() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const count = await fetchMyFollowerCount(user.id)

  setFollowerCount(count)
}

async function uploadAvatar(file: File) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    alert('請先登入')
    return
  }

  setAvatarUploading(true)

  const fileExt = file.name.split('.').pop()
  const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true,
    })

  if (uploadError) {
    console.error('上傳頭像失敗:', uploadError)
    alert('上傳頭像失敗')
    setAvatarUploading(false)
    return
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  setProfile((prev: any) => ({
    ...prev,
    avatar_url: data.publicUrl,
  }))

  setAvatarUploading(false)
}

async function updateProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    alert('請先登入')
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({
  display_name: profile?.display_name || '',
  username: profile?.username || '',
  bio: profile?.bio || '',
  avatar_url: profile?.avatar_url || null,
})
    .eq('id', user.id)

  if (error) {
    console.error('更新 profile 失敗:', error)
    alert('更新失敗')
    return
  }

  alert('更新成功')
  setIsEditProfileOpen(false)
}

async function loadMyPosts() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('尚未登入')
    return
  }

  const { data, error } = await supabase
  .from('posts')
  .select(`
    id,
    caption,
    created_at,
    user_id,
    post_images (
      image_url
    )
  `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
  console.error('讀取我的貼文失敗:', error)
  throw error
}

  const postIds = (data ?? []).map((post: any) => post.id)

  const { data: likeRows } =
    postIds.length > 0
      ? await supabase
          .from('likes')
          .select('post_id, user_id')
          .in('post_id', postIds)
      : { data: [] }

  const likeCountMap = new Map<string, number>()
  const likedSet = new Set<string>()

  ;(likeRows ?? []).forEach((like: any) => {
    likeCountMap.set(
      like.post_id,
      (likeCountMap.get(like.post_id) ?? 0) + 1
    )

    if (like.user_id === user.id) {
      likedSet.add(like.post_id)
    }
  })

  const postsWithLikes = (data ?? []).map((post: any) => ({
    ...post,
    likes: likeCountMap.get(post.id) ?? 0,
    isLiked: likedSet.has(post.id),
  }))

  setMyPosts(postsWithLikes)
}

async function loadMyShortVideos() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { data, error } = await supabase
    .from('short_videos')
    .select(`
      id,
      caption,
      video_url,
      created_at,
      user_id
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
  console.error('讀取我的短影片失敗:', error)
  throw error
}

  const videoIds = (data ?? []).map((video: any) => video.id)

const { data: likeRows } =
  videoIds.length > 0
    ? await supabase
        .from('short_video_likes')
        .select('short_video_id, user_id')
        .in('short_video_id', videoIds)
    : { data: [] }

const { data: savedRows } =
  videoIds.length > 0
    ? await supabase
        .from('saved_short_videos')
        .select('short_video_id, user_id')
        .in('short_video_id', videoIds)
    : { data: [] }

const likeCountMap = new Map<string, number>()
const likedSet = new Set<string>()
const savedSet = new Set<string>()

;(likeRows ?? []).forEach((like: any) => {
  likeCountMap.set(
    like.short_video_id,
    (likeCountMap.get(like.short_video_id) ?? 0) + 1
  )

  if (like.user_id === user.id) {
    likedSet.add(like.short_video_id)
  }
})

;(savedRows ?? []).forEach((saved: any) => {
  if (saved.user_id === user.id) {
    savedSet.add(saved.short_video_id)
  }
})

setMyShortVideos(
  (data ?? []).map((video: any) => ({
    ...video,
    likes: likeCountMap.get(video.id) ?? 0,
    isLiked: likedSet.has(video.id),
    isSaved: savedSet.has(video.id),
  }))
)
}

async function loadSavedPosts() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { data: photoSavedRows, error: photoError } = await supabase
    .from('saved_posts')
    .select(`
      post_id,
      posts (
        id,
        caption,
        post_images (
          image_url
        )
      )
    `)
    .eq('user_id', user.id)

  if (photoError) {
  console.error('讀取照片收藏失敗:', photoError)
  throw photoError
}

  const { data: videoSavedRows, error: videoError } = await supabase
    .from('saved_short_videos')
    .select(`
      short_video_id,
      short_videos (
        id,
        caption,
        video_url,
        created_at,
        user_id
      )
    `)
    .eq('user_id', user.id)

  if (videoError) {
  console.error('讀取短影片收藏失敗:', videoError)
  throw videoError
}

  const photoPosts = (photoSavedRows ?? [])
    .map((item: any) => item.posts)
    .filter(Boolean)
    .map((post: any) => ({
      ...post,
      type: 'post',
    }))

  const videoPosts = (videoSavedRows ?? [])
    .map((item: any) => item.short_videos)
    .filter(Boolean)
    .map((video: any) => ({
      id: video.id,
      caption: video.caption,
      video_url: video.video_url,
      created_at: video.created_at,
      user_id: video.user_id,
      type: 'video',
    }))

    const mockSavedIds =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('vibelink_mock_saved_posts') || '[]')
      : []

  const mockSavedPosts = mockPosts
    .filter((post) => mockSavedIds.includes(post.id))
    .map((post) => ({
      id: post.id,
      caption: post.text,
      post_images: post.images.map((imageUrl) => ({
        image_url: imageUrl,
      })),
      likes: post.likes ?? 0,
      isLiked: !!post.isLiked,
      isSaved: true,
      isMock: true,
      type: 'post',
    }))

  setSavedPosts([...mockSavedPosts, ...videoPosts, ...photoPosts])
}

<<<<<<< HEAD
async function openSelectedPost(post: any) {
  if (post.isMock) {
    setSelectedPost(post)
    setSelectedPostImageIndex(0)
    setSelectedPostLiked(!!post.isLiked)
    setSelectedPostLikeCount(post.likes ?? 0)
    setSelectedPostSaved(true)
    setCommentText('')
    setComments([])
    return
  }

  const { data: imageRows, error } = await supabase
    .from('post_images')
    .select('image_url')
    .eq('post_id', post.id)

  if (error) {
    console.error('重新讀取貼文圖片失敗:', error)
  }

  const fullPost = {
    ...post,
    post_images:
      imageRows && imageRows.length > 0
        ? imageRows
        : post.post_images ?? [],
  }

  console.log(
    '打開貼文完整圖片數:',
    fullPost.post_images.length,
    fullPost.post_images
  )

  setSelectedPost(fullPost)
  setSelectedPostImageIndex(0)
  setSelectedPostLiked(!!post.isLiked)
  setSelectedPostLikeCount(post.likes ?? 0)
  setSelectedPostSaved(
    savedPosts.some((savedPost) => savedPost.id === post.id)
  )
  setCommentText('')
  setComments([])
  loadComments(post.id)
}

=======
>>>>>>> 9343150 (fix)
function archiveSelectedPost() {
  if (!selectedPost?.id) return

  const nextArchivedPosts = [
    selectedPost,
    ...archivedPosts.filter((post) => post.id !== selectedPost.id),
  ]

  setArchivedPosts(nextArchivedPosts)

  localStorage.setItem(
    'vibelink_archived_posts',
    JSON.stringify(nextArchivedPosts)
  )

  setIsPostMenuOpen(false)

setTimeout(() => {
  setSelectedPost(null)
}, 180)
}

function unarchivePost(postId: string) {
  const nextArchivedPosts = archivedPosts.filter((post) => post.id !== postId)

  setArchivedPosts(nextArchivedPosts)

  localStorage.setItem(
    'vibelink_archived_posts',
    JSON.stringify(nextArchivedPosts)
  )
}

async function deleteSelectedPost() {
  if (!selectedPost?.id) return

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    alert('請先登入')
    return
  }

  const { data: deletedImages, error: imageDeleteError } = await supabase
    .from('post_images')
    .delete()
    .eq('post_id', selectedPost.id)
    .select()

  if (imageDeleteError) {
    console.error('刪除圖片資料失敗:', imageDeleteError)
    alert('刪除圖片資料失敗')
    return
  }

  const { data: deletedPosts, error: postDeleteError } = await supabase
    .from('posts')
    .delete()
    .eq('id', selectedPost.id)
    .eq('user_id', user.id)
    .select()

  if (postDeleteError) {
    console.error('刪除貼文失敗:', postDeleteError)
    alert('刪除貼文失敗')
    return
  }

  if (!deletedPosts || deletedPosts.length === 0) {
    alert('資料庫沒有刪到貼文，請檢查 Supabase RLS DELETE policy')
    return
  }

  setMyPosts((prev) => prev.filter((post) => post.id !== selectedPost.id))
  setIsPostMenuOpen(false)
  setSelectedPost(null)
}

async function toggleSelectedPostLike() {
  if (!selectedPost?.id) return

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  if (selectedPostLiked) {
    setSelectedPostLiked(false)
    setSelectedPostLikeCount((prev) => Math.max(0, prev - 1))

    await supabase
      .from('likes')
      .delete()
      .eq('post_id', selectedPost.id)
      .eq('user_id', user.id)

    return
  }

  setSelectedPostLiked(true)
  setSelectedPostLikeCount((prev) => prev + 1)

  await supabase.from('likes').insert({
    post_id: selectedPost.id,
    user_id: user.id,
  })
}

async function toggleSelectedPostSave() {
  if (!selectedPost?.id) return

  if (selectedPost.isMock) {
  const saved = JSON.parse(
    localStorage.getItem('vibelink_mock_saved_posts') || '[]'
  )

  const nextSaved = !selectedPostSaved

  const nextSavedIds = nextSaved
    ? [...new Set([...saved, selectedPost.id])]
    : saved.filter((id: string) => id !== selectedPost.id)

  localStorage.setItem(
    'vibelink_mock_saved_posts',
    JSON.stringify(nextSavedIds)
  )

  setSelectedPostSaved(nextSaved)

  setSavedPosts((prev) =>
    nextSaved
      ? [selectedPost, ...prev]
      : prev.filter((post) => post.id !== selectedPost.id)
  )

  return
}

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  if (selectedPostSaved) {
    setSelectedPostSaved(false)
    setSavedPosts((prev) =>
      prev.filter((post) => post.id !== selectedPost.id)
    )

    await supabase
      .from('saved_posts')
      .delete()
      .eq('post_id', selectedPost.id)
      .eq('user_id', user.id)

    return
  }

  setSelectedPostSaved(true)
  setSavedPosts((prev) => [selectedPost, ...prev])

  await supabase.from('saved_posts').insert({
    post_id: selectedPost.id,
    user_id: user.id,
  })
}

function handlePostDetailTouchStart(e: React.TouchEvent<HTMLDivElement>) {
  e.stopPropagation()

  const target = e.target as HTMLElement

  if (target.closest('[data-post-image-area="true"]')) {
    postDetailTouchStartX.current = null
    postDetailTouchStartY.current = null
    return
  }

  const touch = e.touches[0]
  postDetailTouchStartX.current = touch.clientX
  postDetailTouchStartY.current = touch.clientY
}

function handlePostDetailTouchMove(e: React.TouchEvent<HTMLDivElement>) {
  e.stopPropagation()
}

function handlePostDetailTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
  e.stopPropagation()

  const startX = postDetailTouchStartX.current
  const startY = postDetailTouchStartY.current

  if (startX == null || startY == null) return

  const touch = e.changedTouches[0]
  const deltaX = touch.clientX - startX
  const deltaY = touch.clientY - startY

  if (Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY)) {
    setIsPostMenuOpen(false)
    setSelectedPost(null)
  }

  postDetailTouchStartX.current = null
  postDetailTouchStartY.current = null
}

function handlePostImageTouchStart(e: React.TouchEvent<HTMLDivElement>) {
  e.stopPropagation()

  const touch = e.touches[0]
  postImageTouchStartX.current = touch.clientX
  postImageTouchDeltaX.current = 0
}

function handlePostImageTouchMove(e: React.TouchEvent<HTMLDivElement>) {
  e.stopPropagation()

  if (postImageTouchStartX.current == null) return

  const touch = e.touches[0]
  postImageTouchDeltaX.current = touch.clientX - postImageTouchStartX.current
}

function handlePostImageTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
  e.stopPropagation()

  const deltaX = postImageTouchDeltaX.current
  const total = selectedPost?.post_images?.length || 0

  const absX = Math.abs(deltaX)
  const now = Date.now()

  if (absX < 12) {
    if (now - postImageLastTapTimeRef.current < 280) {
  toggleSelectedPostLike()
  postImageLastTapTimeRef.current = 0
} else {
  postImageLastTapTimeRef.current = now
}
  }

  if (absX > 50 && total > 1) {
    if (deltaX < 0) {
      setSelectedPostImageIndex((prev) => Math.min(prev + 1, total - 1))
    } else {
      setSelectedPostImageIndex((prev) => Math.max(prev - 1, 0))
    }
  }

  postImageTouchStartX.current = null
  postImageTouchDeltaX.current = 0
}

  function goToTab(index: number) {
    if (index < 0 || index > 2) return
    setActiveTab(index)
  }

  

  function handleTabTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0]
    tabTouchStartX.current = touch.clientX
    tabTouchDeltaX.current = 0
  }

  function handleTabTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (tabTouchStartX.current == null) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - tabTouchStartX.current
    tabTouchDeltaX.current = deltaX


    if (Math.abs(deltaX) > 8) {
      e.stopPropagation()
    }
  }

  function handleTabTouchEnd() {
  const deltaX = tabTouchDeltaX.current

  if (Math.abs(deltaX) > 50) {
    if (deltaX < 0) {
      goToTab(activeTab + 1)
    } else {
      goToTab(activeTab - 1)
    }
  }

  tabTouchStartX.current = null
  tabTouchDeltaX.current = 0
}

  return (
    <div className="relative min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] pb-[110px]">
      <div className="mx-auto w-full max-w-[430px] px-4 pt-[90px]">
        {profileLoading && (
  <div className="py-20 text-center text-[14px] text-[var(--app-muted)]">
    Profile 讀取中...
  </div>
)}

{profileError && !profileLoading && (
  <div className="py-20 text-center">
    <div className="mb-3 text-[14px] text-[var(--app-muted)]">ofilePostDetailModal.tsx
      {profileError}
    </div>

    <button
      type="button"
      onClick={() => window.location.reload()}
      className="rounded-full bg-[#c86cff] px-4 py-2 text-[13px] text-white"
    >
      重新讀取
    </button>
  </div>
)}
        <ProfileTopBar
  isMenuOpen={isMenuOpen}
  uploadLabel={text.upload}
  onMenuClick={() => {
    setIsUploadOpen(false)
    setIsMenuOpen((prev) => !prev)
  }}
  onUploadClick={() => {
    setIsMenuOpen(false)
    setIsUploadOpen((prev) => !prev)
  }}
/>
          
        <ProfileHeader
  profile={profile}
  postCount={gridItems.length}
  followerCount={followerCount}
  postsLabel={text.posts}
  followersLabel={text.followers}
  onOpenLinkPort={() => setIsLinkPortOpen(true)}
/>

        <ProfileActionButtons
  editLabel={text.editProfile}
  shareLabel={text.shareProfile}
  onEdit={() => setIsEditProfileOpen(true)}
  onShare={() => setShowShareProfilePage(true)}
/>

        <ProfileTabs
  activeTab={activeTab}
  onChangeTab={goToTab}
/>

<ProfilePostGridTabs
  activeTab={activeTab}
  text={text}
  gridItems={gridItems}
  myShortVideos={myShortVideos}
  savedPosts={savedPosts}
  archivedShortVideos={archivedShortVideos}
  isFavoritesPublic={isFavoritesPublic}
  onToggleFavoritesPublic={() =>
    setIsFavoritesPublic((prev) => !prev)
  }
  onOpenPost={(post) =>
  openSelectedPostHandler({
    post,
    savedPosts,
    setSelectedPost,
    setSelectedPostImageIndex,
    setSelectedPostLiked,
    setSelectedPostLikeCount,
    setSelectedPostSaved,
    setCommentText,
    setComments,
  })
}
  onOpenShortVideo={(videoId) => {
    setSelectedShortVideoId(videoId)
    setIsShortVideoPageOpen(true)
  }}
  onTouchStart={handleTabTouchStart}
  onTouchMove={handleTabTouchMove}
  onTouchEnd={handleTabTouchEnd}
/>
        </div>

<AnimatePresence>
  <EditProfilePage
    open={isEditProfileOpen}
    text={text}
    profile={profile}
    avatarUploading={avatarUploading}
    onClose={() => setIsEditProfileOpen(false)}
    onSave={updateProfile}
    onChangeProfile={setProfile}
    onUploadAvatar={uploadAvatar}
  />
</AnimatePresence>

      <AnimatePresence>
        {isUploadOpen && (
          <UploadFullPage
  onClose={() => {
    setIsUploadOpen(false)
    loadMyShortVideos()
  }}
  onPostCreated={(post) => {

  console.log('🟣 new post:', post)
  console.log('🟣 new post id:', post.id)
  console.log('🟣 imageUrls:', post.imageUrls)

  const imageUrls =
    post.imageUrls?.length
      ? post.imageUrls
      : post.imageUrl
        ? [post.imageUrl]
        : []

  setMyPosts((prev) => [
  {
    ...post,
    caption: post.caption || '',
    post_images: imageUrls.map((url) => ({
      image_url: url,
    })),
    likes: 0,
    isLiked: false,
  },
  ...prev,
])

  loadMyPosts()
}}
/>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettingsPage && (
          
  <SettingsPage
  onClose={() => {
    setShowSettingsPage(false)
    setIsMenuOpen(true)
  }}
  
  locale={safeLocale}
  onChangeLocale={onChangeLocale}
  initialDarkMode={true}
  initialShowCity={false}
            
            onDarkModeChange={(value) => {
              console.log('dark mode:', value)
            }}
            onShowCityChange={(value) => {
              console.log('show city:', value)
            }}
            onBlockedClick={() => {
              console.log('blocked clicked')
            }}
          />
        )}
      </AnimatePresence>

      <LinkPortSheet
  open={isLinkPortOpen}
  onClose={() => setIsLinkPortOpen(false)}
  userId={currentUserId!}
  isOwner={true}
/>

      <AnimatePresence>
  <ProfileMenuSheet
    open={isMenuOpen}
    text={text}
    onClose={() => setIsMenuOpen(false)}
    onNotifications={() => {
      setShowNotificationsPage(true)
      setIsMenuOpen(false)
    }}
    onAnalytics={() => {
      setShowAnalyticsPage(true)
      setIsMenuOpen(false)
    }}
    onArchive={() => {
      setShowArchivedPage(true)
      setIsMenuOpen(false)
    }}
    onSettings={() => {
      setShowSettingsPage(true)
    }}
    onAccount={() => {
      setShowAccountManagePage(true)
      setIsMenuOpen(false)
    }}
    onMembership={() => {
      setIsMenuOpen(false)
      window.open(
        'https://vibe-membership-web.vercel.app',
        '_blank',
        'noopener,noreferrer'
      )
    }}
  />
</AnimatePresence>

      <AnalyticsPage
  open={showAnalyticsPage}
  onClose={() => {
    setShowAnalyticsPage(false)
    setIsMenuOpen(true)
  }}
/>

<AnimatePresence>
  {showNotificationsPage && (
    <NotificationsPage
      onClose={() => {
        setShowNotificationsPage(false)
        setIsMenuOpen(true)
      }}
    />
  )}
</AnimatePresence>

<AnimatePresence>
  {showArchivedPage && (
    <ArchivedContentPage
  posts={[
    ...archivedPosts,
    ...archivedShortVideos.map((video) => ({
      ...video,
      type: 'video',
    })),
  ]}
  onUnarchive={(itemId) => {
    unarchivePost(itemId)

    const nextVideos = archivedShortVideos.filter(
      (video) => video.id !== itemId
    )

    setArchivedShortVideos(nextVideos)

    localStorage.setItem(
      'vibelink_archived_short_videos',
      JSON.stringify(nextVideos)
    )
  }}
  onClose={() => {
    setShowArchivedPage(false)
    setIsMenuOpen(true)
  }}
/>
  )}
</AnimatePresence>

<AnimatePresence>
  {showPostInsightsPage && (
    <PostInsightsPage
      onClose={() => {
        setShowPostInsightsPage(false)
      }}
      views={0}
      likes={selectedPostLikeCount}
      comments={comments.length}
    />
  )}
</AnimatePresence>

      <AnimatePresence>
  {showAccountManagePage && (
    <AccountManagePage
  onClose={() => {
    setShowAccountManagePage(false)
    setIsMenuOpen(true)
  }}
/>
  )}
</AnimatePresence>
    
    <AnimatePresence>
<<<<<<< HEAD
  {selectedPost?.post_images?.length > 0 && (
    <motion.div
  data-block-page-swipe="true"
  className="fixed inset-0 z-[500] bg-[#f3f3f3]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 360, damping: 34 }}
      onTouchStart={handlePostDetailTouchStart}
onTouchMove={handlePostDetailTouchMove}
onTouchEnd={handlePostDetailTouchEnd}
onPointerDown={(e) => e.stopPropagation()}
onClick={(e) => e.stopPropagation()}
    >
      {/* Top Bar */}
      <div className="fixed left-1/2 top-0 z-[510] flex h-[58px] w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[#f3f3f3]/95 px-4 backdrop-blur-md">
        <button
          type="button"
          onClick={() => {
  setIsPostMenuOpen(false)
  setSelectedPost(null)
}}
          className="flex h-10 w-10 items-center justify-center rounded-full active:scale-90"
        >
          <ChevronLeft />
        </button>

        <button
          type="button"
          onClick={() => setIsPostMenuOpen(true)}
          className="flex h-10 items-center gap-2 rounded-full px-2 active:scale-95"
        >
          <MoreHorizontal size={22} strokeWidth={2.4} />
          <span className="text-[15px] font-medium">MENU</span>
        </button>
      </div>

      <div className="mx-auto h-full w-full max-w-[430px] overflow-y-auto pt-[58px] pb-[120px]">
        {/* Author */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-[34px] w-[34px] rounded-full bg-[#d6d6d6]" />
            <div className="text-[15px] font-medium text-[#222]">
              {profile?.display_name || profile?.username || 'Vibelink User'}
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="px-3">
  <div
  data-no-page-swipe="true"
  data-post-image-area="true"
  className="relative overflow-hidden rounded-[18px] touch-pan-y"
  onTouchStart={handlePostImageTouchStart}
  onTouchMove={handlePostImageTouchMove}
  onTouchEnd={handlePostImageTouchEnd}
>
    <motion.div
      className="flex"
      animate={{ x: `-${selectedPostImageIndex * 100}%` }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
    >
      {selectedPost.post_images?.map((img: any, index: number) => (
        <div
  key={index}
  className="h-[530px] w-full shrink-0 grow-0 basis-full overflow-hidden bg-black"
>
  <img
    src={img.image_url}
    className="h-full w-full object-cover"
  />
</div>
      ))}
    </motion.div>

</div>

</div>

        {/* Actions */}
<div className="relative flex items-center justify-between px-4 pt-4">
  {selectedPost.post_images?.length > 1 && (
    <div className="pointer-events-auto absolute left-1/2 top-[23px] z-[20] flex -translate-x-1/2 items-center gap-[7px]">
      {selectedPost.post_images.map((_: any, index: number) => (
        <button
          key={index}
          type="button"
          onClick={() => setSelectedPostImageIndex(index)}
          className={`h-[7px] rounded-full transition-all ${
            selectedPostImageIndex === index
              ? 'w-[18px] bg-[#c86cff]'
              : 'w-[7px] bg-[#d7d7d7]'
          }`}
        />
      ))}
    </div>
  )}

  <div className="flex items-center gap-5">
    <button
      type="button"
      onClick={toggleSelectedPostLike}
      className="flex items-center gap-1.5 active:scale-90"
    >
      <Heart
        size={25}
        color="#c86cff"
        fill={selectedPostLiked ? '#c86cff' : 'none'}
        strokeWidth={2.1}
      />
      <span className="text-[15px] text-[#555]">
        {selectedPostLikeCount}
      </span>
    </button>

    <button type="button" className="active:scale-90">
      <MessageCircle size={25} strokeWidth={2.1} />
    </button>
  </div>

  <div className="flex items-center gap-5">
    <button
      type="button"
      onClick={() => setIsShareSheetOpen(true)}
      className="active:scale-90"
    >
      <Send size={24} strokeWidth={2.1} />
    </button>

    <button
      type="button"
      onClick={toggleSelectedPostSave}
      className="active:scale-90"
    >
      <Bookmark
        size={25}
        color="#c86cff"
        fill={selectedPostSaved ? '#c86cff' : 'none'}
        strokeWidth={2.1}
      />
    </button>
  </div>
</div>

        {/* Caption */}
        {selectedPost.caption && (
          <div className="px-4 pt-3 text-[15px] text-[#222]">
            {selectedPost.caption}
          </div>
        )}

        {/* Comments */}
<div className="mt-5 border-t border-[#ddd] px-4 pt-4">
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
    <div className="flex flex-col gap-4 pb-8">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
  <div className="h-[32px] w-[32px] overflow-hidden rounded-full bg-[#d6d6d6]">
    {comment.profiles?.avatar_url && (
      <img
        src={comment.profiles.avatar_url}
        className="h-full w-full object-cover"
      />
    )}
  </div>

  <div className="flex-1">
    <div className="text-[13px] font-medium text-[#222]">
      {comment.profiles?.display_name ||
        comment.profiles?.username ||
        'Vibelink User'}
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
=======
    <ProfilePostDetailModal
  open={!!selectedPost}
  selectedPost={selectedPost}
  selectedPostImageIndex={selectedPostImageIndex}
  selectedPostLiked={selectedPostLiked}
  selectedPostLikeCount={selectedPostLikeCount}
  selectedPostSaved={selectedPostSaved}
  comments={comments}
  commentText={commentText}
  commentLoading={commentLoading}
  profile={profile}
  isPostMenuOpen={isPostMenuOpen}
  isCommentMenuOpen={isCommentMenuOpen}
  selectedComment={selectedComment}
  onClose={() => {
    setIsPostMenuOpen(false)
    setSelectedPost(null)
  }}
  onToggleLike={toggleSelectedPostLike}
  onToggleSave={toggleSelectedPostSave}
  onSubmitComment={() =>
  submitCommentHandler({
    selectedPost,
    commentText,
    setCommentLoading,
    setCommentText,
    setComments,
>>>>>>> 9343150 (fix)
  })
}
  onDeleteComment={() =>
  deleteCommentHandler({
    selectedComment,
    setComments,
    setIsCommentMenuOpen,
    setSelectedComment,
  })
}

  setCommentText={setCommentText}
  setSelectedPostImageIndex={setSelectedPostImageIndex}
  setIsPostMenuOpen={setIsPostMenuOpen}
  setIsCommentMenuOpen={setIsCommentMenuOpen}
  setSelectedComment={setSelectedComment}
  handlePostImageTouchStart={handlePostImageTouchStart}
  handlePostImageTouchMove={handlePostImageTouchMove}
  handlePostImageTouchEnd={handlePostImageTouchEnd}
  handlePostDetailTouchStart={handlePostDetailTouchStart}
  handlePostDetailTouchMove={handlePostDetailTouchMove}
  handlePostDetailTouchEnd={handlePostDetailTouchEnd}
/>
</AnimatePresence>

      <AnimatePresence>
  {isPostMenuOpen && (
    <WideMenuSheet
  onOpenInsights={() => {
    setIsPostMenuOpen(false)

    setTimeout(() => {
      setShowPostInsightsPage(true)
    }, 180)
  }}
  variant="mine"
  onClose={() => setIsPostMenuOpen(false)}
  onArchive={archiveSelectedPost}
  onDelete={deleteSelectedPost}
/>
  )}
</AnimatePresence>
    
    <ShareSheet
  open={isShareSheetOpen}
  onClose={() => setIsShareSheetOpen(false)}
/>

<ShareProfilePage
  open={showShareProfilePage}
  onClose={() => setShowShareProfilePage(false)}
  profile={profile}
/>

    <ShortVideoFullPage
  open={isShortVideoPageOpen}
  videos={myShortVideos
  .filter(
    (video) =>
      !archivedShortVideos.some(
        (item) => item.id === video.id
      )
  )
  .map((video) => ({
    id: video.id,
    user_id: video.user_id,
    author:
      profile?.display_name ||
      profile?.username ||
      'Vibelink User',
    text: video.caption || '',
    likes: video.likes ?? 0,
    images: [],
    videoUrl: video.video_url,
    type: 'video',
    aiTags: ['短影片'],
    isMine: true,
    isLiked: !!video.isLiked,
    isSaved: !!video.isSaved,
  }))}
  initialVideoId={selectedShortVideoId}
  onClose={() => setIsShortVideoPageOpen(false)}
  onOpenProfile={(userId) => {
  if (!userId) return

  setIsShortVideoPageOpen(false)

  window.setTimeout(() => {
    setShortVideoProfileUserId(userId)
  }, 180)
}}
  onLike={async (video) => {
  await loadMyShortVideos()
}}
  onComment={(video) => {
    console.log('comment my short video:', video.id)
  }}
  onShare={() => setIsShareSheetOpen(true)}
  onSave={async (video) => {
  await loadMyShortVideos()
}}

onArchive={(video) => {
  const next = [
    video,
    ...archivedShortVideos.filter(
      (item) => item.id !== video.id
    ),
  ]

  setArchivedShortVideos(next)

  localStorage.setItem(
    'vibelink_archived_short_videos',
    JSON.stringify(next)
  )
}}
/>
    
    </div>
  )
}