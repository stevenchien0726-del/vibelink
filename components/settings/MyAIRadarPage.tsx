'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import type { Locale } from '@/i18n'

import { getCachedSession } from '@/lib/authSessionCache'

type Props = {
  onClose: () => void
  locale?: Locale
}

type UsageSummary = {
  planName: string
  weeklyLimitLabel: string
  weekStart: string
  weekEnd: string
  weeklyUsedCount: number
  cooldownUntil: string | null
}

const myAIRadarText = {
  'zh-TW': {
    title: '我的AI雷達',
    notice: 'AI 雷達會員限制尚未啟動，目前先顯示冷啟動期間的真實使用資料。',

    planType: '我的方案類型',
    weeklyLimit: '單週AI雷達可使用次數',
    weeklyPeriod: '單周起算與結束日',
    weeklyUsed: '單週已使用次數',

    times: '次',
    loading: '讀取中...',
    unavailable: '暫時無法讀取',
    planInactive: '尚未啟動會員',
    weeklyLimitInactive: '尚未啟動計算',
  },

  en: {
    title: 'My AI Radar',
    notice:
      'AI Radar membership limits are not active yet. This screen shows real cold-start usage data.',

    planType: 'My Plan Type',
    weeklyLimit: 'Weekly AI Radar Uses',
    weeklyPeriod: 'Weekly Start & End Date',
    weeklyUsed: 'Weekly Used Uses',

    times: 'uses',
    loading: 'Loading...',
    unavailable: 'Temporarily unavailable',
    planInactive: 'Membership not activated',
    weeklyLimitInactive: 'Not calculated yet',
  },
} as const

export default function MyAIRadarPage({
  onClose,
  locale = 'zh-TW',
}: Props) {
  const text = myAIRadarText[locale] ?? myAIRadarText['zh-TW']
  const [summary, setSummary] = useState<UsageSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadSummary() {
      setLoading(true)
      setErrorMessage('')

      try {
        const session = await getCachedSession()

        if (!session?.access_token) {
          throw new Error('MISSING_SESSION')
        }

        const response = await fetch('/api/ai-radar/usage-summary', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })
        const data = await response.json()

        if (!response.ok || !data?.ok) {
          throw new Error(data?.error ?? 'USAGE_SUMMARY_FAILED')
        }

        if (!cancelled) {
          setSummary(data as UsageSummary)
        }
      } catch (error) {
        console.warn('AI Radar usage summary failed:', error)

        if (!cancelled) {
          setSummary(null)
          setErrorMessage(text.unavailable)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadSummary()

    return () => {
      cancelled = true
    }
  }, [text.unavailable])

  const fallbackValue = errorMessage || text.loading
  const planName =
    locale === 'en'
      ? text.planInactive
      : summary?.planName ?? '尚未啟動會員'
  const weeklyLimitLabel =
    locale === 'en'
      ? text.weeklyLimitInactive
      : summary?.weeklyLimitLabel ?? '尚未啟動計算'
  const weeklyPeriod =
    summary?.weekStart && summary?.weekEnd
      ? `${formatLocalDate(summary.weekStart)}\n${formatLocalDate(
          summary.weekEnd
        )}`
      : fallbackValue
  const weeklyUsedValue =
    summary && !loading
      ? `${summary.weeklyUsedCount} ${text.times}`
      : fallbackValue

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex justify-center overflow-x-hidden bg-[var(--app-bg)]"
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

          <div className="grid grid-cols-1 gap-4">
            <InfoCard title={text.planType} value={planName} />

            <InfoCard
              title={text.weeklyLimit}
              value={weeklyLimitLabel}
            />

            <InfoCard
              title={text.weeklyPeriod}
              value={weeklyPeriod}
            />

            <InfoCard
              title={text.weeklyUsed}
              value={weeklyUsedValue}
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

function formatLocalDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}/${month}/${day} ${hours}:${minutes}`
}
