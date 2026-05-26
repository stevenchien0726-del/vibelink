'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function EmailOtpLogin() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSendOtp() {
    const safeEmail = email.trim()

    if (!safeEmail) return

    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email: safeEmail,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    setLoading(false)

    if (error) {
      console.error('Email OTP failed:', error)
      alert(`登入信寄送失敗：${error.message}`)
      return
    }

    setSent(true)
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="
            h-[54px]
            w-full
            rounded-full
            border
            border-[var(--app-card-border)]
            bg-[var(--app-surface)]
            px-5
            text-[16px]
            text-[var(--app-text)]
            outline-none
          "
        />

        <button
          type="button"
          disabled={loading}
          onClick={handleSendOtp}
          className="
            flex
            h-[54px]
            w-full
            items-center
            justify-center
            rounded-full
            bg-[#c86cff]
            text-[16px]
            font-medium
            text-white
            active:scale-[0.98]
            disabled:opacity-60
          "
        >
          {loading ? 'Sending...' : sent ? 'Email Sent' : 'Continue with Email'}
        </button>
      </div>
    </div>
  )
}