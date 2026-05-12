'use client'

type Props = {
  prompts: string[]
  onSelectPrompt: (prompt: string) => void
  title?: string
  variant?: 'default' | 'rewrite'
}

export default function AIRadarPromptList({
  prompts,
  onSelectPrompt,
  title,
  variant = 'default',
}: Props) {
  if (!prompts.length) {
    return null
  }

  const isRewrite = variant === 'rewrite'

  return (
    <div className="mt-6 px-1">
      <div className="flex items-center gap-1 text-[16px] font-medium text-[#6b4f7f]">
        <span>
          {title ??
            (isRewrite
              ? '你也可以試試這樣問'
              : '更多提示詞')}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-4">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className={`
              w-full rounded-[16px]
              px-4 py-4
              text-left text-[14px]
              transition active:scale-[0.98]
              ${
                isRewrite
                  ? 'bg-gradient-to-br from-[#f7efff] to-[#f4f0ff] text-[#5b3d75] shadow-[0_4px_14px_rgba(124,58,237,0.08)]'
                  : 'bg-white text-[#222] shadow-[0_3px_10px_rgba(0,0,0,0.04)]'
              }
            `}
          >
            <div className="flex items-start gap-2">
              {isRewrite && (
                <div className="mt-[1px] text-[15px]">
                  ✨
                </div>
              )}

              <div className="leading-[1.5]">
                {prompt}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}