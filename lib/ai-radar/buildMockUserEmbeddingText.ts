// src/lib/ai-radar/buildMockUserEmbeddingText.ts

import type { MockUser } from '@/lib/mockUsers'

export function buildMockUserEmbeddingText(user: MockUser) {
  const parts = [
    user.display_name,
    user.username,
    user.bio,
    user.city,
    user.gender,
    ...user.vibe_tags,
    ...(user.semantic_profile || []),
  ]

  return parts.filter(Boolean).join(' ')
}