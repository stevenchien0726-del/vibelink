'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

type AIRadarInfoSheetProps = {
  open: boolean
  onClose: () => void
}

export default function AIRadarInfoSheet({
  open,
  onClose,
}: AIRadarInfoSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/45 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-h-[86vh] w-full max-w-[430px] rounded-t-[32px] border border-white/10 bg-[#09060f] text-white shadow-[0_-20px_70px_rgba(132,55,255,0.28)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 34 }}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Drag handle：只讓頂部把手負責下滑關閉，避免影響內容 scroll */}
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

              <p className="text-[16px] leading-[1.7] text-purple-100/90">
                用自然語言找到對的 Vibe，對的人
              </p>

              <section className="mt-10">
                <h3 className="text-[18px] font-semibold text-white">
                  AI Radar 是什麼？
                </h3>

                <p className="mt-3 text-[15px] leading-[1.8] text-white/75">
                  AI Radar 會分析用戶的：
                </p>

                <ul className="mt-3 space-y-2 text-[15px] leading-[1.7] text-white/75">
                  <li>- 照片與貼文風格</li>
                  <li>- 興趣與風格識別</li>
                  <li>- 個人介紹</li>
                </ul>

                <p className="mt-4 text-[15px] leading-[1.8] text-white/75">
                  來幫您找到你想找的人
                </p>
              </section>

              <section className="mt-12">
                <h3 className="text-[18px] font-semibold text-white">
                  可以怎麼問？
                </h3>

                <div className="mt-4 space-y-4 text-[15px] leading-[1.7] text-purple-100/90">
                  <p>💬 幫我找情緒穩定愛社交的人</p>
                  <p>💬 想找愛旅行的人</p>
                  <p>💬 找台北夜生活咖</p>
                  <p>💬 找可愛和喜歡大自然的女生</p>
                  <p>💬 找帥氣身材好，喜歡健身的男生</p>
                </div>
              </section>

              <section className="mt-12">
                <h3 className="text-[18px] font-semibold text-white">
                  AI Radar 如何運作？
                </h3>

                <ol className="mt-4 space-y-3 text-[15px] leading-[1.7] text-white/75">
                  <li>1. 理解你的描述</li>
                  <li>2. 掃描符合條件的用戶</li>
                  <li>3. 分析照片與貼文風格</li>
                  <li>4. 向您推薦最理想的人選</li>
                </ol>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}