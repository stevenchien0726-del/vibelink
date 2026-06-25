'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import type { Locale } from '@/i18n'

import { getCachedSession } from '@/lib/authSessionCache'

export type AIRadarUsageSummary = {
  ok: true
  planName: string
  weeklyLimitLabel: string
  weekStart: string
  weekEnd: string
  weeklyUsedCount: number
  cooldownUntil: string | null
}

type UsageSummaryError = {
  ok: false
  error?: string
}

type Props = {
  onClose: () => void
  locale?: Locale
  initialSummary?: AIRadarUsageSummary | null
  onSummaryChange?: (summary: AIRadarUsageSummary) => void
}

const PULL_REFRESH_THRESHOLD = 70
const MAX_PULL_DISTANCE = 96

export async function fetchAIRadarUsageSummary() {
  const session = await getCachedSession()

  if (!session?.access_token) {
    throw new Error('MISSING_SESSION')
  }

  const response = await fetch('/api/ai-radar/usage-summary', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })
  const data = (await response.json()) as
    | AIRadarUsageSummary
    | UsageSummaryError

  if (!response.ok || !data?.ok) {
    throw new Error(
      data && 'error' in data
        ? data.error ?? 'USAGE_SUMMARY_FAILED'
        : 'USAGE_SUMMARY_FAILED'
    )
  }

  return data
}

const myAIRadarText = {
  'zh-TW': {
    title: '\u6211\u7684AI\u96f7\u9054',
    notice:
      'AI \u96f7\u9054\u6703\u54e1\u9650\u5236\u5c1a\u672a\u555f\u52d5\uff0c\u76ee\u524d\u5148\u986f\u793a\u51b7\u555f\u52d5\u671f\u9593\u7684\u771f\u5be6\u4f7f\u7528\u8cc7\u6599\u3002',

    planType: '\u6211\u7684\u65b9\u6848\u985e\u578b',
    weeklyLimit: '\u55ae\u9031AI\u96f7\u9054\u53ef\u4f7f\u7528\u6b21\u6578',
    weeklyPeriod: '\u55ae\u5468\u8d77\u7b97\u8207\u7d50\u675f\u65e5',
    weeklyUsed: '\u55ae\u9031\u5df2\u4f7f\u7528\u6b21\u6578',

    times: '\u6b21',
    loading: '\u8b80\u53d6\u4e2d...',
    unavailable: '\u66ab\u6642\u7121\u6cd5\u8b80\u53d6',
    refreshing: '\u66f4\u65b0\u4e2d...',
    refreshFailed: '\u66ab\u6642\u7121\u6cd5\u66f4\u65b0',
    planInactive: '\u5c1a\u672a\u555f\u52d5\u6703\u54e1',
    weeklyLimitInactive: '\u5c1a\u672a\u555f\u52d5\u8a08\u7b97',
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
    refreshing: 'Refreshing...',
    refreshFailed: 'Could not refresh',
    planInactive: 'Membership not activated',
    weeklyLimitInactive: 'Not calculated yet',
  },
} as const

export default function MyAIRadarPage({
  onClose,
  locale = 'zh-TW',
  initialSummary = null,
  onSummaryChange,
}: Props) {
  const text = myAIRadarText[locale] ?? myAIRadarText['zh-TW']
  const [summary, setSummary] = useState<AIRadarUsageSummary | null>(
    initialSummary
  )
  const [loading, setLoading] = useState(!initialSummary)
  const [refreshing, setRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartYRef = useRef<number | null>(null)
  const touchStartXRef = useRef<number | null>(null)
  const isPullingRef = useRef(false)
  const canPullRefreshRef = useRef(false)
  const summaryRef = useRef<AIRadarUsageSummary | null>(initialSummary)

  useEffect(() => {
    summaryRef.current = summary
  }, [summary])

  const loadSummary = useCallback(
    async ({
      silent = false,
      refresh = false,
    }: {
      silent?: boolean
      refresh?: boolean
    } = {}) => {
      if (!silent && !refresh) {
        setLoading(true)
      }

      if (refresh) {
        setRefreshing(true)
      }

      setErrorMessage('')

      try {
        const nextSummary = await fetchAIRadarUsageSummary()
        setSummary(nextSummary)
        onSummaryChange?.(nextSummary)
      } catch (error) {
        console.warn('AI Radar usage summary failed:', error)
        setErrorMessage(
          summaryRef.current ? text.refreshFailed : text.unavailable
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [onSummaryChange, text.refreshFailed, text.unavailable]
  )

  useEffect(() => {
    setSummary(initialSummary)

    void loadSummary({
      silent: Boolean(initialSummary),
    })
  }, [initialSummary, loadSummary])

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]

    touchStartYRef.current = touch.clientY
    touchStartXRef.current = touch.clientX
    isPullingRef.current = false
    canPullRefreshRef.current = touch.clientY <= 140
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!canPullRefreshRef.current) {
      return
    }

    if (touchStartYRef.current == null || touchStartXRef.current == null) {
      return
    }

    const touch = e.touches[0]
    const deltaY = touch.clientY - touchStartYRef.current
    const deltaX = touch.clientX - touchStartXRef.current

    if (Math.abs(deltaX) > Math.abs(deltaY) || deltaY <= 0) {
      return
    }

    isPullingRef.current = true
    setPullDistance(Math.min(MAX_PULL_DISTANCE, deltaY * 0.55))
  }

  const handleTouchEnd = () => {
    const shouldRefresh =
      isPullingRef.current &&
      pullDistance >= PULL_REFRESH_THRESHOLD &&
      !refreshing

    touchStartYRef.current = null
    touchStartXRef.current = null
    isPullingRef.current = false
    canPullRefreshRef.current = false
    setPullDistance(0)

    if (shouldRefresh) {
      void loadSummary({ refresh: true })
    }
  }

  const fallbackValue = errorMessage || text.loading
  const planName =
    locale === 'en'
      ? text.planInactive
      : summary?.planName ?? text.planInactive
  const weeklyLimitLabel =
    locale === 'en'
      ? text.weeklyLimitInactive
      : summary?.weeklyLimitLabel ?? text.weeklyLimitInactive
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
      <div
        className="relative min-h-screen w-full max-w-[430px] touch-pan-y overflow-x-hidden bg-[var(--app-bg)] text-[var(--app-text)]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
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

        <motion.div
          style={{
            y: pullDistance,
          }}
          transition={{ duration: 0.18 }}
        >
          {(refreshing || errorMessage || pullDistance > 12) && (
            <div className="-mt-1 px-4 pb-1 text-center text-[12px] font-medium text-[var(--app-muted)]">
              {refreshing ? text.refreshing : errorMessage || text.refreshing}
            </div>
          )}

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
        </motion.div>
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
