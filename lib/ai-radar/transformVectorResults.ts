import type { FakeUser } from '@/data/fakeUsers'

export function transformVectorResults(rows: any[]): FakeUser[] {
  return rows.map((row) => {
    const profile = row.profiles

    const images =
      row.posts
        ?.flatMap((post: any) =>
          post.post_images?.map((img: any) => img.image_url) ?? []
        )
        .filter(Boolean) ?? []

    return {
  id: row.id,
  username: row.username || 'vibelink_user',
  displayName:
    row.display_name ||
    row.username ||
    'Vibelink User',
  avatar: row.avatar_url || '',
  bio: row.bio || '',
  city: row.city || '',
  tags:
    row.posts
      ?.flatMap((post: any) => [
        ...(post.ai_tags ?? []),
        ...(post.ai_style_tags ?? []),
      ])
      .filter(Boolean) ?? [],
  images,
  aiScore: row.similarity ?? 0,
  matchedReasons: [`Vector similarity: ${row.similarity ?? 0}`],
} as any
  })
}