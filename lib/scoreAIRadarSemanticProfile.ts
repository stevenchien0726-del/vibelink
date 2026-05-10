// src/lib/scoreAIRadarSemanticProfile.ts

import type { MockUser } from '@/lib/mockUsers'
import type { AIRadarParsedQuery } from './ai-radar/aiRadarParser'

export function scoreAIRadarSemanticProfile(
  user: MockUser,
  parsed: AIRadarParsedQuery
) {
  if (!user.semantic_profile?.length) {
    return {
      score: 0,
      reasons: [],
    }
  }

  const searchTags =
    'canonicalTags' in parsed &&
    Array.isArray(parsed.canonicalTags) &&
    parsed.canonicalTags.length > 0
      ? parsed.canonicalTags
      : parsed.tags

  const profileText = user.semantic_profile.join(' ').toLowerCase()

  let score = 0
  const reasons: string[] = []

  for (const tag of searchTags) {
    const normalizedTag = tag.toLowerCase()

    if (profileText.includes(normalizedTag)) {
      score += 25
      reasons.push(`語意符合：${tag} +25`)
    }
  }

  return {
    score,
    reasons,
  }
}