import { supabase } from '@/lib/supabase'

export async function ensureUserProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Vibelink User'

  const username = `user_${user.id.slice(0, 5)}`

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        username,
        display_name: displayName,
      },
      {
        onConflict: 'id',
      }
    )
    .select('id, username, display_name, bio')
    .single()

  if (error) {
    console.error('ensureUserProfile error:', error)
    return null
  }

  return data
}