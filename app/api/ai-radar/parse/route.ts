// src/app/api/ai-radar/embed/route.ts

import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const text = body.text

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing text' },
        { status: 400 }
      )
    }

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    })

    return NextResponse.json({
      success: true,
      embedding: response.data[0].embedding,
      dimensions: response.data[0].embedding.length,
      usage: response.usage,
    })
  } catch (error) {
    console.error('AI Radar embedding error:', error)

    const message =
      error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        success: false,
        error: 'Embedding failed',
        message,
      },
      { status: 500 }
    )
  }
}