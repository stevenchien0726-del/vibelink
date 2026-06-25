/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AIRadarParsedQuery } from './aiRadarParser'

const FINAL_RESULT_LIMIT = 10

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.toLowerCase().trim() : ''
}

function uniqueStrings(values: unknown[]) {
  return [
    ...new Set(
      values
        .map(normalizeText)
        .filter(Boolean)
    ),
  ]
}

function getUserTags(user: any) {
  return uniqueStrings([
    ...(user.tags ?? []),
    ...(user.vibe_tags ?? []),
    ...(user.aiTags ?? []),
    ...(user.ai_tags ?? []),
    ...(user.aiStyleTags ?? []),
    ...(user.ai_style_tags ?? []),
    ...(user.styleTags ?? []),
  ])
}

function getRecentActivityBoost(user: any) {
  const dates = [
    ...(Array.isArray(user.posts) ? user.posts : []),
  ]
    .map((post: any) => Date.parse(post.created_at ?? ''))
    .filter((value) => Number.isFinite(value))

  if (dates.length === 0) return 0

  const latest = Math.max(...dates)
  const daysAgo = (Date.now() - latest) / (24 * 60 * 60 * 1000)

  if (daysAgo <= 7) return 6
  if (daysAgo <= 30) return 3

  return 0
}

function getHardFilterPenalty(user: any, parsedQuery: AIRadarParsedQuery) {
  let penalty = 0
  const hardGender = parsedQuery.hardFilters?.gender ?? parsedQuery.genderHint
  const hardCity = normalizeText(parsedQuery.hardFilters?.city ?? parsedQuery.city)
  const userGender = normalizeText(user.gender)
  const userCity = normalizeText(user.city)

  if (hardGender) {
    if (!userGender) {
      penalty += 8
    } else if (userGender !== hardGender) {
      penalty += 80
    }
  }

  if (hardCity) {
    if (!userCity) {
      penalty += 8
    } else if (!userCity.includes(hardCity) && !hardCity.includes(userCity)) {
      penalty += 80
    }
  }

  return penalty
}

function buildReasons(
  user: any,
  requiredMatches: string[],
  preferredMatches: string[],
  vibeMatches: string[]
) {
  return uniqueStrings([
    ...(user.matchedReasons ?? []),
    ...requiredMatches,
    ...preferredMatches,
    ...vibeMatches,
  ])
}

function mergeUser(existing: any, incoming: any) {
  const merged = {
    ...existing,
    ...incoming,
    id: existing.id ?? incoming.id,
    username: existing.username ?? incoming.username,
    displayName: existing.displayName ?? incoming.displayName,
    avatar: existing.avatar || incoming.avatar || '',
    bio: existing.bio || incoming.bio || '',
    city: existing.city || incoming.city || '',
    gender: existing.gender || incoming.gender,
    vectorSimilarity:
      Number(existing.vectorSimilarity ?? existing.similarity ?? 0) ||
      Number(incoming.vectorSimilarity ?? incoming.similarity ?? 0) ||
      0,
    images: [
      ...new Set([
        ...(existing.images ?? []),
        ...(incoming.images ?? []),
      ]),
    ],
    posts: [
      ...(existing.posts ?? []),
      ...(incoming.posts ?? []),
    ],
    captions: [
      ...new Set([
        ...(existing.captions ?? []),
        ...(incoming.captions ?? []),
      ]),
    ],
    recentCaptions: [
      ...new Set([
        ...(existing.recentCaptions ?? []),
        ...(incoming.recentCaptions ?? []),
      ]),
    ].slice(0, 5),
    matchedReasons: [
      ...new Set([
        ...(existing.matchedReasons ?? []),
        ...(incoming.matchedReasons ?? []),
      ]),
    ],
  }

  merged.primaryImage = merged.images[0] ?? ''
  merged.tags = getUserTags(merged)
  merged.aiTags = uniqueStrings([
    ...(existing.aiTags ?? []),
    ...(existing.ai_tags ?? []),
    ...(incoming.aiTags ?? []),
    ...(incoming.ai_tags ?? []),
  ])
  merged.ai_tags = merged.aiTags
  merged.aiStyleTags = uniqueStrings([
    ...(existing.aiStyleTags ?? []),
    ...(existing.ai_style_tags ?? []),
    ...(incoming.aiStyleTags ?? []),
    ...(incoming.ai_style_tags ?? []),
  ])
  merged.ai_style_tags = merged.aiStyleTags

  return merged
}

export function hybridRankUsers({
  vectorUsers,
  supabaseUsers,
  parsedQuery,
  limit = FINAL_RESULT_LIMIT,
}: {
  vectorUsers: any[]
  supabaseUsers: any[]
  parsedQuery: AIRadarParsedQuery
  limit?: number
}) {
  const usersById = new Map<string, any>()

  for (const user of [...vectorUsers, ...supabaseUsers]) {
    if (!user?.id) continue

    const existing = usersById.get(user.id)
    usersById.set(user.id, existing ? mergeUser(existing, user) : user)
  }

  const requiredTags = uniqueStrings([
    ...(parsedQuery.requiredTags ?? []),
  ])
  const preferredTags = uniqueStrings([
    ...(parsedQuery.preferredTags ?? []),
    ...(parsedQuery.tags ?? []),
  ]).filter((tag) => !requiredTags.includes(tag))
  const negativeTags = uniqueStrings(parsedQuery.negativeTags ?? [])
  const vibes = uniqueStrings(parsedQuery.vibes ?? [])

  return Array.from(usersById.values())
    .map((user) => {
      const userTags = getUserTags(user)
      const requiredMatches = requiredTags.filter((tag) =>
        userTags.includes(tag)
      )
      const preferredMatches = preferredTags.filter((tag) =>
        userTags.includes(tag)
      )
      const vibeMatches = vibes.filter((vibe) =>
        userTags.includes(vibe)
      )
      const negativeMatches = negativeTags.filter((tag) =>
        userTags.includes(tag)
      )
      const imageCount = Array.isArray(user.images) ? user.images.length : 0
      const vectorSimilarity = Number(
        user.vectorSimilarity ?? user.similarity ?? 0
      )
      const hardFilterMismatchPenalty = getHardFilterPenalty(
        user,
        parsedQuery
      )
      const negativeTagPenalty = negativeMatches.length * 35
      const finalScore =
        vectorSimilarity * 55 +
        requiredMatches.length * 35 +
        preferredMatches.length * 18 +
        vibeMatches.length * 12 +
        Math.min(imageCount, 8) * 1.5 +
        getRecentActivityBoost(user) -
        negativeTagPenalty -
        hardFilterMismatchPenalty

      return {
        ...user,
        aiScore: finalScore,
        matchCount: requiredMatches.length + preferredMatches.length,
        matchedReasons: buildReasons(
          user,
          requiredMatches,
          preferredMatches,
          vibeMatches
        ),
      }
    })
    .sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0))
    .slice(0, limit)
}
