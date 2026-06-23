'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Heart,
  MessageCircle,
  Send,
  ChevronLeft,
  MoreHorizontal,
  Bookmark,
} from 'lucide-react'

import ProfileCommentsSection from '@/components/profile/ProfileCommentsSection'

type Props = {
  open: boolean
  selectedPost: any
  selectedPostImageIndex: number
  selectedPostLiked: boolean
  selectedPostLikeCount: number
  selectedPostSaved: boolean
  comments: any[]
  commentText: string
  commentLoading: boolean
  profile: any
  isPostMenuOpen: boolean
  isCommentMenuOpen: boolean
  selectedComment: any
  onClose: () => void
  onToggleLike: () => void
  onToggleSave: () => void
  onSubmitComment: () => void
  onDeleteComment: () => void
  setCommentText: (value: string) => void
  setSelectedPostImageIndex: (index: number) => void
  setIsPostMenuOpen: (value: boolean) => void
  setIsCommentMenuOpen: (value: boolean) => void
  setSelectedComment: (value: any) => void
  handlePostImageTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void
  handlePostImageTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void
  handlePostImageTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void
  handlePostDetailTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void
  handlePostDetailTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void
  handlePostDetailTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void
}

export default function ProfilePostDetailModal({
  open,
  selectedPost,
  selectedPostImageIndex,
  selectedPostLiked,
  selectedPostLikeCount,
  selectedPostSaved,
  comments,
  commentText,
  commentLoading,
  profile,
  isCommentMenuOpen,
  selectedComment,
  onClose,
  onToggleLike,
  onToggleSave,
  onSubmitComment,
  onDeleteComment,
  setCommentText,
  setSelectedPostImageIndex,
  setIsPostMenuOpen,
  setIsCommentMenuOpen,
  setSelectedComment,
  handlePostImageTouchStart,
  handlePostImageTouchMove,
  handlePostImageTouchEnd,
  handlePostDetailTouchStart,
  handlePostDetailTouchMove,
  handlePostDetailTouchEnd,
}: Props) {
  const postImages = selectedPost?.post_images ?? []

  return (
    <AnimatePresence>
      {open && postImages.length > 0 && (
        <motion.div
          data-block-page-swipe="true"
          className="fixed inset-0 z-[500] bg-[var(--app-bg)] text-[var(--app-text)]"
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
          <div className="fixed left-1/2 top-0 z-[510] flex h-[58px] w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[var(--app-bg)]/95 px-4 backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
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
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-[34px] w-[34px] rounded-full bg-[var(--app-muted)]" />
                <div className="text-[15px] font-medium text-[var(--app-text)]">
                  {profile?.display_name || profile?.username || 'Vibelink User'}
                </div>
              </div>
            </div>

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
                  {postImages.map((img: any, index: number) => (
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

              {postImages.length > 1 && (
                <div className="mt-3 flex justify-center gap-2">
                  {postImages.map((_: any, index: number) => (
                    <span
                      key={index}
                      className={`h-[7px] w-[7px] rounded-full transition-colors ${
                        selectedPostImageIndex === index
                          ? 'bg-[#A855F7]'
                          : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-4 pt-4">
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={onToggleLike}
                  className="flex items-center gap-1.5 active:scale-90"
                >
                  <Heart
                    size={25}
                    color="#c86cff"
                    fill={selectedPostLiked ? '#c86cff' : 'none'}
                    strokeWidth={2.1}
                  />
                  <span className="text-[15px] text-[var(--app-muted)]">
                    {selectedPostLikeCount}
                  </span>
                </button>

                <button type="button" className="active:scale-90">
                  <MessageCircle size={25} strokeWidth={2.1} />
                </button>
              </div>

              <div className="flex items-center gap-5">
                <button type="button" className="active:scale-90">
                  <Send size={24} strokeWidth={2.1} />
                </button>

                <button
                  type="button"
                  onClick={onToggleSave}
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

            {selectedPost.caption && (
              <div className="px-4 pt-3 text-[15px] text-[var(--app-text)]">
                {selectedPost.caption}
              </div>
            )}

            <ProfileCommentsSection
              comments={comments}
              commentText={commentText}
              commentLoading={commentLoading}
              onChangeCommentText={setCommentText}
              onSubmitComment={onSubmitComment}
              onOpenCommentMenu={(comment) => {
                setSelectedComment(comment)
                requestAnimationFrame(() => {
                  setIsCommentMenuOpen(true)
                })
              }}
            />
          </div>

          <AnimatePresence>
            {isCommentMenuOpen && selectedComment && (
              <>
                <motion.div
                  className="fixed inset-0 z-[620] bg-black/20"
                  onClick={() => {
                    setIsCommentMenuOpen(false)
                    setSelectedComment(null)
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />

                <motion.div
                  className="fixed bottom-0 left-1/2 z-[630] w-full max-w-[430px] -translate-x-1/2 rounded-t-[24px] bg-[var(--app-card)] px-5 pt-4 pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.12)]"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                >
                  <div className="mb-4 flex justify-center">
                    <div className="h-[4px] w-[40px] rounded-full bg-[#bbb]" />
                  </div>

                  {selectedComment.user_id === selectedPost?.user_id ? (
                    <button
                      type="button"
                      onClick={onDeleteComment}
                      className="flex h-[52px] w-full items-center justify-center rounded-[16px] text-[16px] font-medium text-red-500 active:bg-black/5"
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
                      className="flex h-[52px] w-full items-center justify-center rounded-[16px] text-[16px] font-medium text-[var(--app-text)] active:bg-black/5"
                    >
                      檢舉留言
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
