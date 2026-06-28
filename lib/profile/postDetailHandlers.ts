import type { Dispatch, SetStateAction } from 'react'
import { supabase } from '@/lib/supabase'
import { loadComments } from './profileApi'

type PostImage = {
  image_url?: string | null
}

type ProfilePost = {
  id: string
  post_images?: PostImage[] | null
  reply_permission?: string | null
  isLiked?: boolean
  likes?: number
  isPinned?: boolean
  is_pinned?: boolean
  pinned_at?: string | null
  [key: string]: unknown
}

type CommentRecord = {
  id: string
  [key: string]: unknown
}

type OpenPostArgs = {
  post: ProfilePost
  savedPosts: ProfilePost[]
  setSelectedPost: Dispatch<SetStateAction<ProfilePost | null>>
  setSelectedPostImageIndex: (value: number) => void
  setSelectedPostLiked: (value: boolean) => void
  setSelectedPostLikeCount: (value: number) => void
  setSelectedPostSaved: (value: boolean) => void
  setCommentText: (value: string) => void
  setComments: Dispatch<SetStateAction<CommentRecord[]>>
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
  const basePost = {
    ...post,
    post_images: post.post_images ?? [],
    reply_permission: post.reply_permission || 'everyone',
  }

  setSelectedPost(basePost)
  setSelectedPostImageIndex(0)
  setSelectedPostLiked(!!post.isLiked)
  setSelectedPostLikeCount(post.likes ?? 0)
  setSelectedPostSaved(savedPosts.some((savedPost) => savedPost.id === post.id))
  setCommentText('')
  setComments([])

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [postResult, likesResult, myLikeResult, commentsResult] =
    await Promise.allSettled([
      supabase
        .from('posts')
        .select(`
          id,
          caption,
          created_at,
          user_id,
          is_pinned,
          pinned_at,
          reply_permission,
          post_images (
            image_url
          )
        `)
        .eq('id', post.id)
        .maybeSingle(),
      supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id),
      user
        ? supabase
            .from('likes')
            .select('post_id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      loadComments(post.id),
    ])

  const loadedPost =
    postResult.status === 'fulfilled' && !postResult.value.error
      ? postResult.value.data
      : null

  const likeCount =
    likesResult.status === 'fulfilled' && !likesResult.value.error
      ? likesResult.value.count ?? 0
      : post.likes ?? 0

  const isLiked =
    myLikeResult.status === 'fulfilled' && !myLikeResult.value.error
      ? Boolean(myLikeResult.value.data)
      : !!post.isLiked

  const nextComments =
    commentsResult.status === 'fulfilled' ? commentsResult.value : []

  const fullPost = {
    ...post,
    ...(loadedPost ?? {}),
    post_images: loadedPost?.post_images ?? post.post_images ?? [],
    isPinned: loadedPost?.is_pinned ?? post.isPinned,
    pinned_at: loadedPost?.pinned_at ?? post.pinned_at,
    reply_permission:
      loadedPost?.reply_permission || post.reply_permission || 'everyone',
  }

  setSelectedPost(fullPost)
  setSelectedPostLiked(isLiked)
  setSelectedPostLikeCount(likeCount)
  setComments(nextComments)
}

type SubmitArgs = {
  selectedPost: ProfilePost | null
  commentText: string
  setCommentLoading: (value: boolean) => void
  setCommentText: (value: string) => void
  setComments: Dispatch<SetStateAction<CommentRecord[]>>
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
  selectedComment: CommentRecord | null
  setComments: Dispatch<SetStateAction<CommentRecord[]>>
  setIsCommentMenuOpen: (value: boolean) => void
  setSelectedComment: (value: CommentRecord | null) => void
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

  setComments((prev) =>
    prev.filter((comment) => comment.id !== selectedComment.id)
  )

  setIsCommentMenuOpen(false)
  setSelectedComment(null)
}
