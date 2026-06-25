/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase'
import { buildEmbeddingText } from './buildEmbeddingText'
import { generateEmbedding } from './generateEmbedding'

type EmbeddingPost = {
  caption?: string | null
  ai_tags?: string[] | null
  ai_style_tags?: string[] | null
}

type EmbeddingProfile = {
  id: string
  username?: string | null
  display_name?: string | null
  avatar_url?: string | null
  bio?: string | null
  city?: string | null
  posts?: EmbeddingPost[] | null
}

type ProfileLoadResult = {
  data: EmbeddingProfile | null
  error: { message?: string } | null
}

export async function upsertProfileEmbedding(userId: string) {
  if (!userId) {
    throw new Error('upsertProfileEmbedding: missing userId')
  }

  async function loadProfile(includeCity: boolean) {
    const profileSelect = includeCity
      ? `
        id,
        username,
        display_name,
        avatar_url,
        bio,
        city,
        posts (
          caption,
          ai_tags,
          ai_style_tags
        )
      `
      : `
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
      `

    const result = await supabase
      .from('profiles')
      .select(profileSelect)
      .eq('id', userId)
      .maybeSingle()

    return result as unknown as ProfileLoadResult
  }

  let { data: profile, error: profileError } = await loadProfile(true)

  if (
    profileError &&
    String(profileError.message ?? profileError).includes('city')
  ) {
    const fallback = await loadProfile(false)
    profile = fallback.data
    profileError = fallback.error
  }

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
    city: profile.city,
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
