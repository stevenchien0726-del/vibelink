'use client'

import type { Dispatch, SetStateAction } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bookmark,
  ChevronLeft,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from 'lucide-react'
import WideMenuSheet from '@/components/WideMenuSheet'
import type { PostItem } from '@/components/home/sections/feed/FeedGrid'

type Props = {
  selectedPost: PostItem | null
  reportedPostIds: string[]
  setReportedPostIds: Dispatch<SetStateAction<string[]>>
  setSelectedPost: (post: PostItem | null) => void
  setSelectedProfileUserId: (userId: string | null) => void
  isDetailMenuOpen: boolean
  setIsDetailMenuOpen: (open: boolean) => void
  handleDetailTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void
  handleDetailTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void
  handleDetailImageTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void
  handleDetailImageTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void
  handleDetailImageTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void
  handleDetailDoubleLike: () => void
  detailImageIndex: number
  detailBigHeartVisible: boolean
  selectedPostLiked: boolean
  selectedPostLikeCount: number
  toggleDetailLike: () => void
  onOpenShare: (post: PostItem) => void
  selectedPostSaved: boolean
  toggleDetailSave: () => void
  commentSectionRef: React.RefObject<HTMLDivElement | null>
  commentText: string
  setCommentText: (text: string) => void
  submitComment: () => void
  commentLoading: boolean
  comments: any[]
  setSelectedComment: (comment: any) => void
  setIsCommentMenuOpen: (open: boolean) => void
  onChangeReplyPermission?: (
    postId: string,
    value: 'everyone' | 'following' | 'off'
  ) => void
}

export default function HomeDetailPostModal({
  selectedPost,
  reportedPostIds,
  setReportedPostIds,
  setSelectedPost,
  setSelectedProfileUserId,
  isDetailMenuOpen,
  setIsDetailMenuOpen,
  handleDetailTouchStart,
  handleDetailTouchEnd,
  handleDetailImageTouchStart,
  handleDetailImageTouchMove,
  handleDetailImageTouchEnd,
  handleDetailDoubleLike,
  detailImageIndex,
  detailBigHeartVisible,
  selectedPostLiked,
  selectedPostLikeCount,
  toggleDetailLike,
  onOpenShare,
  selectedPostSaved,
  toggleDetailSave,
  commentSectionRef,
  commentText,
  setCommentText,
  submitComment,
  commentLoading,
  comments,
  setSelectedComment,
  setIsCommentMenuOpen,
  onChangeReplyPermission,
}: Props) {
  function isPostReported(postId: string) {
    return reportedPostIds.includes(postId)
  }

  return (
    <>
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            data-block-page-swipe="true"
            className="fixed inset-0 z-[700] overflow-x-hidden bg-[var(--app-bg)] text-[var(--app-text)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 34 }}
            onTouchStart={handleDetailTouchStart}
            onTouchEnd={handleDetailTouchEnd}
          >
            <div className="mx-auto h-full w-full max-w-[430px] overflow-x-hidden overflow-y-auto pb-[110px] scrollbar-hide">
              <div className="sticky top-0 z-[20] flex h-[56px] items-center justify-between bg-[var(--app-surface)]/95 px-4 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailMenuOpen(false)
                    setSelectedPost(null)
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full active:scale-90"
                >
                  <ChevronLeft size={26} />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDetailMenuOpen(true)}
                    className="flex h-10 items-center gap-2 rounded-full px-2 active:scale-95"
                  >
                    <MoreHorizontal size={22} strokeWidth={2.4} />
                    <span className="text-[15px] font-medium">MENU</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (!selectedPost) return

                  setSelectedPost(null)
                  setSelectedProfileUserId(selectedPost.user_id || selectedPost.id)
                }}
                className="mb-5 ml-7 flex items-center gap-3 py-3 pr-5 active:scale-95"
              >
                <div className="h-[34px] w-[34px] overflow-hidden rounded-full bg-[var(--app-card)]">
                  {(selectedPost as any).avatarUrl ? (
                    <img
                      src={(selectedPost as any).avatarUrl}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="text-[15px] font-medium text-[var(--app-text)]">
                  {selectedPost.author}
                </div>
              </button>

              <div
                data-detail-image-area="true"
                data-block-page-swipe="true"
                className="mt-3 px-3"
                style={{ touchAction: 'pan-y' }}
                onTouchStart={handleDetailImageTouchStart}
                onTouchMove={handleDetailImageTouchMove}
                onTouchEnd={handleDetailImageTouchEnd}
              >
                <div
                  onDoubleClick={handleDetailDoubleLike}
                  className="relative aspect-square w-full overflow-hidden rounded-[18px] bg-[var(--app-card)]"
                >
                  <motion.div
                    className="flex h-full w-full"
                    animate={{ x: `-${detailImageIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 360, damping: 34 }}
                  >
                    {selectedPost.images.map((image, index) => (
                      <div
                        key={`${selectedPost.id}-detail-${index}`}
                        className="h-full w-full shrink-0"
                      >
                        <img
                          src={image}
                          className={`block h-full w-full object-cover ${
                            isPostReported(selectedPost.id)
                              ? 'scale-105 blur-xl opacity-60'
                              : ''
                          }`}
                          draggable={false}
                        />
                      </div>
                    ))}
                  </motion.div>

                  {isPostReported(selectedPost.id) && (
                    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/45 px-6 text-center text-[15px] font-medium text-white">
                      你已檢舉這篇貼文，內容已暫時隱藏
                    </div>
                  )}

                  <AnimatePresence>
                    {detailBigHeartVisible && (
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{
                          scale: [0.6, 1.5, 1.2],
                          opacity: [0, 1, 0],
                        }}
                        transition={{ duration: 0.6 }}
                        className="pointer-events-none absolute inset-0 z-[80] flex items-center justify-center"
                      >
                        <Heart size={90} fill="#c86cff" color="#c86cff" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {selectedPost.images.length > 1 && (
                    <div className="absolute right-3 top-3 rounded-full bg-black/20 px-3 py-1 text-[14px] text-[var(--app-text)] backdrop-blur-sm">
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
                          detailImageIndex === index
                            ? 'bg-[#c86cff]'
                            : 'bg-[var(--app-muted)]'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-4 pt-4">
                <div className="flex items-center gap-5">
                  <button
                    onClick={toggleDetailLike}
                    className="flex items-center gap-1.5 active:scale-90"
                  >
                    <Heart
                      size={25}
                      color="#c86cff"
                      fill={selectedPostLiked ? '#c86cff' : 'none'}
                    />
                    <span className="text-[15px] text-[var(--app-text)]">
                      {selectedPostLikeCount}
                    </span>
                  </button>

                  <button className="active:scale-90">
                    <MessageCircle size={25} strokeWidth={2.1} />
                  </button>
                </div>

                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() => onOpenShare(selectedPost)}
                    className="active:scale-90"
                  >
                    <Send size={25} strokeWidth={2.1} />
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
                <div className="px-4 pt-3 text-[15px] text-[var(--app-text)]">
                  {selectedPost.text}
                </div>
              )}

              <div
                ref={commentSectionRef}
                className="mt-5 border-t border-[var(--app-card-border)] px-4 pt-4"
              >
                <div className="mb-4 text-[15px] font-medium text-[var(--app-text)]">
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
                    className="h-[42px] flex-1 rounded-full border border-[var(--app-card-border)] bg-[var(--app-surface)] px-4 text-[14px] text-[var(--app-text)] outline-none"
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

                {comments.length === 0 ? (
                  <div className="text-[14px] text-[var(--app-muted)]">
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

      {isDetailMenuOpen && selectedPost && (
        <WideMenuSheet
          variant={selectedPost.isMine ? 'mine' : 'other'}
          isReported={isPostReported(selectedPost.id)}
          onClose={() => setIsDetailMenuOpen(false)}
          onReport={() => {
            setReportedPostIds((prev) =>
              prev.includes(selectedPost.id)
                ? prev.filter((id) => id !== selectedPost.id)
                : [...prev, selectedPost.id]
            )

            setIsDetailMenuOpen(false)
          }}
          replyPermission={selectedPost.reply_permission || 'everyone'}
          onChangeReplyPermission={(value) => {
            if (!selectedPost?.id) return

            onChangeReplyPermission?.(selectedPost.id, value)
          }}
        />
      )}
    </>
  )
}
