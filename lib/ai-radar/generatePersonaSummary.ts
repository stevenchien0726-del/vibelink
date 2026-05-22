export type PersonaSummaryUser = {
  displayName?: string
  username?: string
  bio?: string
  city?: string
  tags?: string[]
  vibe_tags?: string[]
  ai_tags?: string[]
  ai_style_tags?: string[]
  ai_caption?: string
  matchedReasons?: string[]
  personaSummary?: string
}

function uniqueText(items: unknown[]) {
  return Array.from(
    new Set(
      items
        .filter(Boolean)
        .map((item) => String(item).trim())
        .filter(Boolean)
    )
  )
}

function hasAny(tags: string[], keywords: string[]) {
  return keywords.some((keyword) => tags.includes(keyword))
}

export function generatePersonaSummary(user: PersonaSummaryUser) {
  if (user.personaSummary) return user.personaSummary

  const name = user.displayName || user.username || '這位用戶'

  const tags = uniqueText([
    ...(user.tags ?? []),
    ...(user.vibe_tags ?? []),
    ...(user.ai_tags ?? []),
    ...(user.ai_style_tags ?? []),
  ]).map((tag) => tag.toLowerCase())

  const reasons = uniqueText(user.matchedReasons ?? [])
    .filter((reason) => !reason.toLowerCase().includes('vector similarity'))
    .slice(0, 2)

  const caption = user.ai_caption?.trim()
  const bio = user.bio?.trim()

  if (reasons.length > 0) {
    return `${name} 的內容和你的搜尋方向很接近，整體呈現出 ${reasons.join('、')} 的感覺，互動氛圍也比較自然。`
  }

  if (hasAny(tags, ['cat', 'dog', 'pet'])) {
    return `${name} 的內容有不少寵物與日常生活感，整體氛圍比較柔和、安靜，也帶一點療癒感。`
  }

  if (hasAny(tags, ['music', 'vibe', 'chill', 'indie', 'guitar'])) {
    return `${name} 的內容偏音樂與隨性日常感，整體像是個性比較輕鬆、自在，也容易產生共鳴的人。`
  }

  if (hasAny(tags, ['gym', 'fitness', 'workout', 'abs'])) {
    return `${name} 的內容偏運動與自律生活感，整體給人比較有活力、乾淨俐落的印象。`
  }

  if (hasAny(tags, ['coffee', 'cafe', 'book', 'reading'])) {
    return `${name} 的照片有咖啡廳、閱讀或慢節奏生活感，整體偏文青、安靜，也有一點生活品味。`
  }

  if (hasAny(tags, ['beach', 'travel', 'nature', 'outdoor'])) {
    return `${name} 的照片偏旅行與戶外探索感，整體像是喜歡自由生活、自然風景和新鮮體驗的人。`
  }

  if (hasAny(tags, ['dance', 'kpop', 'streetdance'])) {
    return `${name} 的內容偏舞蹈與韓系 vibe，整體比較活潑、有鏡頭感，也帶一點小網紅氣質。`
  }

  if (hasAny(tags, ['nightlife', 'techno', 'rave', 'dj', 'party'])) {
    return `${name} 偏音樂派對與夜生活 vibe，照片裡有活動感與社交氛圍，整體能量比較強。`
  }

  if (caption) {
    return `${name} 的內容偏生活紀錄感，從照片描述來看，整體氛圍比較自然、輕鬆，也有自己的日常風格。`
  }

  if (bio) {
    return `${name} 的個人介紹給人比較自然的生活感，整體看起來和你的搜尋方向有一定程度的氛圍重疊。`
  }

  return `${name} 的內容和你的搜尋方向有部分重疊，整體 vibe 看起來自然舒服，也有一定程度的生活感。`
}