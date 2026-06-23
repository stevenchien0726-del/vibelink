'use client'

import { MoreHorizontal } from 'lucide-react'
import { uiText } from '@/lib/uiText'

type Props = {
  comments: any[]
  commentText: string
  commentLoading: boolean
  onChangeCommentText: (value: string) => void
  onSubmitComment: () => void
  onOpenCommentMenu: (comment: any) => void
}

export default function ProfileCommentsSection({
  comments,
  commentText,
  commentLoading,
  onChangeCommentText,
  onSubmitComment,
  onOpenCommentMenu,
}: Props) {
  const text = {
    comments: uiText('留言', 'Comments'),
    placeholder: uiText('新增留言...', 'Add a comment...'),
    send: uiText('送出', 'Send'),
    empty: uiText('尚無留言，成為第一個留言的人', 'No comments yet. Be the first to comment.'),
  }

  return (
    <div className="mt-5 border-t border-[var(--app-card-border)] px-4 pt-4">
      <div className="mb-4 text-[15px] font-medium text-[var(--app-text)]">
        {text.comments}
      </div>

      <div className="mb-4 flex gap-2">
        <input
          value={commentText}
          onChange={(e) => onChangeCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmitComment()
          }}
          placeholder={text.placeholder}
          className="h-[42px] flex-1 rounded-full border border-[var(--app-card-border)] bg-[var(--app-surface)] px-4 text-[14px] text-[var(--app-text)] placeholder:text-[var(--app-muted)] outline-none"
        />

        <button
          type="button"
          onClick={onSubmitComment}
          disabled={commentLoading || !commentText.trim()}
          className={`h-[42px] rounded-full px-4 text-[14px] font-medium ${
            commentText.trim()
              ? 'bg-[#c86cff] text-white'
              : 'bg-[var(--app-surface)] text-[var(--app-muted)]'
          }`}
        >
          {text.send}
        </button>
      </div>

      {comments.length === 0 ? (
        <div className="text-[14px] text-[var(--app-muted)]">
          {text.empty}
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
                <div className="text-[13px] font-medium text-[var(--app-text)]">
                  {comment.profiles?.display_name ||
                    comment.profiles?.username ||
                    'Vibelink User'}
                </div>

                <div className="mt-1 text-[14px] text-[var(--app-text)]">
                  {comment.content}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenCommentMenu(comment)}
                className="mr-[2px] mt-[0px] flex h-[20px] w-[20px] items-center justify-center rounded-full text-[var(--app-muted)] active:scale-90"
              >
                <MoreHorizontal size={20} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
