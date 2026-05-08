// src/lib/aiRadar.ts

import { mockUsers } from './mockUsers'

export type AIRadarResult = {
  id: string
  user_id: string
  username: string
  display_name: string
  avatar_url: string
  bio: string
  city: string
  vibe_tags: string[]
  image: string
  score: number
}

const keywordMap: Record<string, string[]> = {
  健身: ['gym', 'fitness', 'workout', 'running', 'boxing', 'lift'],
  身材: ['gym', 'fitness', 'workout', 'model'],
  海邊: ['beach', 'ocean', 'summer', 'surf', 'island'],
  旅行: ['travel', 'europe', 'japan', 'vlog'],
  咖啡: ['coffee', 'cafe', 'matcha'],
  可愛: ['cute', 'softgirl', 'kpop'],
  韓國: ['kpop', 'korea', 'dance'],
  跳舞: ['dance', 'kpop'],
  街舞: ['dance', 'hiphop', 'street'],
  夜生活: ['nightlife', 'rave', 'techno', 'dj'],
  歐美: ['fashion', 'model', 'travel', 'minimal'],
  穿搭: ['fashion', 'streetwear', 'sneakers'],
  音樂: ['music', 'lofi', 'vinyl', 'dj'],
  藝術: ['art', 'film', 'design', 'gallery'],
  創業: ['startup', 'ai', 'coding'],
}

function normalizeText(text: string) {
  return text.toLowerCase().trim()
}

function extractQueryTags(query: string) {
  const normalizedQuery = normalizeText(query)
  const tags = new Set<string>()

  Object.entries(keywordMap).forEach(([keyword, mappedTags]) => {
    if (normalizedQuery.includes(keyword.toLowerCase())) {
      mappedTags.forEach((tag) => tags.add(tag))
    }
  })

  normalizedQuery
    .split(/[\s,，、/]+/)
    .filter(Boolean)
    .forEach((word) => tags.add(word))

  return Array.from(tags)
}

export function searchAIRadarUsers(query: string): AIRadarResult[] {
  const queryTags = extractQueryTags(query)

  if (!query.trim()) return []

  return mockUsers
    .map((user) => {
      const userText = normalizeText(
        [
          user.username,
          user.display_name,
          user.bio,
          user.city,
          ...user.vibe_tags,
        ].join(' ')
      )

      let score = 0

      queryTags.forEach((tag) => {
        if (user.vibe_tags.includes(tag)) score += 5
        if (userText.includes(tag)) score += 2
      })

      return {
        id: `${user.id}-ai-radar`,
        user_id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        city: user.city,
        vibe_tags: user.vibe_tags,
        image: user.images[0],
        score,
      }
    })
    .filter((result) => result.score > 0 && !!result.image)
    .sort((a, b) => b.score - a.score)
    .slice(0, 24)
}