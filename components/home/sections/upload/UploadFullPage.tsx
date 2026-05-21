'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import CreatePostBox, {
  type CreatePostBoxRef,
  type CreatedPostPayload,
} from '@/components/CreatePostBox'

import CreateShortVideoBox, {
  type CreateShortVideoBoxRef,
} from '@/components/CreateShortVideoBox'

type UploadTab = 'video' | 'post'

type UploadFullPageProps = {
  onClose: () => void
  onPostCreated?: (post: CreatedPostPayload) => void
}

export default function UploadFullPage({
  onClose,
  onPostCreated,
}: UploadFullPageProps) {
  const [activeTab, setActiveTab] = useState<UploadTab>('post')
  const [isReadyToPost, setIsReadyToPost] = useState(false)

  const createPostRef = useRef<CreatePostBoxRef>(null)
  const createShortVideoRef = useRef<CreateShortVideoBoxRef>(null)

  useEffect(() => {
    setIsReadyToPost(false)
  }, [activeTab])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex justify-center bg-[var(--app-bg)]/95 text-[var(--app-text)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-[var(--app-bg)] text-[var(--app-text)] touch-pan-y"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{
          type: 'spring',
          stiffness: 320,
          damping: 30,
          mass: 0.95,
        }}
        drag="y"
        dragDirectionLock
        dragElastic={{ top: 0, bottom: 0.16 }}
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={(_, info) => {
          const draggedDownEnough = info.offset.y > 140
          const fastEnough = info.velocity.y > 700

          if (draggedDownEnough || fastEnough) {
            onClose()
          }
        }}
      >
        <div className="flex min-h-screen flex-col px-4 pb-5 pt-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-[15px] font-medium text-[var(--app-text)]"
            >
              CLOSE
            </button>

            <button
              type="button"
              disabled={!isReadyToPost}
              onClick={() => {
                if (!isReadyToPost) return

                if (activeTab === 'post') {
                  createPostRef.current?.submitPost()
                }

                if (activeTab === 'video') {
                  createShortVideoRef.current?.submitVideo()
                }
              }}
              className="flex h-[40px] min-w-[120px] items-center justify-center rounded-[14px] px-6 text-[15px] font-medium"
              style={{
                background: isReadyToPost ? '#c86cff' : '#efd6f4',
                color: isReadyToPost ? '#ffffff' : '#cfafd7',
                opacity: isReadyToPost ? 1 : 0.7,
              }}
            >
              發佈
            </button>
          </div>

          <div className="h-[72px] shrink-0" />
          <div className="flex-1" />

          <AnimatePresence mode="wait">
            {activeTab === 'video' && (
              <motion.div
                key="video-content"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.2 }}
                className="mb-4"
              >
                <CreateShortVideoBox
                  ref={createShortVideoRef}
                  onReadyChange={(ready) => setIsReadyToPost(ready)}
                  onSuccess={onClose}
                />
              </motion.div>
            )}

            {activeTab === 'post' && (
              <motion.div
                key="post-content"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.2 }}
                className="mb-0"
              >
                <CreatePostBox
                  ref={createPostRef}
                  onReadyChange={(ready) => setIsReadyToPost(ready)}
                  onSuccess={(post) => {
                    onPostCreated?.(post)
                    onClose()
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-[24px] shrink-0" />

          <div className="pb-2">
            <div className="relative grid grid-cols-2 rounded-[18px] bg-[var(--app-card)] p-[4px]">
              <motion.div
                className="absolute bottom-[4px] top-[4px] rounded-[14px] bg-[var(--app-surface)]"
                animate={{
                  left: activeTab === 'video' ? '4px' : 'calc(50% + 1px)',
                  width: 'calc(50% - 6px)',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 360,
                  damping: 30,
                  mass: 0.9,
                }}
              />

              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className="relative z-[2] h-[48px] rounded-[14px] border-none bg-transparent text-[15px] font-medium"
                style={{
                  color:
                    activeTab === 'video'
                      ? 'var(--app-text)'
                      : 'var(--app-muted)',
                }}
              >
                短影片
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('post')}
                className="relative z-[2] h-[48px] rounded-[14px] border-none bg-transparent text-[15px] font-medium"
                style={{
                  color:
                    activeTab === 'post'
                      ? 'var(--app-text)'
                      : 'var(--app-muted)',
                }}
              >
                貼文
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}