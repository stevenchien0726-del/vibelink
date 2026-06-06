import { supabase } from '@/lib/supabase'
import { generateEmbedding } from './generateEmbedding'

const MAX_VECTOR_USERS = 10
const MAX_POSTS_PER_USER = 5
const MAX_IMAGES_PER_POST = 2

export async function searchVectorUsers(
  query: string,
  signal?: AbortSignal
) {
  const embedding = await generateEmbedding(query, signal)

  const { data: matches, error: matchError } = await supabase.rpc(
    'match_profile_embeddings',
    {
      query_embedding: embedding,
      match_count: MAX_VECTOR_USERS,
    }
  )

  if (matchError) {
    console.error('Vector search failed:', matchError)
    throw matchError
  }

  const userIds = Array.from(
    new Set<string>(
      (matches ?? [])
        .map((item: any) => item.user_id)
        .filter((userId: unknown): userId is string => {
          return typeof userId === 'string' && userId.length > 0
        })
    )
  )

  if (userIds.length === 0) return []

  const similarityMap = new Map(
    (matches ?? []).map((item: any) => [item.user_id, item.similarity])
  )

  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      display_name,
      avatar_url,
      bio
    `)
    .in('id', userIds)

  if (usersError) {
    console.error('Load vector users failed:', usersError)
    throw usersError
  }

  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select(`
      id,
      user_id,
      caption,
      ai_tags,
      ai_style_tags,
      created_at
    `)
    .in('user_id', userIds)
    .order('created_at', { ascending: false })
    .limit(userIds.length * MAX_POSTS_PER_USER)

  if (postsError) {
    console.error('Load vector user posts failed:', postsError)
    throw postsError
  }

  const postIds = (posts ?? []).map((post) => post.id)
  const imagesByPost = new Map<
    string,
    Array<{ image_url: string }>
  >()

  if (postIds.length > 0) {
    const { data: images, error: imagesError } = await supabase
      .from('post_images')
      .select('post_id, image_url')
      .in('post_id', postIds)
      .limit(postIds.length * MAX_IMAGES_PER_POST)

    if (imagesError) {
      console.error('Load vector post images failed:', imagesError)
      throw imagesError
    }

    for (const image of images ?? []) {
      const postImages = imagesByPost.get(image.post_id) ?? []

      if (postImages.length >= MAX_IMAGES_PER_POST) {
        continue
      }

      postImages.push({ image_url: image.image_url })
      imagesByPost.set(image.post_id, postImages)
    }
  }

  const postsByUser = new Map<string, any[]>()

  for (const post of posts ?? []) {
    const userPosts = postsByUser.get(post.user_id) ?? []

    if (userPosts.length >= MAX_POSTS_PER_USER) {
      continue
    }

    userPosts.push({
      ...post,
      post_images: imagesByPost.get(post.id) ?? [],
    })
    postsByUser.set(post.user_id, userPosts)
  }

  const usersById = new Map(
    (users ?? []).map((user: any) => [user.id, user])
  )

  return userIds.flatMap((userId) => {
    const user = usersById.get(userId)

    if (!user) return []

    return [
      {
        ...user,
        posts: postsByUser.get(userId) ?? [],
        similarity: similarityMap.get(userId) ?? 0,
      },
    ]
  })
}
