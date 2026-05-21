'use client'

import { MoreHorizontal } from 'lucide-react'

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
  return (
    <div className="mt-5 border-t border-[#ddd] px-4 pt-4">
      <div className="mb-4 text-[15px] font-medium text-[#222]">
        留言
      </div>

      <div className="mb-4 flex gap-2">
        <input
          value={commentText}
          onChange={(e) => onChangeCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmitComment()
          }}
          placeholder="新增留言..."
          className="h-[42px] flex-1 rounded-full border border-[#ddd] bg-white px-4 text-[14px] text-[#222] outline-none"
        />

        <button
          type="button"
          onClick={onSubmitComment}
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
                onClick={() => onOpenCommentMenu(comment)}
                className="mr-[2px] mt-[0px] flex h-[20px] w-[20px] items-center justify-center rounded-full active:scale-90"
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