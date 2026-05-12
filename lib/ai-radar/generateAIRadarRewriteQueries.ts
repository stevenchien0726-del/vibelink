// src/lib/generateAIRadarRewriteQueries.ts

import type { AIRadarParsedQuery } from './aiRadarParser'

function normalizeDisplayTag(tag: string) {
  const map: Record<string, string> = {
    gym: '健身',
    fitness: '健身',
    beach: '海邊',
    coffee: '咖啡',
    cafe: '咖啡',
    travel: '旅行',
    dance: '街舞',
    kpop: 'KPOP',
    korean: '韓系',
    cute: '可愛感',
    sexy: '性感',
    fashion: '穿搭',
    streetwear: '潮流感',
    nightlife: '夜生活',
    sports: '運動感',
    sportscar: '跑車',
    'sports car': '跑車',
    'luxury car': '豪車',
    supercar: '超跑',
    bugatti: 'Bugatti',
    futuristic: '科技感',
    modern: '現代感',
    sleek: '俐落感',
    luxury: '高級感',
    outdoor: '戶外感',
    lifestyle: '生活感',
  }

  return map[tag] ?? tag
}

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
        : '人'

  const displayTags = parsed.tags
    .slice(0, 4)
    .map(normalizeDisplayTag)

  const queries: string[] = []

  if (parsed.city && displayTags.length > 0) {
    queries.push(
      `幫我找${parsed.city}喜歡${displayTags
        .slice(0, 2)
        .join('、')}的${genderText}`
    )
  }

  if (displayTags.length > 0) {
    queries.push(
      `幫我找喜歡${displayTags
        .slice(0, 2)
        .join('、')}的${genderText}`
    )
  }

  if (displayTags.length >= 3) {
    queries.push(
      `幫我找有${displayTags
        .slice(0, 3)
        .join('、')} vibe 的${genderText}`
    )
  }

  if (parsed.city) {
    queries.push(
      `幫我找${parsed.city}有生活感、外型有吸引力的${genderText}`
    )
  }

  queries.push(
    `幫我找最近比較多人喜歡的${genderText}`
  )

  return [...new Set(queries)].slice(0, 4)
}