'use client'

import { uiText } from '@/lib/uiText'

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
  const text = {
    back: uiText('返回', 'Back'),
    search: uiText('搜尋', 'Search'),
    results: uiText('搜尋結果', 'Search Results'),
    noResults: uiText('暫無符合的搜尋結果。', 'No matching results yet.'),
    preparing: uiText(
      '搜尋功能準備中，暫無結果。',
      'Search is getting ready. No results yet.'
    ),
  }

  const hasSearchText = (searchText ?? '').trim().length > 0

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
              onChange={(event) => onChangeSearchText(event.target.value)}
              placeholder={text.search}
              className="w-full bg-transparent text-[16px] text-[#333] outline-none placeholder:text-[#999]"
            />
          </div>
        </div>
      </div>

      <main className="px-[14px] pt-[74px]">
        <h2 className="mb-3 text-[18px] font-semibold text-[#444]">
          {text.results}
        </h2>

        <div className="flex flex-col gap-3">
          <div className="rounded-[18px] bg-white px-4 py-5 text-[15px] text-[#888] shadow-[0_4px_14px_rgba(0,0,0,0.05)]">
            {hasSearchText ? text.noResults : text.preparing}
          </div>
        </div>
      </main>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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
