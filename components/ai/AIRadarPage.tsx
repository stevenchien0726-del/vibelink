'use client'

import { useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { searchAIRadarUsers, type AIRadarResult } from '@/lib/aiRadar'

export default function AIRadarPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AIRadarResult[]>([])

  const handleSearch = () => {
    setResults(searchAIRadarUsers(query))
  }

  return (
    <main className="min-h-screen bg-white pb-24 pt-5">
      <section className="px-4">
        <div className="mb-4 rounded-[28px] bg-gradient-to-br from-purple-600 to-fuchsia-500 p-5 text-white shadow-lg">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles size={20} />
            <h1 className="text-xl font-bold">AI 雷達</h1>
          </div>

          <p className="text-sm leading-relaxed text-white/85">
            用一句話描述你想認識的人，Vibelink 會幫你找出最符合 vibe 的用戶。
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-3">
          <Search size={18} className="text-zinc-500" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
            placeholder="例如：台北會健身、喜歡海邊旅行的女生"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
          />

          <button
            onClick={handleSearch}
            className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white active:scale-95"
          >
            搜尋
          </button>
        </div>
      </section>
    </main>
  )
}