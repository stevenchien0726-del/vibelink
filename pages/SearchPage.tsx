'use client'

import { getUiLocale, uiText } from '@/lib/uiText'

type SearchPageProps = {
  searchText?: string
  onBack: () => void
  onChangeSearchText: (value: string) => void
}

export default function SearchPage({
  searchText,
  onBack,
  onChangeSearchText,
}: SearchPageProps) {
  const locale = getUiLocale()
  const text = {
    back: uiText('返回', 'Back'),
    search: uiText('搜尋', 'Search'),
    results: uiText('搜尋結果', 'Search Results'),
    noResults: uiText('找不到相關結果', 'No matching results'),
  }
  const mockResults = [
    { id: 'u1', name: 'Sky.07_21', sub: locale === 'en' ? 'Popular creator' : '人氣創作者', type: 'people' },
    { id: 'u2', name: 'Ryan_88', sub: locale === 'en' ? 'Recently active' : '最近很活躍', type: 'people' },
    { id: 'u3', name: 'Leo_wave', sub: locale === 'en' ? 'Lifestyle and music' : '生活感與音樂', type: 'people' },
    { id: 'p1', name: locale === 'en' ? 'Night city lifestyle' : '夜晚城市的生活感', sub: locale === 'en' ? 'Post' : '貼文', type: 'post' },
    { id: 'p2', name: locale === 'en' ? 'Cafe daily inspiration' : '咖啡廳日常靈感', sub: locale === 'en' ? 'Post' : '貼文', type: 'post' },
  ]

  const safeSearchText = (searchText ?? '').trim().toLowerCase()

  const filteredResults = mockResults.filter((item) =>
    item.name.toLowerCase().includes(safeSearchText)
  )

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-[110px]">
      <div className="fixed top-0 left-1/2 z-[40] h-[60px] w-full max-w-[430px] -translate-x-1/2 bg-[rgba(245,245,245,0.96)] px-[14px] py-[8px] backdrop-blur-md">
        <div className="flex h-full items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 text-[15px] font-medium text-[#666]"
          >
            {text.back}
          </button>

          <div className="flex h-[42px] flex-1 items-center gap-2 rounded-full border border-[#e6d8ee] bg-[#f7f1fa] px-4 shadow-[0_8px_22px_rgba(0,0,0,0.08)]">
            <SearchIcon />
            <input
              autoFocus
              value={searchText ?? ''}
              onChange={(e) => onChangeSearchText(e.target.value)}
              placeholder={text.search}
              className="w-full bg-transparent text-[16px] text-[#333] outline-none placeholder:text-[#999]"
            />
          </div>
        </div>
      </div>

      <main className="px-[14px] pt-[74px]">
        <h2 className="mb-3 text-[18px] font-semibold text-[#444]">{text.results}</h2>

        <div className="flex flex-col gap-3">
          {filteredResults.length > 0 ? (
            filteredResults.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex items-center gap-3 rounded-[18px] bg-white px-4 py-3 text-left shadow-[0_4px_14px_rgba(0,0,0,0.05)]"
              >
                <div className="h-[48px] w-[48px] shrink-0 rounded-full bg-[#d8d8d8]" />
                <div className="min-w-0">
                  <div className="truncate text-[16px] font-semibold text-[#222]">
                    {item.name}
                  </div>
                  <div className="truncate text-[13px] text-[#888]">{item.sub}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-[18px] bg-white px-4 py-5 text-[15px] text-[#888] shadow-[0_4px_14px_rgba(0,0,0,0.05)]">
              {text.noResults}「{searchText ?? ''}」
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M20 20l-3.2-3.2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
