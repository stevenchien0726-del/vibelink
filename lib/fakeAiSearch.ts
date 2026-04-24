import { fakeUsers } from '../data/fakeUsers'

export function fakeAiSearch(query: string) {
  const cleanQuery = query.trim().toLowerCase()

  if (!cleanQuery) return fakeUsers.slice(0, 3)

  // 先讓「小新」也能模擬找到結果
  if (cleanQuery.includes('小新')) {
    return fakeUsers.slice(0, 3)
  }

  const results = fakeUsers.filter((user) => {
    const text = `${user.name} ${user.bio} ${user.tags.join(' ')}`.toLowerCase()
    return text.includes(cleanQuery)
  })

  return results.length > 0 ? results : fakeUsers.slice(0, 3)
}