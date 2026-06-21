'use client'

import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Locale } from '@/i18n'

type AIRadarInfoSheetProps = {
  open: boolean
  onClose: () => void
  locale: Locale
}

const aiRadarInfoText = {
  'zh-TW': {
    aiRadarInfoTagline: '用自然語言找到對的 Vibe，對的人',
    aiRadarInfoWhatTitle: 'AI Radar 是什麼？',
    aiRadarInfoWhatIntro: 'AI Radar 會分析用戶的：',
    aiRadarInfoPointPhotoStyle: '照片與貼文風格',
    aiRadarInfoPointInterestStyle: '興趣與風格識別',
    aiRadarInfoPointBio: '個人介紹',
    aiRadarInfoWhatOutro: '來幫您找到你想找的人',
    aiRadarInfoHowTitle: '可以怎麼問？',
    aiRadarInfoExample1: '幫我找情緒穩定愛社交的人',
    aiRadarInfoExample2: '想找愛旅行的人',
    aiRadarInfoExample3: '找台北夜生活咖',
    aiRadarInfoExample4: '找可愛和喜歡大自然的女生',
    aiRadarInfoExample5: '找帥氣身材好，喜歡健身的男生',
    aiRadarInfoHowWorksTitle: 'AI Radar 如何運作？',
    aiRadarInfoStep1: '理解你的描述',
    aiRadarInfoStep2: '掃描符合條件的用戶',
    aiRadarInfoStep3: '分析照片與貼文風格',
    aiRadarInfoStep4: '向您推薦最理想的人選',
  },
  en: {
    aiRadarInfoTagline:
      'Find the right vibe and the right people with natural language.',
    aiRadarInfoWhatTitle: 'What is AI Radar?',
    aiRadarInfoWhatIntro: 'AI Radar analyzes users’:',
    aiRadarInfoPointPhotoStyle: 'Photo and post style',
    aiRadarInfoPointInterestStyle: 'Interests and vibe patterns',
    aiRadarInfoPointBio: 'Personal bio',
    aiRadarInfoWhatOutro:
      'to help you discover the people you are looking for.',
    aiRadarInfoHowTitle: 'What can you ask?',
    aiRadarInfoExample1:
      'Find people who are emotionally stable and social',
    aiRadarInfoExample2: 'Find people who love traveling',
    aiRadarInfoExample3: 'Find Taipei nightlife people',
    aiRadarInfoExample4: 'Find cute girls who love nature',
    aiRadarInfoExample5:
      'Find fit and handsome guys who like working out',
    aiRadarInfoHowWorksTitle: 'How does AI Radar work?',
    aiRadarInfoStep1: 'Understand your description',
    aiRadarInfoStep2: 'Scan users who match your criteria',
    aiRadarInfoStep3: 'Analyze photo and post styles',
    aiRadarInfoStep4: 'Recommend the best-fit people for you',
  },
} as const

function AIRadarInfoSheet({
  open,
  onClose,
  locale,
}: AIRadarInfoSheetProps) {
  const text = aiRadarInfoText[locale] ?? aiRadarInfoText['zh-TW']
  const examples = [
    text.aiRadarInfoExample1,
    text.aiRadarInfoExample2,
    text.aiRadarInfoExample3,
    text.aiRadarInfoExample4,
    text.aiRadarInfoExample5,
  ]
  const steps = [
    text.aiRadarInfoStep1,
    text.aiRadarInfoStep2,
    text.aiRadarInfoStep3,
    text.aiRadarInfoStep4,
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-h-[86vh] w-full max-w-[430px] rounded-t-[32px] border border-white/10 bg-[#09060f] text-white shadow-[0_-12px_36px_rgba(132,55,255,0.20)] will-change-transform [backface-visibility:hidden] [transform:translateZ(0)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 34 }}
            onClick={(event) => event.stopPropagation()}
          >
            <motion.div
              className="absolute inset-x-0 top-0 z-30 flex h-8 cursor-grab justify-center pt-3 active:cursor-grabbing"
              drag="y"
              dragDirectionLock
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.35 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 70 || info.velocity.y > 600) {
                  onClose()
                }
              }}
            >
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </motion.div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close AI Radar info"
              className="
                absolute
                right-4
                top-4
                z-40
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-white/5
                text-white/90
                transition-all
                hover:bg-white/10
                active:scale-95
              "
            >
              <X size={24} strokeWidth={2.5} />
            </button>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 rounded-t-[32px] bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.34),transparent_66%)]" />

            <div className="relative max-h-[86vh] overflow-y-auto scrollbar-hide px-6 pb-10 pt-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="-ml-6 pr-12">
                <img
                  src="/image/ai-radar-logo.png"
                  alt="AI Radar"
                  className="h-[80px] w-auto object-contain"
                />
              </div>

              <p className="text-[16px] leading-[1.75] text-purple-100/90">
                {text.aiRadarInfoTagline}
              </p>

              <section className="mt-10">
                <h3 className="text-[18px] font-semibold text-white">
                  {text.aiRadarInfoWhatTitle}
                </h3>

                <p className="mt-3 text-[15px] leading-[1.85] text-white/75">
                  {text.aiRadarInfoWhatIntro}
                </p>

                <ul className="mt-3 space-y-2 text-[15px] leading-[1.75] text-white/75">
                  <li>- {text.aiRadarInfoPointPhotoStyle}</li>
                  <li>- {text.aiRadarInfoPointInterestStyle}</li>
                  <li>- {text.aiRadarInfoPointBio}</li>
                </ul>

                <p className="mt-4 text-[15px] leading-[1.85] text-white/75">
                  {text.aiRadarInfoWhatOutro}
                </p>
              </section>

              <section className="mt-12">
                <h3 className="text-[18px] font-semibold text-white">
                  {text.aiRadarInfoHowTitle}
                </h3>

                <div className="mt-4 space-y-4 text-[15px] leading-[1.75] text-purple-100/90">
                  {examples.map((example) => (
                    <p key={example}>💬 {example}</p>
                  ))}
                </div>
              </section>

              <section className="mt-12">
                <h3 className="text-[18px] font-semibold text-white">
                  {text.aiRadarInfoHowWorksTitle}
                </h3>

                <ol className="mt-4 space-y-3 text-[15px] leading-[1.75] text-white/75">
                  {steps.map((step, index) => (
                    <li key={step}>
                      {index + 1}. {step}
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(AIRadarInfoSheet)
