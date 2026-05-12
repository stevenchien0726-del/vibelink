import { supabase } from '@/lib/supabase'

type SearchParams = {
  tags?: string[]
}

export async function searchAIRadarUsersSupabase({
  tags = [],
}: SearchParams) {
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
        avatar_url
      ),
      post_images (
        image_url
      )
    `)
    .eq('ai_analyzed', true)
    .not('ai_tags', 'is', null)
    .limit(50)

  if (tags.length > 0) {
    query = query.overlaps('ai_tags', tags)
  }

  const { data, error } = await query

  if (error) {
    console.error('searchAIRadarUsersSupabase failed:', error)
    return []
  }

  return data ?? []
}