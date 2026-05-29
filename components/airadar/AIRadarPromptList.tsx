'use client'

import { uiText } from '@/lib/uiText'

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
      <div className="flex items-center gap-1 text-[16px] font-medium text-[var(--app-muted)]">
        <span>
          {title ??
            (isRewrite
              ? uiText('你也可以試試這樣問', 'You can also try asking')
              : uiText('更多提示詞', 'More Prompts'))}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-4">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className="
              w-full rounded-[16px]
              border border-[var(--app-card-border)]
              bg-[var(--app-card)]
              px-4 py-4
              text-left text-[14px] text-[var(--app-text)]
              shadow-[0_4px_14px_rgba(0,0,0,0.08)]
              transition active:scale-[0.98]
            "
          >
            <div className="flex items-start gap-2">
              {isRewrite && (
                <div className="mt-[1px] text-[16px] text-[#8B5CF6]">
                  ↳
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
