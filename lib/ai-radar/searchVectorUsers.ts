import { supabase } from '@/lib/supabase'
import { generateEmbedding } from './generateEmbedding'

export async function searchVectorUsers(query: string) {
  const embedding = await generateEmbedding(query)

  const { data: matches, error: matchError } = await supabase.rpc(
    'match_profile_embeddings',
    {
      query_embedding: embedding,
      match_count: 10,
    }
  )

  if (matchError) {
    console.error('Vector search failed:', matchError)
    throw matchError
  }

  const userIds = (matches ?? []).map((item: any) => item.user_id)

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
      bio,
      posts (
        id,
        caption,
        ai_tags,
        ai_style_tags,
        post_images (
          image_url
        )
      )
    `)
    .in('id', userIds)

  if (usersError) {
    console.error('Load vector users failed:', usersError)
    throw usersError
  }

  return (users ?? []).map((user: any) => ({
    ...user,
    similarity: similarityMap.get(user.id) ?? 0,
  }))
}