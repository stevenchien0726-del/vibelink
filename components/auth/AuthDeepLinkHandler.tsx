'use client'

import { useEffect } from 'react'
import { App } from '@capacitor/app'

import { completeSupabaseAuthFromUrl } from '@/lib/authCallback'
import {
  NATIVE_AUTH_CALLBACK_URL,
  isNativeCapacitorApp,
} from '@/lib/authRedirect'

export default function AuthDeepLinkHandler() {
  useEffect(() => {
    if (!isNativeCapacitorApp()) return

    let removeListener: (() => void) | undefined

    App.addListener('appUrlOpen', ({ url }) => {
      if (!url.startsWith(NATIVE_AUTH_CALLBACK_URL)) return

      void completeSupabaseAuthFromUrl(url).catch((error) => {
        console.error('Supabase native auth callback failed:', error)
      })
    })
      .then((handle) => {
        removeListener = () => {
          void handle.remove()
        }
      })
      .catch((error) => {
        console.error('Capacitor appUrlOpen listener failed:', error)
      })

    return () => {
      removeListener?.()
    }
  }, [])

  return null
}
