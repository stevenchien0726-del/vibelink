import { supabase } from '@/lib/supabase'
import { loadComments } from './profileApi'

type OpenPostArgs = {
  post: any
  savedPosts: any[]
  setSelectedPost: (value: any) => void
  setSelectedPostImageIndex: (value: number) => void
  setSelectedPostLiked: (value: boolean) => void
  setSelectedPostLikeCount: (value: number) => void
  setSelectedPostSaved: (value: boolean) => void
  setCommentText: (value: string) => void
  setComments: (value: any[]) => void
}

export async function openSelectedPostHandler({
  post,
  savedPosts,
  setSelectedPost,
  setSelectedPostImageIndex,
  setSelectedPostLiked,
  setSelectedPostLikeCount,
  setSelectedPostSaved,
  setCommentText,
  setComments,
}: OpenPostArgs) {
  const fullPost = {
    ...post,
    post_images: post.post_images ?? [],
  }

  setSelectedPost(fullPost)
  setSelectedPostImageIndex(0)
  setSelectedPostLiked(!!post.isLiked)
  setSelectedPostLikeCount(post.likes ?? 0)
  setSelectedPostSaved(savedPosts.some((savedPost) => savedPost.id === post.id))
  setCommentText('')
  setComments([])

  const nextComments = await loadComments(post.id)
  setComments(nextComments)
}

type SubmitArgs = {
  selectedPost: any
  commentText: string
  setCommentLoading: (value: boolean) => void
  setCommentText: (value: string) => void
  setComments: (value: any[]) => void
}

export async function submitCommentHandler({
  selectedPost,
  commentText,
  setCommentLoading,
  setCommentText,
  setComments,
}: SubmitArgs) {
  if (!selectedPost?.id) return

  const text = commentText.trim()
  if (!text) return

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    alert('請先登入')
    return
  }

  setCommentLoading(true)

  const { error } = await supabase.from('comments').insert({
    post_id: selectedPost.id,
    user_id: user.id,
    content: text,
  })

  if (error) {
    console.error('送出留言失敗:', error)
    setCommentLoading(false)
    return
  }

  setCommentText('')

  const nextComments = await loadComments(selectedPost.id)
  setComments(nextComments)

  setCommentLoading(false)
}

type DeleteArgs = {
  selectedComment: any
  setComments: (value: any) => void
  setIsCommentMenuOpen: (value: boolean) => void
  setSelectedComment: (value: any) => void
}

export async function deleteCommentHandler({
  selectedComment,
  setComments,
  setIsCommentMenuOpen,
  setSelectedComment,
}: DeleteArgs) {
  if (!selectedComment?.id) return

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', selectedComment.id)

  if (error) {
    console.error('刪除留言失敗:', error)
    alert('刪除留言失敗')
    return
  }

  setComments((prev: any[]) =>
    prev.filter((comment) => comment.id !== selectedComment.id)
  )

  setIsCommentMenuOpen(false)
  setSelectedComment(null)
}