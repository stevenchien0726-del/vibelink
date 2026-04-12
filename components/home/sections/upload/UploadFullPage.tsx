'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type UploadTab = 'video' | 'post' | 'album'

type UploadFullPageProps = {
  onClose: () => void
}

export default function UploadFullPage({
  onClose,
}: UploadFullPageProps) {
  const [activeTab, setActiveTab] = useState<UploadTab>('post')

  return (
    <motion.div
      className="fixed inset-0 z-[220] flex justify-center"
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
              style={{
                height: '40px',
                minWidth: '120px',
                padding: '0 24px',
                borderRadius: '14px',
                background: '#efd6f4',
                color: '#cfafd7',
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

          <div className="flex-1" />

          <div className="pb-2">
            <AnimatePresence mode="wait">
              {activeTab === 'post' && (
                <motion.div
                  key="post-actions"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4 flex flex-col items-center gap-3"
                >
                  <button
                    type="button"
                    style={{
                      height: '40px',
                      minWidth: '180px',
                      padding: '0 24px',
                      borderRadius: '12px',
                      background: '#e1e1e1',
                      color: '#111111',
                      fontSize: '16px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                    }}
                  >
                    我的手機相簿
                  </button>

                  <button
                    type="button"
                    style={{
                      height: '40px',
                      minWidth: '180px',
                      padding: '0 24px',
                      borderRadius: '12px',
                      background: '#e1e1e1',
                      color: '#111111',
                      fontSize: '16px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                    }}
                  >
                    打開相機
                  </button>
                </motion.div>
              )}

              {activeTab === 'video' && (
                <motion.div
                  key="video-actions"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4 flex flex-col items-center gap-3"
                >
                  <button
                    type="button"
                    style={{
                      height: '40px',
                      minWidth: '180px',
                      padding: '0 24px',
                      borderRadius: '12px',
                      background: '#e1e1e1',
                      color: '#111111',
                      fontSize: '16px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                    }}
                  >
                    選擇短影片
                  </button>

                  <button
                    type="button"
                    style={{
                      height: '40px',
                      minWidth: '180px',
                      padding: '0 24px',
                      borderRadius: '12px',
                      background: '#e1e1e1',
                      color: '#111111',
                      fontSize: '16px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                    }}
                  >
                    立即錄影
                  </button>
                </motion.div>
              )}

              {activeTab === 'album' && (
                <motion.div
                  key="album-actions"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4 flex flex-col items-center gap-3"
                >
                  <button
                    type="button"
                    style={{
                      height: '40px',
                      minWidth: '180px',
                      padding: '0 24px',
                      borderRadius: '12px',
                      background: '#e1e1e1',
                      color: '#111111',
                      fontSize: '16px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                    }}
                  >
                    選擇配對牆相片
                  </button>

                  <button
                    type="button"
                    style={{
                      height: '40px',
                      minWidth: '180px',
                      padding: '0 24px',
                      borderRadius: '12px',
                      background: '#e1e1e1',
                      color: '#111111',
                      fontSize: '16px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                    }}
                  >
                    打開相機
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div
  className="relative grid grid-cols-3 rounded-[18px] bg-[#dddddd] p-[4px]"
>
  <motion.div
    className="absolute top-[4px] bottom-[4px] rounded-[14px] bg-[#f0f0f0]"
    animate={{
      left:
        activeTab === 'video'
          ? '4px'
          : activeTab === 'post'
          ? 'calc(33.333% + 1.5px)'
          : 'calc(66.666% - 1px)',
      width: 'calc(33.333% - 2.7px)',
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

  <button
    type="button"
    onClick={() => setActiveTab('album')}
    className="relative z-[2] h-[48px] rounded-[14px] border-none bg-transparent text-[15px] font-medium"
    style={{
      color: activeTab === 'album' ? '#111111' : '#666666',
    }}
  >
    配對牆相片
  </button>
</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}