export function transformSupabaseAIRadarUsers(rows: any[]) {
  return rows.map((row) => {
    const profile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles

    const images = Array.isArray(row.post_images)
      ? row.post_images
          .map((image: any) => image.image_url)
          .filter(Boolean)
      : []

    const primaryImage = images[0] ?? ''

    const tags = [
      ...(row.ai_tags ?? []),
      ...(row.ai_style_tags ?? []),
    ]

    const matchCount = tags.length

    return {
  id: profile?.id ?? row.id,
  username: profile?.username ?? 'vibelink_user',
  displayName:
    profile?.display_name ??
    profile?.username ??
    'Vibelink User',
  avatar: profile?.avatar_url ?? '',
  bio: row.ai_caption ?? '',
  city: '',
  tags,
  images,
  primaryImage,
  matchCount,
}
  })
}