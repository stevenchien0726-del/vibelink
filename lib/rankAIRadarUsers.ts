// src/lib/rankAIRadarUsers.ts

import type { MockUser } from '@/lib/mockUsers'
import type { AIRadarParsedQuery } from './aiRadarParser'

const TAG_ALIAS: Record<string, string[]> = {
  健身: ['gym', 'fitness'],
  海邊: ['beach'],
  旅行: ['travel'],
  咖啡: ['coffee'],
  街舞: ['dance'],
  KPOP: ['kpop'],
  穿搭: ['fashion', 'streetwear'],
  音樂祭: ['festival', 'edm'],

  可愛: ['cute'],
  性感: ['sexy'],
  腹肌: ['gym', 'fitness'],
}

export type AIRadarRankedUser = MockUser & {
  aiScore: number
  matchedReasons: string[]
}

export function rankAIRadarUsers(
  users: MockUser[],
  parsed: AIRadarParsedQuery
): AIRadarRankedUser[] {
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

      for (const tag of parsed.tags) {
        const aliases = TAG_ALIAS[tag] || []

        const matched = user.vibe_tags.some((userTag) =>
          aliases.includes(userTag.toLowerCase())
        )

        if (matched) {
          score += 15
          matchedReasons.push(`興趣符合：${tag}`)
        }
      }

      return {
        ...user,
        aiScore: score,
        matchedReasons,
      }
    })
    .sort((a, b) => b.aiScore - a.aiScore)
}