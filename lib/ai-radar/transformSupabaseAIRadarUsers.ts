/* eslint-disable @typescript-eslint/no-explicit-any */
type TransformOptions = {
  tags?: string[]
  requiredTags?: string[]
  preferredTags?: string[]
  vibes?: string[]
}

function normalizeTag(value: unknown) {
  return typeof value === 'string' ? value.toLowerCase().trim() : ''
}

function uniqueStrings(values: unknown[]) {
  return [
    ...new Set(
      values
        .map(normalizeTag)
        .filter(Boolean)
    ),
  ]
}

export function transformSupabaseAIRadarUsers(
  rows: any[],
  options: TransformOptions = {}
) {
  const queryTags = uniqueStrings([
    ...(options.tags ?? []),
    ...(options.requiredTags ?? []),
    ...(options.preferredTags ?? []),
  ])
  const queryVibes = uniqueStrings(options.vibes ?? [])
  const usersById = new Map<string, any>()

  for (const row of rows ?? []) {
    const profile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles
    const userId = profile?.id ?? row.user_id ?? row.id

    if (!userId) continue

    const images = Array.isArray(row.post_images)
      ? row.post_images
          .map((image: any) => image.image_url)
          .filter(Boolean)
      : []
    const aiTags = uniqueStrings(row.ai_tags ?? [])
    const aiStyleTags = uniqueStrings(row.ai_style_tags ?? [])
    const postTags = uniqueStrings([...aiTags, ...aiStyleTags])
    const existing = usersById.get(userId)
    const user =
      existing ??
      {
        id: userId,
        username: profile?.username ?? 'vibelink_user',
        displayName:
          profile?.display_name ??
          profile?.username ??
          'Vibelink User',
        avatar: profile?.avatar_url ?? '',
        bio: profile?.bio ?? row.ai_caption ?? '',
        city: profile?.city ?? '',
        gender: profile?.gender,
        tags: [],
        aiTags: [],
        ai_tags: [],
        aiStyleTags: [],
        ai_style_tags: [],
        images: [],
        posts: [],
        captions: [],
        recentCaptions: [],
        matchedReasons: [],
        matchCount: 0,
      }

    user.images = [...new Set([...user.images, ...images])]
    user.primaryImage = user.images[0] ?? ''
    user.aiTags = uniqueStrings([...user.aiTags, ...aiTags])
    user.ai_tags = user.aiTags
    user.aiStyleTags = uniqueStrings([...user.aiStyleTags, ...aiStyleTags])
    user.ai_style_tags = user.aiStyleTags
    user.tags = uniqueStrings([...user.tags, ...postTags])

    if (row.caption) {
      user.captions = [...new Set([...user.captions, row.caption])]
      user.recentCaptions = user.captions.slice(0, 5)
    }

    user.posts.push({
      id: row.id,
      caption: row.caption,
      ai_tags: row.ai_tags ?? [],
      ai_style_tags: row.ai_style_tags ?? [],
      ai_caption: row.ai_caption,
      created_at: row.created_at,
      post_images: row.post_images ?? [],
    })

    const matchedTags = queryTags.filter((tag) =>
      user.tags.includes(tag)
    )
    const matchedVibes = queryVibes.filter((vibe) =>
      user.tags.includes(vibe)
    )
    const matchedReasons = uniqueStrings([
      ...matchedTags,
      ...matchedVibes,
    ])

    user.matchCount = matchedReasons.length
    user.matchedReasons = matchedReasons

    usersById.set(userId, user)
  }

  return Array.from(usersById.values())
}
