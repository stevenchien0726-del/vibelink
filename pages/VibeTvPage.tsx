'use client'

export default function VibeTvPage() {
  return (
    <div className="min-h-screen bg-[#f3f3f3] px-4 pt-4 pb-[110px]">
      <div className="mx-auto w-full max-w-[430px]">
        {/* Top Actions */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <button className="flex h-10 items-center justify-center rounded-full bg-[#d9d9d9] px-4 text-[16px] font-medium text-[#111]">
            Vibe會員
          </button>

          <button className="flex h-10 items-center justify-center rounded-full bg-[#d9d9d9] px-5 text-[16px] font-medium text-[#111]">
            VibeTV APP
            <span className="ml-2 text-[18px]">›</span>
          </button>
        </div>

        {/* Logo */}
        <div className="mb-4 pt-[2px]">
  <h1 className="text-[36px] font-black italic leading-[1.18] tracking-[-0.03em] text-[#2a2a2a]">
    <span className="inline-block bg-gradient-to-r from-[#c86ad9] to-[#7a4fd1] bg-clip-text pr-[10px] text-transparent">
      VIBE
    </span>
    <span className="ml-1 inline-block text-[#2a2a2a]">TV</span>
  </h1>
</div>

        {/* Hero Banner */}
        <div className="mb-4 h-[170px] w-full rounded-[20px] bg-[#d9d9d9]" />

        {/* Dots */}
        <div className="mb-5 flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#d46bcf]" />
          <span className="h-2 w-2 rounded-full bg-[#cfcfcf]" />
          <span className="h-2 w-2 rounded-full bg-[#cfcfcf]" />
        </div>

        {/* Section 1 */}
        <section className="mb-6">
          <h2 className="mb-3 text-[18px] font-semibold text-[#222]">Vibe TV精選</h2>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[120px] min-w-[84px] rounded-[10px] bg-[#d9d9d9] shrink-0"
              />
            ))}
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="mb-3 text-[18px] font-semibold text-[#222]">台灣Top10</h2>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[120px] min-w-[84px] rounded-[10px] bg-[#d9d9d9] shrink-0"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}