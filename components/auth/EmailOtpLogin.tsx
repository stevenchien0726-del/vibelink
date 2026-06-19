'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { uiText } from '@/lib/uiText'
import { getAuthCallbackUrl } from '@/lib/authRedirect'

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
        emailRedirectTo: getAuthCallbackUrl(),
      },
    })

    setLoading(false)

    if (error) {
      console.error('Email OTP failed:', error)
      alert(uiText(`登入信寄送失敗：${error.message}`, `Login email failed: ${error.message}`))
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
    <div className="w-full text-black dark:text-white">
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
            border-black/10
            bg-white
            px-5
            text-[16px]
            text-black
            placeholder:text-black/45
            outline-none
            shadow-[0_4px_14px_rgba(0,0,0,0.06)]
            dark:border-white/15
            dark:bg-white/10
            dark:text-white
            dark:placeholder:text-white/60
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
            border
            border-black/10
            bg-white
            text-[16px]
            font-medium
            text-black
            shadow-[0_6px_18px_rgba(0,0,0,0.08)]
            transition-all
            active:scale-[0.98]
            disabled:opacity-100
            dark:border-white/15
            dark:bg-white/10
            dark:text-white
          "
        >
          {loading
            ? uiText('寄送中...', 'Sending...')
            : cooldown > 0
            ? uiText(`請查看您的 Gmail｜${cooldown}s 後可重寄`, `Check your Gmail | resend in ${cooldown}s`)
            : sent
            ? uiText('請查看您的 Gmail', 'Check your Gmail')
            : 'Continue with Gmail'}
        </button>
      </div>
    </div>
  )
}
