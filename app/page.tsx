'use client'

import { useState } from 'react'
import HomePage from '@/pages/HomePage'
import AIHelperPage from '@/pages/AIHelperPage'
import MessagePage from '@/pages/MessagePage'
import ProfilePage from '@/components/message/ProfilePage'
import VibeTvPage from '@/pages/VibeTvPage'
import BottomNav from '@/components/home/ui/nav/BottomNav'

export type AppPage = 'home' | 'ai' | 'message' | 'profile' | 'tv'

export default function Page() {
  const [page, setPage] = useState<AppPage>('home')

  return (
    <main className="min-h-screen bg-[#e9e9e9]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#f3f3f3]">
        {page === 'home' && <HomePage />}
        {page === 'ai' && <AIHelperPage />}
        {page === 'message' && <MessagePage />}
        {page === 'profile' && <ProfilePage onCloseMenu={() => setPage('home')} />}
        {page === 'tv' && <VibeTvPage />}

        <BottomNav current={page} setPage={setPage} />
      </div>
    </main>
  )
}