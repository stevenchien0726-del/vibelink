'use client'

export default function MatchingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f5f5f5]">
      <div className="fixed top-0 left-1/2 z-[40] flex h-[60px] w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[rgba(245,245,245,0.96)] px-4 backdrop-blur-md">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center bg-transparent text-[#111]"
        >
          <BackIcon />
        </button>

        <div className="text-[22px] font-semibold tracking-[-0.3px] text-[#111]">
          Matching
        </div>

        <div className="h-10 w-10" aria-hidden="true" />
      </div>

      <main className="min-h-screen px-4 pb-[110px] pt-[76px]">
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <div className="text-[22px] font-semibold text-[#111]">
            Matching is coming soon
          </div>
          <div className="mt-2 text-[14px] leading-[1.5] text-[#777]">
            Real matching is being prepared. No demo profiles are shown here.
          </div>
        </div>
      </main>
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
