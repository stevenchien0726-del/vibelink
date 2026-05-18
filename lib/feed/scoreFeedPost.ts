type Params = {
  post: any
  currentUserInterestTags?: string[]
}

export function scoreFeedPost({
  post,
  currentUserInterestTags = [],
}: Params) {
  let score = 0

  const reasons: string[] = []

  // =========
  // 1. AI Tag Matching
  // =========

  const aiTags: string[] = post.ai_tags ?? []

  const matchedTags = aiTags.filter((tag) =>
    currentUserInterestTags.includes(tag)
  )

  if (matchedTags.length > 0) {
    score += matchedTags.length * 18

    reasons.push(
      `matching tags: ${matchedTags.join(', ')}`
    )
  }

  // =========
  // 2. Likes
  // =========

  const likes = post.likes_count ?? 0

  score += Math.min(likes * 1.2, 35)

  // =========
  // 3. Comments
  // =========

  const comments = post.comments_count ?? 0

  score += Math.min(comments * 2, 30)

  // =========
  // 4. Recent Boost
  // =========

  const createdAt = new Date(post.created_at).getTime()

  const now = Date.now()

  const diffHours =
    (now - createdAt) / (1000 * 60 * 60)

  if (diffHours < 6) {
    score += 35
    reasons.push('recent <6h')
  } else if (diffHours < 24) {
    score += 20
    reasons.push('recent <24h')
  } else if (diffHours < 72) {
    score += 8
  }

  return {
    score: Math.round(score),
    reasons,
  }
}