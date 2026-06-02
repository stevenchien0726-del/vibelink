'use client'

import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

type Props = {
  onClose: () => void

  planName?: string
  monthlyLimit?: number

  startDate?: string
  endDate?: string

  remainingCount?: number
}

export default function MyAIRadarPage({
  onClose,

  planName = 'Vibe Plus',
  monthlyLimit = 150,

  startDate = '2026/06/01',
  endDate = '2026/06/08',

  remainingCount = 84,
}: Props) {
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
      {/* Header */}
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
            我的AI雷達
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <InfoCard title="我的Vibe方案類型" value={planName} />

          <InfoCard
            title="單周AI雷達可使用次數"
            value={`${monthlyLimit} 次`}
          />

          <InfoCard
            title="單周起算與結束日"
            value={`${startDate}\n${endDate}`}
          />

          <InfoCard
            title="單周使用剩餘次數"
            value={`${remainingCount} 次`}
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