// src/lib/filterAIRadarUsers.ts

import { mockUsers } from '@/lib/mockUsers'
import type { AIRadarParsedQuery } from './aiRadarParser'

import { AI_RADAR_SEMANTIC_ALIAS } from './aiRadarSemanticMap'

const TAG_ALIAS = AI_RADAR_SEMANTIC_ALIAS

export function filterAIRadarUsers(
  parsed: AIRadarParsedQuery
) {
  return mockUsers.filter((user) => {
    // city
    if (
      parsed.city &&
      user.city !== parsed.city
    ) {
      return false
    }

   // gender：直接使用 mockUsers gender 欄位硬過濾
if (
  parsed.genderHint &&
  user.gender &&
  user.gender !== parsed.genderHint
) {
  return false
}

    // tags：優先使用 OpenAI canonicalTags，沒有才退回本地 parsed.tags
const searchTags =
  'canonicalTags' in parsed &&
  Array.isArray(parsed.canonicalTags) &&
  parsed.canonicalTags.length > 0
    ? parsed.canonicalTags
    : parsed.tags

if (searchTags.length > 0) {
  let matched = false

  for (const tag of searchTags) {
    const aliases = TAG_ALIAS[tag] || [tag]

    const hasTag = user.vibe_tags.some((userTag) =>
      aliases.includes(userTag.toLowerCase())
    )

    if (hasTag) {
      matched = true
    }
  }

  if (!matched) {
    return false
  }
}

    return true
  })
}