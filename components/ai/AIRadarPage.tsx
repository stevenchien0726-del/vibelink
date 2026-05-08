'use client'

import { useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { searchAIRadarUsers, type AIRadarResult } from '@/lib/aiRadar'

export default function AIRadarPage() {
  const [query, setQuery] = useState('')

}

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

        <div className="mt-3 flex flex-wrap gap-2">
          {[
            '健身 身材',
            '海邊 旅行',
            'KPOP 可愛',
            '夜生活 Techno',
            '穿搭 歐美',
          ].map((item) => (
            <button
              key={item}
              onClick={() => {
                setQuery(item)
                setResults(searchAIRadarUsers(item))
              }}
              className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs text-zinc-700 active:scale-95"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 px-3">
        {results.length === 0 ? (
          <div className="mt-16 text-center text-sm text-zinc-400">
            輸入條件後，AI雷達會顯示符合的用戶照片牆
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {results.map((user) => (
              <div
                key={user.id}
                className="overflow-hidden rounded-3xl bg-zinc-100 shadow-sm"
              >
                <div className="relative aspect-[3/4] bg-zinc-200">
                  <img
                    src={user.image}
                    alt={user.display_name}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                    <div className="flex items-center gap-2">
                      <img
                        src={user.avatar_url}
                        alt={user.display_name}
                        className="h-7 w-7 rounded-full border border-white/60 object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold leading-tight">
                          {user.display_name}
                        </p>
                        <p className="text-[11px] text-white/75">
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    <p className="mt-2 line-clamp-1 text-xs text-white/85">
                      {user.bio}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 px-2 py-2">
                  {user.vibe_tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white px-2 py-1 text-[10px] text-zinc-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}