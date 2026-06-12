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
import { uiText } from '@/lib/uiText'

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

  const [isSubmitting, setIsSubmitting] = useState(false)

  const createPostRef = useRef<CreatePostBoxRef>(null)
  const createShortVideoRef = useRef<CreateShortVideoBoxRef>(null)

  const text = {
    close: uiText('關閉', 'CLOSE'),
    publishing: uiText('發佈中...', 'Publishing...'),
    publish: uiText('發佈', 'Publish'),
    publishFailed: uiText('發佈失敗，請檢查網路後再試一次。', 'Publishing failed. Please check your connection and try again.'),
    shortVideo: uiText('短影片', 'Short Video'),
    post: uiText('貼文', 'Post'),
  }

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
              onClick={() => {
  if (isSubmitting) return
  onClose()
}}
              className="text-[15px] font-medium text-[var(--app-text)]"
            >
              {text.close}
            </button>

            <button
              type="button"
              disabled={!isReadyToPost || isSubmitting}
              onClick={async () => {
  if (!isReadyToPost || isSubmitting) return

  setIsSubmitting(true)

  try {
    const submitPromise =
      activeTab === 'post'
        ? createPostRef.current?.submitPost()
        : createShortVideoRef.current?.submitVideo()

    await Promise.race([
      Promise.resolve(submitPromise),
      new Promise((_, reject) => {
        window.setTimeout(() => {
          reject(new Error('upload timeout'))
        }, 15000)
      }),
    ])
  } catch (error) {
    console.error('發佈失敗或逾時:', error)
    alert(text.publishFailed)
  } finally {
    setIsSubmitting(false)
  }
}}

              className="flex h-[40px] min-w-[120px] items-center justify-center rounded-[14px] px-6 text-[15px] font-medium"
              style={{
                background: isReadyToPost ? '#c86cff' : '#efd6f4',
                color: isReadyToPost ? '#ffffff' : '#cfafd7',
                opacity: isReadyToPost ? 1 : 0.7,
              }}
            >
              {isSubmitting ? text.publishing : text.publish}
            </button>
          </div>

          <div className="sticky top-0 z-[2] bg-[var(--app-bg)] pb-3 pt-4">
            <div className="relative grid grid-cols-2 rounded-[18px] bg-[var(--app-card)] p-[4px]">
              <motion.div
                className="absolute bottom-[4px] top-[4px] rounded-[14px] bg-[var(--app-surface)]"
                animate={{
                  left: activeTab === 'post' ? '4px' : 'calc(50% + 1px)',
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
                onClick={() => setActiveTab('post')}
                className="relative z-[2] h-[48px] rounded-[14px] border-none bg-transparent text-[15px] font-medium"
                style={{
                  color:
                    activeTab === 'post'
                      ? 'var(--app-text)'
                      : 'var(--app-muted)',
                }}
              >
                {text.post}
              </button>

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
                {text.shortVideo}
              </button>
            </div>
          </div>

          <div className="h-[24px] shrink-0" />

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
        </div>
      </motion.div>
    </motion.div>
  )
}
