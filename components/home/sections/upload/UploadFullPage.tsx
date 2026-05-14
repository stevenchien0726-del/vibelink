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
      className="fixed inset-0 z-[9999] flex justify-center"
      style={{ background: 'rgba(243,243,243,0.96)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="relative min-h-screen w-full max-w-[430px] overflow-hidden touch-pan-y"
        style={{ background: '#f3f3f3' }}
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
        <div className="flex min-h-screen flex-col px-4 pt-4 pb-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-[15px] font-medium"
              style={{
                color: '#111111',
                background: 'transparent',
              }}
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
              style={{
                height: '40px',
                minWidth: '120px',
                padding: '0 24px',
                borderRadius: '14px',
                background: isReadyToPost ? '#c86cff' : '#efd6f4',
                color: isReadyToPost ? '#ffffff' : '#cfafd7',
                opacity: isReadyToPost ? 1 : 0.7,
                fontSize: '15px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
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
                  onSuccess={() => {
  onClose()
}}
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
            <div className="relative grid grid-cols-2 rounded-[18px] bg-[#dddddd] p-[4px]">
              <motion.div
                className="absolute top-[4px] bottom-[4px] rounded-[14px] bg-[#f0f0f0]"
                animate={{
                  left:
  activeTab === 'video'
    ? '4px'
    : 'calc(50% + 1px)',

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
                  color: activeTab === 'video' ? '#111111' : '#666666',
                }}
              >
                短影片
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('post')}
                className="relative z-[2] h-[48px] rounded-[14px] border-none bg-transparent text-[15px] font-medium"
                style={{
                  color: activeTab === 'post' ? '#111111' : '#666666',
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