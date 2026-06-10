'use client'

import type { Dispatch, SetStateAction } from 'react'
import { AnimatePresence } from 'framer-motion'
import FeedGrid, { type PostItem } from '@/components/home/sections/feed/FeedGrid'
import FollowingFeedPage from '@/components/home/sections/feed/FollowingFeedPage'
import FavoriteFeedPage from '@/components/home/sections/feed/FavoriteFeedPage'

type Props = {
  mergedPosts: PostItem[]
  reportedPostIds: string[]
  reportedVideoIds: string[]
  handleOpenFeedPost: (post: PostItem) => void
  openCommentSheet: (post: PostItem) => void
  onOpenShare: (post: PostItem) => void
  handleDeletePost: (post: PostItem) => void
  setSelectedProfileUserId: Dispatch<SetStateAction<string | null>>
  isFollowingFeedOpen: boolean
  setIsFollowingFeedOpen: Dispatch<SetStateAction<boolean>>
  isFavoriteFeedOpen: boolean
  setIsFavoriteFeedOpen: Dispatch<SetStateAction<boolean>>
  setShortVideoStartId: Dispatch<SetStateAction<string | undefined>>
  setIsShortVideoPageOpen: Dispatch<SetStateAction<boolean>>
  openDetailPost: (post: PostItem) => void
}

export default function HomeFeedSection({
  mergedPosts,
  reportedPostIds,
  reportedVideoIds,
  handleOpenFeedPost,
  openCommentSheet,
  onOpenShare,
  handleDeletePost,
  setSelectedProfileUserId,
  isFollowingFeedOpen,
  setIsFollowingFeedOpen,
  isFavoriteFeedOpen,
  setIsFavoriteFeedOpen,
  setShortVideoStartId,
  setIsShortVideoPageOpen,
  openDetailPost,
}: Props) {
  return (
    <>
      <main className="min-h-screen box-border px- pb-[90px] pt-[64px]">

        <section
  className="px-3 pt-2"
  data-block-page-swipe="true"
>
  <FeedGrid
  posts={mergedPosts}
  reportedPostIds={reportedPostIds}
  reportedVideoIds={reportedVideoIds}
  onOpenPost={handleOpenFeedPost}
  onOpenComments={openCommentSheet}
  onOpenShare={onOpenShare}
onDeletePost={handleDeletePost}
onOpenProfile={(post) => {
  setSelectedProfileUserId(post.user_id || post.id)
}}
/>
</section>

        
      </main>

<AnimatePresence>
  {isFollowingFeedOpen && (
    <FollowingFeedPage
      onClose={() => setIsFollowingFeedOpen(false)}
      onOpenPost={(post) => {
        setIsFollowingFeedOpen(false)

        if (post.type === 'video' || post.videoUrl) {
          setShortVideoStartId(post.id)
          setIsShortVideoPageOpen(true)
          return
        }

        openDetailPost(post)
      }}
    />
  )}
</AnimatePresence>

<AnimatePresence>
  {isFavoriteFeedOpen && (
    <FavoriteFeedPage
  posts={mergedPosts}
  onClose={() => setIsFavoriteFeedOpen(false)}
  onOpenPost={(post) => {
    setIsFavoriteFeedOpen(false)

    if (post.type === 'video' || post.videoUrl) {
      setShortVideoStartId(post.id)
      setIsShortVideoPageOpen(true)
      return
    }

    openDetailPost(post)
  }}
/>
  )}
</AnimatePresence>
    </>
  )
}
