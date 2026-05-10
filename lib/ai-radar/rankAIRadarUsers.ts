// src/lib/rankAIRadarUsers.ts

import type { MockUser } from '@/lib/mockUsers'
import type { AIRadarParsedQuery } from './aiRadarParser'
import { AI_RADAR_SEMANTIC_ALIAS } from './aiRadarSemanticMap'

import { AI_RADAR_TAG_WEIGHTS } from './aiRadarWeights'
import { scoreAIRadarSemanticProfile } from '../scoreAIRadarSemanticProfile'

const TAG_ALIAS = AI_RADAR_SEMANTIC_ALIAS

export type AIRadarRankedUser = MockUser & {
  aiScore: number
  matchedReasons: string[]
}

export function rankAIRadarUsers(
  users: MockUser[],
  parsed: AIRadarParsedQuery
): AIRadarRankedUser[] {
  const searchTags =
    'canonicalTags' in parsed &&
    Array.isArray(parsed.canonicalTags) &&
    parsed.canonicalTags.length > 0
      ? parsed.canonicalTags
      : parsed.tags

  return users
    .map((user) => {
      let score = 0
      const matchedReasons: string[] = []

      if (parsed.city && user.city === parsed.city) {
        score += 20
        matchedReasons.push(`城市符合：${parsed.city}`)
      }

      if (
        parsed.genderHint &&
        user.gender === parsed.genderHint
      ) {
        score += 20
        matchedReasons.push(
          parsed.genderHint === 'male'
            ? '性別符合：男生'
            : '性別符合：女生'
        )
      }

      for (const tag of searchTags) {
        const aliases = TAG_ALIAS[tag] || [tag]

        const matched = user.vibe_tags.some((userTag) =>
          aliases.includes(userTag.toLowerCase())
        )

        if (matched) {
  const weight = AI_RADAR_TAG_WEIGHTS[tag] || 15

  score += weight
  matchedReasons.push(`興趣符合：${tag} +${weight}`)
}
      }

const semanticScore = scoreAIRadarSemanticProfile(user, parsed)

score += semanticScore.score
matchedReasons.push(...semanticScore.reasons)

      return {
        ...user,
        aiScore: score,
        matchedReasons,
      }
    })
    .sort((a, b) => b.aiScore - a.aiScore)
}