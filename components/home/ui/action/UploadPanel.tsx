export default function UploadPanel() {
  return (
    /* 確保容器本身沒有過大的 padding-left，這裡 px-3 是適中的 */
    <div className="w-[172px] rounded-[18px] border border-[#d98cf5] bg-[#faf7fb] px-4 py-4 shadow-[0_20px_24px_rgba(0,0,0,0.08)]">
      
      {/* 標題靠左對齊 */}
      <div className="mb-4 text-[16px] font-medium text-[#666] text-left">
        上傳內容
      </div>

      <div className="space-y-4">
        {/* 按鈕組合 */}
        <button
          type="button"
          /* items-center 確保圖示與文字垂直居中；justify-start 確保內容向左靠攏 */
          className="flex w-full items-center justify-start gap-3 text-[15px] text-[#333] hover:opacity-70 transition-opacity"
        >
          <span className="text-[18px]">📝</span>
          <span>貼文</span>
        </button>

        <button
          type="button"
          className="flex w-full items-center justify-start gap-3 text-[15px] text-[#333] hover:opacity-70 transition-opacity"
        >
          <span className="text-[18px]">🎬</span>
          <span>短影片</span>
        </button>

        <button
          type="button"
          className="flex w-full items-center justify-start gap-3 text-[15px] text-[#333] hover:opacity-70 transition-opacity"
        >
          <span className="text-[18px]">🖼️</span>
          <span>配對牆相片集</span>
        </button>
      </div>
    </div>
  )
}