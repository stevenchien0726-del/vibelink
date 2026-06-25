import { supabase } from '@/lib/supabase'

type SearchParams = {
  tags?: string[]
  city?: string
  gender?: 'male' | 'female'
  requiredTags?: string[]
  preferredTags?: string[]
}

export async function searchAIRadarUsersSupabase({
  tags = [],
  city,
  gender,
  requiredTags = [],
  preferredTags = [],
}: SearchParams) {
  const searchTags = [
    ...tags,
    ...requiredTags,
    ...preferredTags,
  ]
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.toLowerCase().trim())
    .filter(Boolean)

  const uniqueSearchTags = [...new Set(searchTags)]

  async function runQuery(includeProfileMetadata: boolean) {
    let query = supabase
      .from('posts')
      .select(`
        id,
        user_id,
        caption,
        ai_tags,
        ai_style_tags,
        ai_caption,
        ai_analyzed,
        created_at,
        profiles (
          id,
          username,
          display_name,
          avatar_url${includeProfileMetadata ? ', city, gender' : ''}
        ),
        post_images (
          image_url
        )
      `)
      .eq('ai_analyzed', true)
      .not('ai_tags', 'is', null)
      .limit(50)

    if (uniqueSearchTags.length > 0) {
      query = query.overlaps('ai_tags', uniqueSearchTags)
    }

    if (includeProfileMetadata && city) {
      query = query.eq('profiles.city', city)
    }

    if (includeProfileMetadata && gender) {
      query = query.eq('profiles.gender', gender)
    }

    return query
  }

  let { data, error } = await runQuery(true)

  if (error) {
    const shouldRetryWithoutOptionalProfileFields =
      String(error.message ?? error).includes('city') ||
      String(error.message ?? error).includes('gender') ||
      String(error.message ?? error).includes('profiles')

    if (shouldRetryWithoutOptionalProfileFields) {
      const fallback = await runQuery(false)
      data = fallback.data
      error = fallback.error
    }
  }

  if (error) {
    console.error('searchAIRadarUsersSupabase failed:', error)
    return []
  }

  return data ?? []
}
