export default function UploadPanel() {
  return (
    <div className="w-[172px] rounded-[18px] border border-[#d98cf5] bg-[#faf7fb] px-4 py-4 shadow-[0_20px_24px_rgba(0,0,0,0.08)]">
      <div className="mb-4 text-left text-[16px] font-medium text-[#666]">
        上傳內容
      </div>

      <div className="space-y-4">
        <button
          type="button"
          className="flex w-full items-center justify-start gap-3 text-[15px] text-[#333] transition-opacity hover:opacity-70"
        >
          <span className="text-[18px]">📝</span>
          <span>貼文</span>
        </button>

        <button
          type="button"
          className="flex w-full items-center justify-start gap-3 text-[15px] text-[#333] transition-opacity hover:opacity-70"
        >
          <span className="text-[18px]">🎬</span>
          <span>短影片</span>
        </button>

        <button
          type="button"
          className="flex w-full items-center justify-start gap-3 text-[15px] text-[#333] transition-opacity hover:opacity-70"
        >
          <span className="text-[18px]">🖼️</span>
          <span>限時動態</span>
        </button>
      </div>
    </div>
  )
}