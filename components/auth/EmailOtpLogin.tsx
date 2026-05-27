'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function EmailOtpLogin() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  async function handleSendOtp() {
    const safeEmail = email.trim()

    if (!safeEmail) return
if (loading || sent || cooldown > 0) return

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
setCooldown(60)

const timer = window.setInterval(() => {
  setCooldown((prev) => {
    if (prev <= 1) {
      window.clearInterval(timer)
      setSent(false)
      return 0
    }

    return prev - 1
  })
}, 1000)
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
          disabled={loading || sent || cooldown > 0}
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
          {loading
  ? '寄送中...'
  : cooldown > 0
  ? `請查看您的信箱｜${cooldown}s 後可重寄`
  : sent
  ? '請查看您的信箱'
  : 'Continue with Email'}
        </button>
      </div>
    </div>
  )
}