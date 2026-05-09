// src/lib/generateAIRadarSuggestions.ts

import type { AIRadarParsedQuery } from './aiRadarParser'

export function generateAIRadarSuggestions(
  parsed: AIRadarParsedQuery,
  resultCount: number
) {
  if (resultCount >= 5) {
    return []
  }

  const suggestions: string[] = []

  if (parsed.city) {
    suggestions.push(`放寬城市限制，不只找 ${parsed.city}`)
  }

  if (parsed.tags.length >= 3) {
    suggestions.push('減少 1～2 個興趣條件，例如先只保留健身或旅行')
  }

  if (parsed.genderHint) {
    suggestions.push('先不限制性別，看看更多相似風格的人')
  }

  if (suggestions.length === 0) {
    suggestions.push('可以加入城市、興趣、風格，例如「台北 喜歡海邊 健身」')
  }

  return suggestions
}