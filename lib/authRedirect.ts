import { Capacitor } from '@capacitor/core'

export const WEB_AUTH_CALLBACK_URL =
  'https://vibelink-new.vercel.app/auth/callback'

export const NATIVE_AUTH_CALLBACK_URL = 'vibelink://auth/callback'

export function isNativeCapacitorApp() {
  return Capacitor.isNativePlatform()
}

export function getAuthCallbackUrl() {
  return isNativeCapacitorApp()
    ? NATIVE_AUTH_CALLBACK_URL
    : WEB_AUTH_CALLBACK_URL
}
