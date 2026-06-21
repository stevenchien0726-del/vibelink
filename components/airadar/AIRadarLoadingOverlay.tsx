'use client'

import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

type Props = {
  open: boolean
  text?: string
}

function AIRadarLoadingOverlay({
  open,
  text = '',
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pointer-events-none fixed left-1/2 top-[25vh] z-[9999] w-full max-w-[430px] -translate-x-1/2 px-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
        >
          <motion.div
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="mx-auto flex w-full max-w-[360px] items-center justify-center gap-2 rounded-[24px] bg-white/95 px-5 py-4 shadow-[0_6px_18px_rgba(0,0,0,0.10)] will-change-transform [backface-visibility:hidden] [transform:translateZ(0)]"
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

            <AnimatePresence mode="wait">
              <motion.p
                key={text}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
                className="text-[15px] font-medium text-[#8e3fd1]"
              >
                {text}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(AIRadarLoadingOverlay)
