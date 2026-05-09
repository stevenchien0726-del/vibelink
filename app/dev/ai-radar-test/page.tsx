'use client'

import { useState } from 'react'
import { parseAIRadarQuery } from '@/lib/aiRadarParser'
import { filterAIRadarUsers } from '@/lib/filterAIRadarUsers'
import { rankAIRadarUsers } from '@/lib/rankAIRadarUsers'
import { generateAIRadarSummary } from '@/lib/generateAIRadarSummary'

import { generateAIRadarSuggestions } from '@/lib/generateAIRadarSuggestions'
import { generateAIRadarRewriteQueries } from '@/lib/generateAIRadarRewriteQueries'

export default function AIRadarTestPage() {
  const [query, setQuery] = useState(
    '幫我找台北會健身、喜歡海邊旅行的女生'
  )
  const [openAIParsed, setOpenAIParsed] = useState<any>(null)

  const parsed =
  openAIParsed || parseAIRadarQuery(query)
  const matchedUsers = filterAIRadarUsers(parsed)
  const rankedUsers = rankAIRadarUsers(matchedUsers, parsed)
  const summary = generateAIRadarSummary(parsed, rankedUsers)

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
  console.log(data)

if (data.rawText) {
  try {
    setOpenAIParsed(JSON.parse(data.rawText))
  } catch {
    console.error('JSON parse failed')
  }
}
}

  const suggestions = generateAIRadarSuggestions(parsed, rankedUsers.length)

  const rewriteQueries = generateAIRadarRewriteQueries(
  parsed,
  rankedUsers.length
)

  return (
    <main className="min-h-screen bg-white p-6">
      <h1 className="mb-4 text-2xl font-bold">
        AI Radar Parser Test
      </h1>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-6 h-32 w-full rounded-2xl border p-4"
      />

      <button
  type="button"
  onClick={handleOpenAIParse}
  className="mb-6 rounded-2xl bg-black px-4 py-3 text-white"
>
  用 OpenAI Parse
</button>

      <pre className="overflow-auto rounded-2xl bg-black p-4 text-sm text-green-400">
        {JSON.stringify(parsed, null, 2)}
      </pre>

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

      <div className="mt-6 rounded-3xl bg-purple-100 p-5 text-sm leading-relaxed text-purple-900">
  {summary}
</div>

{suggestions.length > 0 && (
  <div className="mt-4 rounded-3xl bg-gray-100 p-5">
    <div className="mb-2 font-bold">AI 建議你可以這樣放寬條件：</div>

    <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
      {suggestions.map((suggestion) => (
        <li key={suggestion}>{suggestion}</li>
      ))}
    </ul>
  </div>
)}

{rewriteQueries.length > 0 && (
  <div className="mt-4 rounded-3xl bg-purple-50 p-5">
    <div className="mb-3 font-bold">可以改成這樣問：</div>

    <div className="flex flex-col gap-2">
      {rewriteQueries.map((rewriteQuery) => (
        <button
          key={rewriteQuery}
          type="button"
          onClick={() => setQuery(rewriteQuery)}
          className="rounded-2xl bg-white px-4 py-3 text-left text-sm shadow-sm active:scale-[0.98]"
        >
          {rewriteQuery}
        </button>
      ))}
    </div>
  </div>
)}
      
      <h2 className="mt-6 mb-3 text-xl font-bold">
  Matched Users：{rankedUsers.length}
</h2>

<div className="grid grid-cols-2 gap-4">
  {rankedUsers.map((user) => (
    <div
      key={user.id}
      className="rounded-2xl border p-3"
    >
      <div className="mb-3 grid grid-cols-3 gap-1 overflow-hidden rounded-xl">
  {user.images.slice(0, 3).map((image, index) => (
    <img
      key={image}
      src={image}
      alt={`${user.display_name} photo ${index + 1}`}
      className="h-32 w-full object-cover"
    />
  ))}
</div>

      <div className="font-bold">{user.display_name}</div>
      <div className="text-sm text-gray-500">@{user.username}</div>
      <div className="mt-1 text-sm font-bold text-purple-600">
  AI Score：{user.aiScore}
</div>

<div className="mt-2 text-xs text-gray-500">
  {user.matchedReasons.join('、')}
</div>
      <div className="mt-2 text-sm">{user.city}</div>
      <div className="mt-2 text-xs text-gray-500">
        {user.vibe_tags.join('、')}
      </div>
    </div>
  ))}
</div>
    </main>
  )
}