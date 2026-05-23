'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  posts: any[]
  onClose: () => void
  onUnarchive: (postId: string) => void
}

export default function ArchivedContentPage({
  posts,
  onClose,
  onUnarchive,
}: Props) {
  const [confirmPostId, setConfirmPostId] = useState<string | null>(null)

  return (
    <motion.div
      data-block-page-swipe="true"
      className="fixed inset-0 z-[1200] flex justify-center bg-[var(--app-bg)]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 360, damping: 34 }}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative min-h-screen w-full max-w-[430px] bg-[var(--app-bg)] text-[var(--app-text)]">
        <div className="fixed left-1/2 top-0 z-[20] w-full max-w-[430px] -translate-x-1/2 border-b border-[var(--app-card-border)] bg-[var(--app-bg)]/95 px-4 pb-3 pt-3 backdrop-blur-md">
          <div className="relative flex h-[40px] items-center justify-center">
            <button
              type="button"
              onClick={onClose}
              className="absolute left-0 flex h-[40px] w-[40px] items-center justify-center rounded-full text-[var(--app-text)] active:scale-95"
            >
              <ChevronLeft size={24} strokeWidth={2.2} />
            </button>

            <div className="text-[20px] font-medium tracking-[0.02em] text-[var(--app-text)]">
              典藏內容
            </div>
          </div>
        </div>

        <div className="px-[2px] pb-10 pt-[86px]">
          {posts.length === 0 ? (
            <div className="mt-[140px] flex flex-col items-center text-center">
              <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full border border-[var(--app-card-border)] bg-[var(--app-card)]">
                <div className="text-[34px]">🕘</div>
              </div>

              <div className="mt-5 text-[18px] font-medium text-[var(--app-text)]">
                目前沒有典藏內容
              </div>

              <div className="mt-2 max-w-[260px] text-[14px] leading-relaxed text-[var(--app-muted)]">
                之後你典藏的內容會集中在這裡，方便快速回看。
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[2px]">
              {posts.map((post) => {
                const isVideo =
                  post.type === 'video' || !!post.videoUrl || !!post.video_url
                const image = post?.post_images?.[0]?.image_url
                const videoUrl = post.videoUrl || post.video_url

                if (!image && !videoUrl) return null

                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setConfirmPostId(post.id)}
                    className="relative h-[190px] overflow-hidden bg-[var(--app-card)]"
                  >
                    {isVideo ? (
                      <video
                        src={videoUrl}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full bg-black object-cover"
                      />
                    ) : (
                      <img src={image} className="h-full w-full object-cover" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <AnimatePresence>
          {confirmPostId && (
            <motion.div
              className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/45 px-8 backdrop-blur-[6px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <motion.div
                className="w-full max-w-[320px] overflow-hidden rounded-[24px] border border-[var(--app-card-border)] bg-[var(--app-surface)] text-center shadow-xl"
                initial={{ opacity: 0, scale: 0.86, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              >
                <div className="px-6 pb-5 pt-6">
                  <div className="text-[18px] font-semibold text-[var(--app-text)]">
                    取消典藏這個內容？
                  </div>

                  <div className="mt-2 text-[14px] leading-relaxed text-[var(--app-muted)]">
                    取消後，這個內容會恢復顯示在你的個人頁內容牆。
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onUnarchive(confirmPostId)
                    setConfirmPostId(null)
                  }}
                  className="h-[48px] w-full border-t border-[var(--app-card-border)] text-[16px] font-medium text-[#8B5CF6]"
                >
                  確定取消典藏
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmPostId(null)}
                  className="h-[48px] w-full border-t border-[var(--app-card-border)] text-[16px] text-[var(--app-text)]"
                >
                  取消
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}