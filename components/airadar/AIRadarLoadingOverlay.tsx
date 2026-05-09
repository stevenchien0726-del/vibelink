'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

type Props = {
  open: boolean
}

export default function AIRadarLoadingOverlay({ open }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pointer-events-none fixed left-1/2 top-[82px] z-[9999] w-full max-w-[430px] -translate-x-1/2 px-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
        >
          <motion.div
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="mx-auto flex w-full max-w-[360px] items-center justify-center gap-2 rounded-[24px] bg-white/90 px-5 py-4 shadow-[0_10px_34px_rgba(0,0,0,0.12)] backdrop-blur-xl"
          >
            <motion.div
              animate={{
                scale: [1, 1.18, 1],
                opacity: [0.75, 1, 0.75],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
              }}
              className="text-[#9f44d3]"
            >
              <Sparkles size={24} strokeWidth={2.4} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0.65 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="text-[15px] font-medium text-[#8e3fd1]"
            >
              AI 正在掃描新的 vibe...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}