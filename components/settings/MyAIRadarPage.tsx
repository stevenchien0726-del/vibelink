'use client'

import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import type { Locale } from '@/i18n'

type Props = {
  onClose: () => void
  locale?: Locale

  planName?: string
  monthlyLimit?: number

  startDate?: string
  endDate?: string

  remainingCount?: number
}

const myAIRadarText = {
  'zh-TW': {
    title: '我的AI雷達',
    notice: '會員 AI 雷達限制尚未啟動，此畫面為模擬畫面',

    planType: '我的Vibe方案類型',
    weeklyLimit: '單周AI雷達可使用次數',
    weeklyPeriod: '單周起算與結束日',
    weeklyRemaining: '單周使用剩餘次數',

    times: '次',
  },

  en: {
    title: 'My AI Radar',
    notice: 'AI Radar membership limits are not active yet. This screen is a preview.',

    planType: 'My Vibe Plan',
    weeklyLimit: 'Weekly AI Radar Limit',
    weeklyPeriod: 'Weekly Start & End Date',
    weeklyRemaining: 'Weekly Remaining Uses',

    times: 'uses',
  },
} as const

export default function MyAIRadarPage({
  onClose,
  locale = 'zh-TW',

  planName = 'Vibe Plus',
  monthlyLimit = 150,

  startDate = '2026/06/01',
  endDate = '2026/06/08',

  remainingCount = 84,
}: Props) {
  const text = myAIRadarText[locale] ?? myAIRadarText['zh-TW']

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex justify-center bg-[#dcdcdc]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{
        type: 'spring',
        stiffness: 340,
        damping: 32,
      }}
    >
      <div className="relative min-h-screen w-full max-w-[430px] bg-[var(--app-bg)] text-[var(--app-text)]">
        <div
          className="
            sticky top-0 z-20
            bg-[var(--app-bg)]/95
            backdrop-blur-md
            px-4 pt-3 pb-3
          "
        >
          <div className="relative flex items-center justify-center">
            <button
              onClick={onClose}
              className="
                absolute left-0
                flex h-[40px] w-[40px]
                items-center justify-center
                rounded-full
                active:scale-95
              "
            >
              <ChevronLeft size={24} />
            </button>

            <div className="text-[20px] font-medium">
              {text.title}
            </div>
          </div>
        </div>

        <div className="px-4 pt-4">
          <div
            className="
              mb-4
              rounded-[18px]
              border
              border-[#8B5CF6]/30
              bg-[#8B5CF6]/10
              px-4
              py-3
              text-center
              text-[13px]
              leading-relaxed
              text-[#c4b5fd]
            "
          >
            {text.notice}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoCard title={text.planType} value={planName} />

            <InfoCard
              title={text.weeklyLimit}
              value={`${monthlyLimit} ${text.times}`}
            />

            <InfoCard
              title={text.weeklyPeriod}
              value={`${startDate}\n${endDate}`}
            />

            <InfoCard
              title={text.weeklyRemaining}
              value={`${remainingCount} ${text.times}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function InfoCard({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <div
      className="
        flex flex-col
        justify-between
        rounded-[24px]
        bg-[var(--app-card)]
        p-4
        min-h-[140px]
      "
    >
      <div
        className="
          text-center
          text-[15px]
          font-medium
          leading-[1.3]
          text-[var(--app-text)]
        "
      >
        {title}
      </div>

      <div
        className="
          whitespace-pre-line
          text-center
          text-[20px]
          font-semibold
          text-[#a855f7]
        "
      >
        {value}
      </div>
    </div>
  )
}