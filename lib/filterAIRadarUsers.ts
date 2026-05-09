// src/lib/filterAIRadarUsers.ts

import { mockUsers } from '@/lib/mockUsers'
import type { AIRadarParsedQuery } from './aiRadarParser'

const TAG_ALIAS: Record<string, string[]> = {
  韓國奶狗感: ['cute', 'kpop', 'softboy'],
乾淨自然: ['clean', 'natural', 'lifestyle'],
不油: ['clean', 'gentle'],
清爽: ['clean'],
溫柔: ['gentle'],
年輕感: ['cute', 'kpop'],
  健身: ['gym', 'fitness'],
  海邊: ['beach'],
  旅行: ['travel'],
  咖啡: ['coffee'],
  街舞: ['dance'],
  穿搭: ['fashion', 'streetwear'],

  可愛: ['cute'],
  性感: ['sexy'],
  腹肌: ['gym', 'fitness'],
}

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

    // gender：mock 階段先用文字資料粗略判斷
if (parsed.genderHint) {
  const profileText = [
    user.username,
    user.display_name,
    user.bio,
    user.city,
    ...user.vibe_tags,
  ]
    .join(' ')
    .toLowerCase()

  const maleSignals = ['male', 'man', 'boy', '帥哥', '男生', 'guy']
  const femaleSignals = ['female', 'woman', 'girl', '女生', '女孩']

  const hasMaleSignal = maleSignals.some((word) =>
    profileText.includes(word)
  )

  const hasFemaleSignal = femaleSignals.some((word) =>
    profileText.includes(word)
  )

  if (parsed.genderHint === 'male' && hasFemaleSignal) {
    return false
  }

  if (parsed.genderHint === 'female' && hasMaleSignal) {
    return false
  }
}

    // tags
    if (parsed.tags.length > 0) {
      let matched = false

      for (const tag of parsed.tags) {
        const aliases = TAG_ALIAS[tag] || []

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