export default function UploadPanel() {
  return (
    <div className="w-[172px] rounded-[18px] border border-[#d98cf5] bg-[var(--app-surface)] px-4 py-4 text-[var(--app-text)] shadow-[0_20px_24px_rgba(0,0,0,0.18)]">
      <div className="mb-4 text-left text-[16px] font-medium text-[var(--app-muted)]">
        上傳內容
      </div>

      <div className="space-y-4">
        {[
          ['📝', '貼文'],
          ['🎬', '短影片'],
          ['🖼️', '限時動態'],
        ].map(([icon, label]) => (
          <button
            key={label}
            type="button"
            className="flex w-full items-center justify-start gap-3 text-[15px] text-[var(--app-text)] transition-opacity hover:opacity-70"
          >
            <span className="text-[18px]">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}