import { fakeUsers, FakeUser } from '../data/fakeUsers'

export function fakeAiSearch(query: string): FakeUser[] {
  if (!query.trim()) return []

  const normalizedQuery = query.toLowerCase()

  const scoredUsers = fakeUsers.map((user) => {
    let score = 0

    // 🔹 基本 tag 比對
    user.tags.forEach((tag) => {
      if (normalizedQuery.includes(tag.toLowerCase())) {
        score += 3
      }
    })

    // 🔥 奶狗系邏輯（核心）
    if (normalizedQuery.includes('奶狗')) {
      if (user.tags.includes('奶狗感')) score += 4
    }

    if (normalizedQuery.includes('弟弟')) {
      if (user.tags.includes('弟弟感') || user.age <= 24) score += 3
    }

    if (normalizedQuery.includes('可愛')) {
      if (user.tags.includes('可愛')) score += 2
    }

    if (normalizedQuery.includes('溫柔')) {
      if (user.tags.includes('溫柔')) score += 2
    }

    // 🔹 夜生活
    if (normalizedQuery.includes('夜生活')) {
      if (user.tags.includes('夜生活')) score += 2
    }

    // 🔹 身材
    if (normalizedQuery.includes('身材') || normalizedQuery.includes('腹肌')) {
      if (user.tags.includes('好身材') || user.tags.includes('腹肌')) {
        score += 2
      }
    }

    // 🔹 高追蹤
    if (normalizedQuery.includes('1000以上') || normalizedQuery.includes('高追蹤')) {
      if (user.followers >= 1000) score += 2
    }

    // 🔹 年輕
    if (normalizedQuery.includes('年輕')) {
      if (user.age <= 26) score += 2
    }

    return { user, score }
  })

  return scoredUsers
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.user)
}