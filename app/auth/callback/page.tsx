'use client'

import { useEffect, useState } from 'react'

import { completeSupabaseAuthFromUrl } from '@/lib/authCallback'

export default function AuthCallbackPage() {
  const [message, setMessage] = useState('Completing login...')

  useEffect(() => {
    async function completeLogin() {
      try {
        await completeSupabaseAuthFromUrl(window.location.href)
        window.history.replaceState(null, '', '/')
        window.location.replace('/')
      } catch (error) {
        console.error('Supabase web auth callback failed:', error)
        setMessage('Login failed. Please try again.')
      }
    }

    void completeLogin()
  }, [])

  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-6 text-center text-black">
      <p className="text-[16px] font-medium">{message}</p>
    </main>
  )
}
