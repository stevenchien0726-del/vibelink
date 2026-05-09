'use client'

type Props = {
  prompts: string[]
  onSelectPrompt: (prompt: string) => void
}

export default function AIRadarPromptList({
  prompts,
  onSelectPrompt,
}: Props) {
  return (
    <div className="mt-6 px-1">
      <div className="flex items-center gap-1 text-[16px] font-medium text-[#6b4f7f]">
        <span>更多提示詞</span>
      </div>

      <div className="mt-3 flex flex-col gap-5">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className="w-full rounded-[14px] bg-white px-3 py-4 text-left text-[14px] text-[#222] shadow-[0_3px_10px_rgba(0,0,0,0.04)] transition active:scale-[0.98]"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}