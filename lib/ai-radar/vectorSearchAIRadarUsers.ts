// src/lib/vectorSearchAIRadarUsers.ts

import type { MockUser } from '@/lib/mockUsers'
import { cosineSimilarity } from './cosineSimilarity'

export type AIRadarVectorUser = MockUser & {
  vectorScore: number
}

export function vectorSearchAIRadarUsers(
  users: MockUser[],
  queryEmbedding: number[],
  userEmbeddings: Record<string, number[]>
): AIRadarVectorUser[] {
  return users
    .map((user) => {
      const userEmbedding = userEmbeddings[user.id]

      if (!userEmbedding) {
        return {
          ...user,
          vectorScore: 0,
        }
      }

      return {
        ...user,
        vectorScore: cosineSimilarity(
          queryEmbedding,
          userEmbedding
        ),
      }
    })
    .sort((a, b) => b.vectorScore - a.vectorScore)
}