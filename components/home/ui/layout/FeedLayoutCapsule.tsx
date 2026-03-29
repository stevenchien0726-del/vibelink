import { motion, AnimatePresence } from 'framer-motion'

type LayoutMode = '1x1' | '2x2' | '3x3'

type FeedLayoutCapsuleProps = {
  layout: LayoutMode
  onChangeLayout: (layout: LayoutMode) => void
}

function GridIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export default function FeedLayoutCapsule({
  layout,
  onChangeLayout,
}: FeedLayoutCapsuleProps) {
  const nextLayout: LayoutMode =
    layout === '1x1' ? '2x2' : layout === '2x2' ? '3x3' : '1x1'

  const label =
    layout === '1x1' ? '1x1' : layout === '2x2' ? '2x2' : '3x3'

  return (
    <motion.button
      type="button"
      onClick={() => onChangeLayout(nextLayout)}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className="flex h-11 items-center gap-2 rounded-full border border-white/40 bg-gray-200/60 px-4 text-[13px] font-medium text-[#444] shadow-[0_8px_24px_rgba(0,0,0,0.10)] backdrop-blur-md"
    >
      <motion.span
        key={`icon-${layout}`}
        initial={{ opacity: 0, y: 4, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="flex h-4 w-4 items-center justify-center text-[#444]"
      >
        <GridIcon />
      </motion.span>

      <span className="relative flex h-[18px] min-w-[34px] items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-0 top-0 whitespace-nowrap"
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
  )
}