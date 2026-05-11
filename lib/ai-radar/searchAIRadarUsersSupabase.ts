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
      content,
      ai_tags,
      ai_style_tags,
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
    .limit(30)

  if (tags.length > 0) {
    query = query.overlaps('ai_tags', tags)
  }

  const { data, error } = await query

  if (error) {
    console.error(
      'searchAIRadarUsersSupabase failed:',
      error
    )

    return []
  }

  return data ?? []
}