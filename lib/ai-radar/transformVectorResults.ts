/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FakeUser } from '@/data/fakeUsers'

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

function buildMatchedReasons(aiTags: string[], aiStyleTags: string[]) {
  const reasons: string[] = []

  if (aiTags.length > 0) {
    reasons.push(`Recent content has ${aiTags.slice(0, 3).join(' / ')} vibe`)
  }

  if (aiStyleTags.length > 0) {
    reasons.push(`Style feels close to ${aiStyleTags.slice(0, 3).join(' / ')}`)
  }

  return reasons
}

export function transformVectorResults(rows: any[]): FakeUser[] {
  return rows.map((row) => {
    const posts = Array.isArray(row.posts) ? row.posts : []
    const images =
      posts
        .flatMap((post: any) =>
          post.post_images?.map((img: any) => img.image_url) ?? []
        )
        .filter(Boolean) ?? []
    const aiTags = uniqueStrings(
      posts.flatMap((post: any) => post.ai_tags ?? [])
    )
    const aiStyleTags = uniqueStrings(
      posts.flatMap((post: any) => post.ai_style_tags ?? [])
    )
    const captions = posts
      .map((post: any) => post.caption)
      .filter(Boolean)

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
      gender: row.gender,
      tags: uniqueStrings([...aiTags, ...aiStyleTags]),
      aiTags,
      ai_tags: aiTags,
      aiStyleTags,
      ai_style_tags: aiStyleTags,
      images,
      primaryImage: images[0] ?? '',
      captions,
      recentCaptions: captions.slice(0, 5),
      posts,
      vectorSimilarity: row.similarity ?? 0,
      aiScore: row.similarity ?? 0,
      matchedReasons: buildMatchedReasons(aiTags, aiStyleTags),
    } as any
  })
}
