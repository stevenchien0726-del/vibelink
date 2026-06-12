import { supabase } from '@/lib/supabase'

function readAuthParams(callbackUrl: string) {
  const url = new URL(callbackUrl)
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))

  return {
    code: url.searchParams.get('code') ?? hashParams.get('code'),
    accessToken:
      url.searchParams.get('access_token') ?? hashParams.get('access_token'),
    refreshToken:
      url.searchParams.get('refresh_token') ?? hashParams.get('refresh_token'),
  }
}

export async function completeSupabaseAuthFromUrl(callbackUrl: string) {
  const { code, accessToken, refreshToken } = readAuthParams(callbackUrl)

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) throw error

    return true
  }

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (error) throw error

    return true
  }

  return false
}
