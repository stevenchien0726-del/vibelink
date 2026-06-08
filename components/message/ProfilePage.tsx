'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileActionButtons from '@/components/profile/ProfileActionButtons'
import ProfileTopBar from '@/components/profile/ProfileTopBar'
import ProfileTabs from '@/components/profile/ProfileTabs'
import ProfileMenuSheet from '@/components/profile/ProfileMenuSheet'
import EditProfilePage from '@/components/profile/EditProfilePage'
import ProfilePostDetailModal from '@/components/profile/ProfilePostDetailModal'
import ProfilePostGridTabs from '@/components/profile/ProfilePostGridTabs'

import TrafficReportPage from '@/components/profile/TrafficReportPage'

import { profileText } from '@/lib/profile/profileText'

import type { Locale } from '@/i18n'

import UploadFullPage from '@/components/home/sections/upload/UploadFullPage'
import AccountManagePage from '@/components/message/AccountManagePage'
import SettingsPage from '@/pages/SettingsPage'
import ArchivedContentPage from '@/components/profile/ArchivedContentPage'
import NotificationsPage from '@/components/profile/NotificationsPage'
import PostInsightsPage from '@/components/profile/PostInsightsPage'

import {
  openSelectedPostHandler,
  submitCommentHandler,
  deleteCommentHandler,
} from '../../lib/profile/postDetailHandlers'

import { supabase } from '@/lib/supabase'

import WideMenuSheet from '@/components/WideMenuSheet'
import ShareSheet from '@/components/ShareSheet'
import ShortVideoFullPage from '@/components/home/sections/feed/ShortVideoFullPage'

import LinkPortSheet from '@/components/profile/LinkPortSheet'
import { useArchivedContent } from '@/src/hooks/profile/useArchivedContent'
import { useMyPosts } from '@/src/hooks/profile/useMyPosts'
import { useMyProfileData } from '@/src/hooks/profile/useMyProfileData'
import { useMyShortVideos } from '@/src/hooks/profile/useMyShortVideos'
import { useProfileBootstrap } from '@/src/hooks/profile/useProfileBootstrap'
import { safeTask } from '@/src/hooks/profile/useProfileTasks'
import { useProfileGestures } from '@/src/hooks/profile/useProfileGestures'
import { useProfileUIState } from '@/src/hooks/profile/useProfileUIState'
import { useSavedPosts } from '@/src/hooks/profile/useSavedPosts'

const VIBELINK_SHARE_URL = 'https://vibelink-beta-access.vercel.app'

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

  const {
    isMenuOpen,
    setIsMenuOpen,
    isUploadOpen,
    setIsUploadOpen,
    isLinkPortOpen,
    setIsLinkPortOpen,
    activeTab,
    setActiveTab,
    showSettingsPage,
    setShowSettingsPage,
    showTrafficReportPage,
    setShowTrafficReportPage,
    showArchivedPage,
    setShowArchivedPage,
    showNotificationsPage,
    setShowNotificationsPage,
    showPostInsightsPage,
    setShowPostInsightsPage,
    showAccountManagePage,
    setShowAccountManagePage,
    isFavoritesPublic,
    setIsFavoritesPublic,
    darkMode,
    setDarkMode,
    isEditProfileOpen,
    setIsEditProfileOpen,
    avatarUploading,
    setAvatarUploading,
  } = useProfileUIState()

  const {
    profile,
    setProfile,
    followerCount,
    ensureMyProfile,
    loadMyFollowerCount,
    uploadAvatar,
    updateProfile,
  } = useMyProfileData({
    setAvatarUploading,
    setIsEditProfileOpen,
  })

  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false)
  const [selectedPostImageIndex, setSelectedPostImageIndex] = useState(0)

  const [selectedPostLiked, setSelectedPostLiked] = useState(false)
const [selectedPostLikeCount, setSelectedPostLikeCount] = useState(0)

  const [selectedPostSaved, setSelectedPostSaved] = useState(false)

  const [comments, setComments] = useState<any[]>([])
const [commentText, setCommentText] = useState('')
const [commentLoading, setCommentLoading] = useState(false)

const [selectedComment, setSelectedComment] = useState<any>(null)
const [isCommentMenuOpen, setIsCommentMenuOpen] = useState(false)
const [isShareSheetOpen, setIsShareSheetOpen] = useState(false)

async function copyVibelinkShareUrl() {
  try {
    await navigator.clipboard.writeText(VIBELINK_SHARE_URL)
    alert('已複製 Vibelink 連結')
  } catch {
    alert('複製失敗，請稍後再試')
  }
}

  const {
    archivedPosts,
    archivedShortVideos,
    setArchivedShortVideos,
    archiveSelectedPost,
    unarchivePost,
  } = useArchivedContent({
    selectedPost,
    setSelectedPost,
    setIsPostMenuOpen,
  })

  const {
    savedPosts,
    setSavedPosts,
    profileWarmSavedImages,
    setProfileWarmSavedImages,
    lazyLoadSavedPosts,
  } = useSavedPosts({ safeTask })

  const {
    myShortVideos,
    selectedShortVideoId,
    setSelectedShortVideoId,
    isShortVideoPageOpen,
    setIsShortVideoPageOpen,
    profileWarmVideoUrls,
    setProfileWarmVideoUrls,
    loadMyShortVideos,
  } = useMyShortVideos()

  const {
    myPosts,
    setMyPosts,
    gridItems,
    isLoadingMorePosts,
    loadMorePostsRef,
    loadMyPosts,
  } = useMyPosts({
    activeTab,
    archivedPosts,
    safeTask,
  })

  const {
    profileLoading,
    profileError,
    currentUserId,
  } = useProfileBootstrap({
    ensureMyProfile,
    loadMyShortVideos,
    myShortVideos,
    setProfileWarmVideoUrls,
    lazyLoadSavedPosts,
    savedPosts,
    setProfileWarmSavedImages,
    loadMyPosts,
    loadMyFollowerCount,
    safeTask,
  })

async function deleteSelectedPost() {
  if (!selectedPost?.id) return

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    alert('??????')
    return
  }

  const { error: imageDeleteError } = await supabase
    .from('post_images')
    .delete()
    .eq('post_id', selectedPost.id)
    .select()

  if (imageDeleteError) {
    console.error('????????????:', imageDeleteError)
    alert('????????????')
    return
  }

  const { data: deletedPosts, error: postDeleteError } = await supabase
    .from('posts')
    .delete()
    .eq('id', selectedPost.id)
    .eq('user_id', user.id)
    .select()

  if (postDeleteError) {
    console.error('?????????:', postDeleteError)
    alert('?????????')
    return
  }

  if (!deletedPosts || deletedPosts.length === 0) {
    alert('????????????????????Supabase RLS DELETE policy')
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

  const {
    tabDragX,
    goToTab,
    handleTabTouchStart,
    handleTabTouchMove,
    handleTabTouchEnd,
    handlePostImageTouchStart,
    handlePostImageTouchMove,
    handlePostImageTouchEnd,
    handlePostDetailTouchStart,
    handlePostDetailTouchMove,
    handlePostDetailTouchEnd,
  } = useProfileGestures({
    activeTab,
    setActiveTab,
    selectedPost,
    setSelectedPost,
    setIsPostMenuOpen,
    setSelectedPostImageIndex,
    toggleSelectedPostLike,
    loadMyShortVideos,
    lazyLoadSavedPosts,
    safeTask,
  })

  return (
  <>
    <div className="hidden">
      {profileWarmVideoUrls.map((src) => (
        <video
          key={`profile-warm-video-${src}`}
          src={src}
          muted
          playsInline
          preload="metadata"
        />
      ))}

      {profileWarmSavedImages.map((src) => (
        <img
          key={`profile-warm-saved-${src}`}
          src={src}
          alt=""
          loading="eager"
          decoding="async"
        />
      ))}
    </div>

    <div className="relative min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] pb-[110px]">
      <div className="mx-auto w-full max-w-[430px] px-4 pt-[90px]">
        {profileLoading && (
  <div className="py-20 text-center text-[14px] text-[var(--app-muted)]">
    Profile 讀取中...
  </div>
)}

{profileError && !profileLoading && (
  <div className="py-20 text-center">
    

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
  profile={
    profile || {
      display_name: 'Vibelink User',
      username: 'vibelink',
      avatar_url: '',
      bio: '',
    }
  }
  postCount={gridItems.length}
  followerCount={followerCount}
  postsLabel={text.posts}
  followersLabel={text.followers}
  onOpenLinkPort={() => setIsLinkPortOpen(true)}
/>


        <ProfileActionButtons
  editLabel={text.editProfile}
  shareLabel="分享 Vibelink"
  onEdit={() => setIsEditProfileOpen(true)}
  onShare={copyVibelinkShareUrl}
/>

        <ProfileTabs
  activeTab={activeTab}
  onChangeTab={goToTab}
/>

<motion.div
  animate={{
    x: tabDragX,
  }}
  transition={{
    type: 'spring',
    stiffness: 360,
    damping: 34,
  }}
>
  {activeTab === 0 &&
  gridItems.length === 0 ? (

    <div className="px-4 pt-8">
      <button
        type="button"
        onClick={() => setIsUploadOpen(true)}
        className="
          flex
          h-[220px]
          w-full
          flex-col
          items-center
          justify-center
          rounded-[28px]
          border
          border-dashed
          border-[#c86cff]
          bg-[var(--app-surface)]
          transition-all
          active:scale-[0.98]
        "
      >
        <div className="mb-4 text-[54px]">
          ➕
        </div>

        <div className="text-[22px] font-semibold text-[#c86cff]">
          上傳內容
        </div>

        <div className="mt-2 text-[14px] text-[var(--app-muted)]">
          發佈你的第一篇貼文
        </div>
      </button>
    </div>

  ) : (
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
  )}
</motion.div>

{activeTab === 0 && (
  <div ref={loadMorePostsRef} className="h-12">
    {isLoadingMorePosts && (
      <div className="py-4 text-center text-[13px] text-[var(--app-muted)]">
        載入更多貼文...
      </div>
    )}
  </div>
)}

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
  initialDarkMode={darkMode}
  initialShowCity={false}
            
            onDarkModeChange={(value) => {
  setDarkMode(value)
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
  setShowTrafficReportPage(true)
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
    onVibeCity={() => {
  setIsMenuOpen(false)
  window.open(
    'https://vibelink-web-puce.vercel.app',
    '_blank',
    'noopener,noreferrer'
  )
}}
  />
</AnimatePresence>

      <AnimatePresence>
  {showTrafficReportPage && (
    <TrafficReportPage
      onClose={() => {
  setShowTrafficReportPage(false)

  setTimeout(() => {
    setIsMenuOpen(true)
  }, 320)
}}
    />
  )}
</AnimatePresence>

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
  postId={selectedPost?.id}
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
  isPinned={!!selectedPost?.isPinned}
  onTogglePin={async () => {
    if (!selectedPost?.id) return

    const nextPinned = !selectedPost.isPinned

    if (nextPinned) {
      const pinnedCount = myPosts.filter((item) => item.isPinned).length

      if (pinnedCount >= 3) {
        alert('最多只能釘選 3 篇貼文')
        return
      }
    }

    const now = new Date().toISOString()

    const { error } = await supabase
      .from('posts')
      .update({
        is_pinned: nextPinned,
        pinned_at: nextPinned ? now : null,
      })
      .eq('id', selectedPost.id)

    if (error) {
      console.error('釘選失敗:', error)
      return
    }

    setMyPosts((prev) =>
      prev.map((item) =>
        item.id === selectedPost.id
          ? {
              ...item,
              isPinned: nextPinned,
              pinned_at: nextPinned ? now : null,
            }
          : item
      )
    )

    setSelectedPost((prev: any) =>
      prev
        ? {
            ...prev,
            isPinned: nextPinned,
            pinned_at: nextPinned ? now : null,
          }
        : prev
    )
  }}
  replyPermission={selectedPost?.reply_permission || 'everyone'}
  onChangeReplyPermission={async (value) => {
    if (!selectedPost?.id) return

    const { error } = await supabase
      .from('posts')
      .update({
        reply_permission: value,
      })
      .eq('id', selectedPost.id)

    if (error) {
      console.error('更新回復權限失敗:', error)
      return
    }

    setMyPosts((prev) =>
      prev.map((item) =>
        item.id === selectedPost.id
          ? {
              ...item,
              reply_permission: value,
            }
          : item
      )
    )

    setSelectedPost((prev: any) =>
      prev
        ? {
            ...prev,
            reply_permission: value,
          }
        : prev
    )
  }}
/>
  )}
</AnimatePresence>
    
    <ShareSheet
  open={isShareSheetOpen}
  onClose={() => setIsShareSheetOpen(false)}
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
  onLike={async () => {
  await loadMyShortVideos()
}}
  onComment={(video) => {
    console.log('comment my short video:', video.id)
  }}
  onShare={() => setIsShareSheetOpen(true)}
  onSave={async () => {
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
  </>
  )
}
