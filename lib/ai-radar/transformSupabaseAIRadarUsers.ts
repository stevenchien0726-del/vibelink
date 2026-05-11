
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

    
    
      const tags = [
      ...(row.ai_tags ?? []),
      ...(row.ai_style_tags ?? []),
    ]

    return {
      id: profile?.id ?? row.id,
      username: profile?.username ?? 'vibelink_user',
      display_name: profile?.display_name ?? 'Vibelink User',
      avatar_url: profile?.avatar_url ?? '',
      bio: row.ai_caption ?? '',
      city: '',
      tags,
      vibe_tags: tags,
      images,
    }
  })
}