// src/lib/generateAIRadarRewriteQueries.ts

import type { AIRadarParsedQuery } from './aiRadarParser'

export function generateAIRadarRewriteQueries(
  parsed: AIRadarParsedQuery,
  resultCount: number
) {
  if (resultCount >= 5) {
    return []
  }

  const genderText =
    parsed.genderHint === 'male'
      ? '男生'
      : parsed.genderHint === 'female'
        ? '女生'
        : ''

  const baseTags = parsed.tags.slice(0, 2)

  const queries: string[] = []

  if (parsed.city && baseTags.length > 0) {
    queries.push(
      `幫我找${parsed.city}喜歡${baseTags.join('、')}的${genderText || '人'}`
    )
  }

  if (baseTags.length > 0) {
    queries.push(
      `幫我找喜歡${baseTags.join('、')}的${genderText || '人'}`
    )
  }

  if (parsed.city) {
    queries.push(
      `幫我找${parsed.city}有生活感、外型有吸引力的${genderText || '人'}`
    )
  }

  return [...new Set(queries)]
}