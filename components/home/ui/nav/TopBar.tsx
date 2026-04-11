'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import UploadPanel from '../action/UploadPanel'
import PeopleLibraryPage from '@/components/home/sections/people/PeopleLibraryPage'

export default function TopBar() {
  const [showUpload, setShowUpload] = useState(false)
  const [isPeopleLibraryOpen, setIsPeopleLibraryOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowUpload(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <div className="fixed top-0 left-1/2 z-[100] w-full max-w-[430px] -translate-x-1/2 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPeopleLibraryOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eed9f4] text-[18px] leading-none"
            >
              ☰
            </button>

            <div className="relative" ref={wrapperRef}>
              <button
                type="button"
                onClick={() => setShowUpload((prev) => !prev)}
                className="text-[28px] leading-none"
              >
                +
              </button>

              {showUpload && (
                <div className="absolute left-0 top-full z-[120] mt-3">
                  <UploadPanel />
                </div>
              )}
            </div>
          </div>

          <div className="text-[18px] font-medium text-[#c86cff]">
            Vibelink˅
          </div>

          <button type="button" className="text-[22px] leading-none">
            ⌕
          </button>
        </div>
      </div>


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