import { supabase } from '@/lib/supabase'
import { scoreFeedPost } from './scoreFeedPost'
import type { FeedContext, FeedPost } from './feedTypes'

export async function getPersonalizedFeed(currentUserId?: string | null) {
  const followingUserIds = await getFollowingUserIds(currentUserId)
  const interestTags = await getUserInterestTags(currentUserId)

  const context: FeedContext = {
    currentUserId,
    followingUserIds,
    interestTags,
  }

  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id,
      user_id,
      caption,
      created_at,
      ai_tags,
      ai_style_tags,
      ai_caption,
      profiles (
        id,
        username,
        display_name,
        avatar_url
      ),
      post_images (
        image_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(80)

  if (error) {
    console.error('getPersonalizedFeed posts failed:', error)
    return []
  }

  const postIds = (posts ?? []).map((post: any) => post.id)

  const [likesMap, commentsMap, likedSet, savedSet] = await Promise.all([
    getLikeCounts(postIds),
    getCommentCounts(postIds),
    getLikedPostIds(currentUserId, postIds),
    getSavedPostIds(currentUserId, postIds),
  ])

  return (posts ?? [])
    .map((post: any) => {
      const normalizedPost: FeedPost = {
        ...post,
        likes: likesMap.get(post.id) ?? 0,
        comments: commentsMap.get(post.id) ?? 0,
        isLiked: likedSet.has(post.id),
        isSaved: savedSet.has(post.id),
        isFollowing: followingUserIds.includes(post.user_id),
      }

      const scoreResult = scoreFeedPost({
  post: normalizedPost,
  currentUserInterestTags: context.interestTags,
})

      return {
        ...normalizedPost,
        feedScore: scoreResult.score,
        feedReasons: scoreResult.reasons,
      }
    })
    .sort((a: any, b: any) => b.feedScore - a.feedScore)
}

async function getFollowingUserIds(currentUserId?: string | null) {
  if (!currentUserId) return []

  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', currentUserId)

  if (error) {
    console.error('getFollowingUserIds failed:', error)
    return []
  }

  return (data ?? []).map((row: any) => row.following_id)
}

async function getUserInterestTags(currentUserId?: string | null) {
  if (!currentUserId) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('interest_tags')
    .eq('id', currentUserId)
    .maybeSingle()

  if (error) {
    return []
  }

  return Array.isArray(data?.interest_tags) ? data.interest_tags : []
}

async function getLikeCounts(postIds: string[]) {
  const map = new Map<string, number>()
  if (postIds.length === 0) return map

  const { data, error } = await supabase
    .from('likes')
    .select('post_id')
    .in('post_id', postIds)

  if (error) return map

  ;(data ?? []).forEach((row: any) => {
    map.set(row.post_id, (map.get(row.post_id) ?? 0) + 1)
  })

  return map
}

async function getCommentCounts(postIds: string[]) {
  const map = new Map<string, number>()
  if (postIds.length === 0) return map

  const { data, error } = await supabase
    .from('comments')
    .select('post_id')
    .in('post_id', postIds)

  if (error) return map

  ;(data ?? []).forEach((row: any) => {
    map.set(row.post_id, (map.get(row.post_id) ?? 0) + 1)
  })

  return map
}

async function getLikedPostIds(
  currentUserId: string | null | undefined,
  postIds: string[]
) {
  const set = new Set<string>()
  if (!currentUserId || postIds.length === 0) return set

  const { data } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', currentUserId)
    .in('post_id', postIds)

  ;(data ?? []).forEach((row: any) => {
    set.add(row.post_id)
  })

  return set
}

async function getSavedPostIds(
  currentUserId: string | null | undefined,
  postIds: string[]
) {
  const set = new Set<string>()
  if (!currentUserId || postIds.length === 0) return set

  const { data } = await supabase
    .from('saved_posts')
    .select('post_id')
    .eq('user_id', currentUserId)
    .in('post_id', postIds)

  ;(data ?? []).forEach((row: any) => {
    set.add(row.post_id)
  })

  return set
}