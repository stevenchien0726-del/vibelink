'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronDown, Plus, Search } from 'lucide-react'
import UploadPanel from '../action/UploadPanel'
import PeopleLibraryPage from '@/components/home/sections/people/PeopleLibraryPage'

export default function TopBar() {
  const [showUpload, setShowUpload] = useState(false)
  const [isPeopleLibraryOpen, setIsPeopleLibraryOpen] = useState(false)
  const [isBarVisible, setIsBarVisible] = useState(true)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowUpload(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY

      if (currentScrollY <= 8) {
        setIsBarVisible(true)
        lastScrollY.current = currentScrollY
        return
      }

      const diff = currentScrollY - lastScrollY.current

      if (Math.abs(diff) < 6) return

      if (diff > 0) {
        // 往下滑：隱藏
        setIsBarVisible(false)
        setShowUpload(false)
      } else {
        // 往上滑：顯示
        setIsBarVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.div
        initial={false}
        animate={{
          y: isBarVisible ? 0 : -90,
          opacity: isBarVisible ? 1 : 0.98,
        }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="fixed top-0 left-1/2 z-[100] w-full max-w-[430px] -translate-x-1/2 bg-[#f3f3f3]/95 backdrop-blur-md"
      >
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          {/* 左側：保留原本 People Library 功能 */}
          <button
            type="button"
            onClick={() => setIsPeopleLibraryOpen(true)}
            className="flex h-10 items-center gap-1 rounded-[10px] bg-[#ebebeb] px-3 active:scale-[0.98]"
          >
            <img
              src="/logo.png"
              alt="Vibelink"
              className="h-[20px] w-[20px] object-contain"
            />
            <ChevronDown size={16} strokeWidth={2.2} className="text-black" />
          </button>

          {/* 右側：Figma 風格操作膠囊 */}
          <div className="flex items-center rounded-full bg-[#e4e4e4] px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
            <button
              type="button"
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full text-black active:scale-[0.96]"
            >
              <Search size={22} strokeWidth={2.2} />
            </button>

            <div className="mx-1 h-5 w-px bg-[#cfcfcf]" />

            <div className="relative" ref={wrapperRef}>
              <button
                type="button"
                aria-label="Upload"
                onClick={() => setShowUpload((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-black active:scale-[0.96]"
              >
                <Plus size={24} strokeWidth={2.3} />
              </button>

              {showUpload && (
                <div className="absolute right-0 top-full z-[120] mt-3">
                  <UploadPanel />
                </div>
              )}
            </div>

            <div className="mx-1 h-5 w-px bg-[#cfcfcf]" />

            {/* 先做視覺保留，不影響原本功能 */}
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full text-black active:scale-[0.96]"
            >
              <Bell size={20} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isPeopleLibraryOpen && (
          <PeopleLibraryPage
            query="People Library"
            onClose={() => setIsPeopleLibraryOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}