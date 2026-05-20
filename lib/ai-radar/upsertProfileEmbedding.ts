import { supabase } from '@/lib/supabase'
import { buildEmbeddingText } from './buildEmbeddingText'
import { generateEmbedding } from './generateEmbedding'

export async function upsertProfileEmbedding(userId: string) {
  if (!userId) {
    throw new Error('upsertProfileEmbedding: missing userId')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      display_name,
      avatar_url,
      bio,
      posts (
        caption,
        ai_tags,
        ai_style_tags
      )
    `)
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    console.error('Load profile for embedding failed:', profileError)
    throw profileError
  }

  if (!profile) {
    throw new Error('Profile not found')
  }

  const captions =
    profile.posts?.map((post: any) => post.caption).filter(Boolean) ?? []

  const aiTags =
    profile.posts
      ?.flatMap((post: any) => post.ai_tags ?? [])
      .filter(Boolean) ?? []

  const aiStyleTags =
    profile.posts
      ?.flatMap((post: any) => post.ai_style_tags ?? [])
      .filter(Boolean) ?? []

  const embeddingText = buildEmbeddingText({
    displayName: profile.display_name,
    username: profile.username,
    bio: profile.bio,
    captions,
    aiTags,
    aiStyleTags,
  })

  if (!embeddingText) {
    throw new Error('No embedding text generated')
  }

  const embedding = await generateEmbedding(embeddingText)

  const { error: upsertError } = await supabase
    .from('profile_embeddings')
    .upsert(
      {
        user_id: userId,
        embedding,
        embedding_text: embeddingText,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )

  if (upsertError) {
    console.error('Upsert profile embedding failed:', upsertError)
    throw upsertError
  }

  return {
    userId,
    embeddingText,
  }
}