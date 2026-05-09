// src/lib/generateAIRadarSummary.ts

import type { AIRadarParsedQuery } from './aiRadarParser'
import type { AIRadarRankedUser } from './rankAIRadarUsers'

export function generateAIRadarSummary(
  parsed: AIRadarParsedQuery,
  users: AIRadarRankedUser[]
) {
  if (users.length === 0) {
    return '目前找不到太符合的人選，可以試著放寬條件，例如減少城市、興趣或風格描述。'
  }

  const parts: string[] = []

  if (parsed.city) {
    parts.push(parsed.city)
  }

  if (parsed.genderHint === 'male') {
    parts.push('男生')
  }

  if (parsed.genderHint === 'female') {
    parts.push('女生')
  }

  if (parsed.tags.length > 0) {
    parts.push(parsed.tags.join('、'))
  }

  if (parsed.vibes.length > 0) {
    parts.push(parsed.vibes.join('、'))
  }

  const topReasons = users
    .slice(0, 3)
    .flatMap((user) => user.matchedReasons)
    .slice(0, 4)

  return `我幫你篩選出幾位符合「${parts.join('、') || parsed.raw}」的人選，主要根據 ${topReasons.join('、')} 進行排序。`
}