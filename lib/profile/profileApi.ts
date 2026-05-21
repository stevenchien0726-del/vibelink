import { supabase } from '@/lib/supabase'

export async function loadComments(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      user_id
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('讀取留言失敗:', error)
    return []
  }

  return data ?? []
}

export async function loadMyFollowerCount(userId: string) {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)

  if (error) {
    console.error('讀取粉絲數失敗:', error)
    throw error
  }

  return count ?? 0
}