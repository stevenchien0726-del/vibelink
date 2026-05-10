// src/app/api/ai-radar/vector-search/route.ts

import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { mockUsers } from '@/lib/mockUsers'
import { buildMockUserEmbeddingText } from '@/lib/ai-radar/buildMockUserEmbeddingText'
import { vectorSearchAIRadarUsers } from '@/lib/ai-radar/vectorSearchAIRadarUsers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const query = body.query

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing query' },
        { status: 400 }
      )
    }

    const queryEmbeddingResponse =
      await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
        encoding_format: 'float',
      })

    const queryEmbedding =
      queryEmbeddingResponse.data[0].embedding

    const userEmbeddingResponses = await Promise.all(
      mockUsers.slice(0, 20).map(async (user) => {
        const text = buildMockUserEmbeddingText(user)

        const response = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: text,
          encoding_format: 'float',
        })

        return {
          userId: user.id,
          embedding: response.data[0].embedding,
        }
      })
    )

    const userEmbeddings: Record<string, number[]> = {}

    for (const item of userEmbeddingResponses) {
      userEmbeddings[item.userId] = item.embedding
    }

    const rankedUsers = vectorSearchAIRadarUsers(
      mockUsers.slice(0, 20),
      queryEmbedding,
      userEmbeddings
    )

    return NextResponse.json({
      success: true,
      results: rankedUsers.slice(0, 10).map((user) => ({
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        city: user.city,
        gender: user.gender,
        vibe_tags: user.vibe_tags,
        vectorScore: user.vectorScore,
      })),
    })
  } catch (error) {
    console.error('AI Radar vector search error:', error)

    const message =
      error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        success: false,
        error: 'Vector search failed',
        message,
      },
      { status: 500 }
    )
  }
}