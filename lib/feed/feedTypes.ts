export type FeedProfile = {
  id: string
  username?: string | null
  display_name?: string | null
  avatar_url?: string | null
}

export type FeedImage = {
  image_url: string
}

export type FeedPost = {
  id: string
  user_id: string
  caption?: string | null
  created_at: string
  profiles?: FeedProfile | FeedProfile[] | null
  post_images?: FeedImage[]
  likes?: number
  comments?: number
  isLiked?: boolean
  isSaved?: boolean
  isFollowing?: boolean
  ai_tags?: string[] | null
  ai_style_tags?: string[] | null
  ai_caption?: string | null
}

export type FeedScoreResult = {
  score: number
  reasons: string[]
}

export type FeedContext = {
  currentUserId?: string | null
  followingUserIds: string[]
  interestTags: string[]
}