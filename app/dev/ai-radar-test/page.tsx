'use client'

import { useState } from 'react'
import { parseAIRadarQuery } from '@/lib/ai-radar/aiRadarParser'
import { filterAIRadarUsers } from '@/lib/ai-radar/filterAIRadarUsers'
import { rankAIRadarUsers } from '@/lib/ai-radar/rankAIRadarUsers'
import { generateAIRadarSummary } from '@/lib/ai-radar/generateAIRadarSummary'

import { generateAIRadarSuggestions } from '@/lib/ai-radar/generateAIRadarSuggestions'
import { generateAIRadarRewriteQueries } from '@/lib/ai-radar/generateAIRadarRewriteQueries'

export default function AIRadarTestPage() {
  const [query, setQuery] = useState(
    '幫我找台北會健身、喜歡海邊旅行的女生'
  )

  const [openAIParsed, setOpenAIParsed] = useState<any>(null)

  const [embeddingResult, setEmbeddingResult] =
    useState<any>(null)

  const [vectorSearchResult, setVectorSearchResult] =
  useState<any>(null)

  const parsed =
    openAIParsed || parseAIRadarQuery(query)

  const matchedUsers = filterAIRadarUsers(parsed)

  const rankedUsers = rankAIRadarUsers(
    matchedUsers,
    parsed
  )

  const summary = generateAIRadarSummary(
    parsed,
    rankedUsers
  )

  const handleOpenAIParse = async () => {
    const res = await fetch('/api/ai-radar/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
      }),
    })

    const data = await res.json()

    console.log('OpenAI parse result:', data)

    if (data.rawText) {
      try {
        setOpenAIParsed(JSON.parse(data.rawText))
      } catch {
        console.error('JSON parse failed')
      }
    }
  }

  const handleEmbeddingTest = async () => {
    const res = await fetch('/api/ai-radar/embed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: query,
      }),
    })

    const data = await res.json()

    console.log('Embedding result:', data)

    setEmbeddingResult(data)
  }

  const handleVectorSearchTest = async () => {
  const res = await fetch('/api/ai-radar/vector-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
    }),
  })

  const data = await res.json()

  console.log('Vector search result:', data)

  setVectorSearchResult(data)
}

  const suggestions = generateAIRadarSuggestions(
    parsed,
    rankedUsers.length
  )

  const rewriteQueries =
    generateAIRadarRewriteQueries(
      parsed,
      rankedUsers.length
    )

  return (
    <main className="min-h-screen bg-white p-6">
      <h1 className="mb-4 text-2xl font-bold">
        AI Radar Parser Test
      </h1>

      <div className="mb-4 flex items-center gap-2">
        <div
          className={`h-3 w-3 rounded-full ${
            openAIParsed
              ? 'bg-green-500'
              : 'bg-gray-400'
          }`}
        />

        <div className="text-sm font-medium text-gray-600">
          {openAIParsed
            ? 'OpenAI Semantic Mode'
            : 'Local Parser Mode'}
        </div>
      </div>

      <textarea
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpenAIParsed(null)
        }}
        className="mb-6 h-32 w-full rounded-2xl border p-4"
      />

      <button
        type="button"
        onClick={handleOpenAIParse}
        className="mb-6 rounded-2xl bg-black px-4 py-3 text-white"
      >
        用 OpenAI Parse
      </button>

      <button
        type="button"
        onClick={handleEmbeddingTest}
        className="mb-6 ml-3 rounded-2xl bg-purple-600 px-4 py-3 text-white"
      >
        測試 Embedding
      </button>

      <button
  type="button"
  onClick={handleVectorSearchTest}
  className="mb-6 ml-3 rounded-2xl bg-green-600 px-4 py-3 text-white"
>
  測試 Vector Search
</button>

      <pre className="overflow-auto rounded-2xl bg-black p-4 text-sm text-green-400">
        {JSON.stringify(parsed, null, 2)}
      </pre>

      {embeddingResult && (
        <div className="mt-6 rounded-3xl bg-gray-100 p-5">
          <div className="font-bold">
            Embedding Result
          </div>

          <div className="mt-2 text-sm text-gray-700">
            Dimensions：
            {embeddingResult.dimensions}
          </div>

          <div className="mt-1 text-sm text-gray-700">
            Tokens：
            {embeddingResult.usage?.total_tokens}
          </div>
        </div>
      )}

      {vectorSearchResult && (
  <div className="mt-6 rounded-3xl bg-green-50 p-5">
    <div className="font-bold text-green-800">
      Vector Search Result
    </div>

    <pre className="mt-3 overflow-auto rounded-2xl bg-black p-4 text-sm text-green-400">
      {JSON.stringify(
        vectorSearchResult.results,
        null,
        2
      )}
    </pre>
  </div>
)}

      {openAIParsed && (
        <>
          <h2 className="mt-6 mb-3 text-xl font-bold">
            OpenAI Parsed Result
          </h2>

          <pre className="overflow-auto rounded-2xl bg-purple-950 p-4 text-sm text-purple-200">
            {JSON.stringify(openAIParsed, null, 2)}
          </pre>
        </>
      )}

      {'displayTags' in parsed &&
        Array.isArray(parsed.displayTags) &&
        parsed.displayTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {parsed.displayTags.map(
              (tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700"
                >
                  #{tag}
                </span>
              )
            )}
          </div>
        )}

      <div className="mt-6 rounded-3xl bg-purple-100 p-5 text-sm leading-relaxed text-purple-900">
        {summary}
      </div>

      {suggestions.length > 0 && (
        <div className="mt-4 rounded-3xl bg-gray-100 p-5">
          <div className="mb-2 font-bold">
            AI 建議你可以這樣放寬條件：
          </div>

          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {rewriteQueries.length > 0 && (
        <div className="mt-4 rounded-3xl bg-purple-50 p-5">
          <div className="mb-3 font-bold">
            可以改成這樣問：
          </div>

          <div className="flex flex-col gap-2">
            {rewriteQueries.map(
              (rewriteQuery) => (
                <button
                  key={rewriteQuery}
                  type="button"
                  onClick={() =>
                    setQuery(rewriteQuery)
                  }
                  className="rounded-2xl bg-white px-4 py-3 text-left text-sm shadow-sm active:scale-[0.98]"
                >
                  {rewriteQuery}
                </button>
              )
            )}
          </div>
        </div>
      )}

      <h2 className="mt-6 mb-3 text-xl font-bold">
        Matched Users：
        {rankedUsers.length}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {rankedUsers.map((user) => (
          <div
            key={user.id}
            className="rounded-2xl border p-3"
          >
            <div className="mb-3 grid grid-cols-3 gap-1 overflow-hidden rounded-xl">
              {user.images
                .slice(0, 3)
                .map((image, index) => (
                  <img
                    key={image}
                    src={image}
                    alt={`${user.display_name} photo ${
                      index + 1
                    }`}
                    className="h-32 w-full object-cover"
                  />
                ))}
            </div>

            <div className="font-bold">
              {user.display_name}
            </div>

            <div className="text-sm text-gray-500">
              @{user.username}
            </div>

            <div className="mt-1 text-sm font-bold text-purple-600">
              AI Score：{user.aiScore}
            </div>

            <div className="mt-2 text-xs text-gray-500">
              {user.matchedReasons.join('、')}
            </div>

            <div className="mt-2 text-sm">
              {user.city}
            </div>

            <div className="mt-2 text-xs text-gray-500">
              {user.vibe_tags.join('、')}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}