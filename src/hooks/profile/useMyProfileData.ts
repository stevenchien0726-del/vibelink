'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from 'react'
import { loadMyFollowerCount as fetchMyFollowerCount } from '@/lib/profile/profileApi'
import { supabase } from '@/lib/supabase'
import {
  AUTH_TIMEOUT_MS,
  SUPABASE_TIMEOUT_MS,
  logNativeLifecycle,
  withTimeout,
} from '@/lib/asyncTimeout'

type UseMyProfileDataParams = {
  setAvatarUploading: (value: boolean) => void
  setIsEditProfileOpen: (value: boolean) => void
}

export function useMyProfileData({
  setAvatarUploading,
  setIsEditProfileOpen,
}: UseMyProfileDataParams) {
  const [profile, setProfile] = useState<any>(null)
  const [followerCount, setFollowerCount] = useState(0)
  const ensureProfilePromiseRef = useRef<Promise<void> | null>(null)
  const followerCountLoadingRef = useRef(false)

  function buildFallbackProfile(user: any) {
    const fallbackName =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split('@')[0] ||
      'Vibelink User'

    return {
      id: user?.id ?? 'local-fallback-profile',
      username: user?.email?.split('@')[0] || 'vibelink',
      display_name: fallbackName,
      avatar_url: user?.user_metadata?.avatar_url || null,
      bio: '',
    }
  }

  async function ensureMyProfile() {
    if (ensureProfilePromiseRef.current) {
      return ensureProfilePromiseRef.current
    }

    ensureProfilePromiseRef.current = runEnsureMyProfile().finally(() => {
      ensureProfilePromiseRef.current = null
    })

    return ensureProfilePromiseRef.current
  }

  async function runEnsureMyProfile() {
    logNativeLifecycle('profile_load_start')

    const {
      data: { user },
      error: userError,
    } = await withTimeout(
      supabase.auth.getUser(),
      AUTH_TIMEOUT_MS,
      'profile_load_auth_user'
    )

    if (userError || !user) {
      logNativeLifecycle('profile_load_error', {
        message: userError?.message ?? 'missing auth user',
      })
      console.error('Profile auth user missing')
      return
    }

    const fallbackProfile = buildFallbackProfile(user)
    let existingProfile: any = null

    try {
      const { data, error: selectError } = await withTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(),
        SUPABASE_TIMEOUT_MS,
        'profile_load_profile'
      )

      if (selectError) throw selectError

      existingProfile = data
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logNativeLifecycle(
        message.includes('timeout')
          ? 'profile_load_timeout'
          : 'profile_load_error',
        { message }
      )
      console.error('Profile load failed:', error)
      setProfile(fallbackProfile)
      return
    }

    if (existingProfile) {
      setProfile(existingProfile)
      logNativeLifecycle('profile_load_success', { source: 'profiles' })
      return
    }

    const newProfile = {
      id: user.id,
      username: `user_${user.id.slice(0, 5)}`,
      display_name: fallbackProfile.display_name,
      avatar_url: user.user_metadata?.avatar_url || null,
      bio: '',
    }

    try {
      const { error: upsertError } = await withTimeout(
        supabase
          .from('profiles')
          .upsert(newProfile, { onConflict: 'id' })
          .select('id')
          .maybeSingle(),
        SUPABASE_TIMEOUT_MS,
        'profile_load_upsert'
      )

      if (upsertError) throw upsertError
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logNativeLifecycle(
        message.includes('timeout')
          ? 'ensure_profile_timeout'
          : 'ensure_profile_error',
        { message }
      )
      console.error('Profile upsert failed:', error)
    }

    setProfile(newProfile)
    logNativeLifecycle('profile_load_success', { source: 'fallback-upsert' })
  }

  async function loadMyFollowerCount() {
    if (followerCountLoadingRef.current) return

    followerCountLoadingRef.current = true

    try {
    const {
      data: { user },
    } = await withTimeout(
      supabase.auth.getUser(),
      AUTH_TIMEOUT_MS,
      'profile_stats_auth_user'
    )

    if (!user) return

    const count = await withTimeout(
      fetchMyFollowerCount(user.id),
      SUPABASE_TIMEOUT_MS,
      'profile_stats_followers'
    )

    setFollowerCount(count)
    logNativeLifecycle('profile_load_success', { stats: 'followers' })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logNativeLifecycle(
        message.includes('timeout')
          ? 'profile_load_timeout'
          : 'profile_load_error',
        { message, stats: 'followers' }
      )
      setFollowerCount(0)
    } finally {
      followerCountLoadingRef.current = false
    }
  }

  async function uploadAvatar(file: File) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      alert('隢??餃')
      return
    }

    setAvatarUploading(true)

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
      })

    if (uploadError) {
      console.error('銝?剖?憭望?:', uploadError)
      alert('銝?剖?憭望?')
      setAvatarUploading(false)
      return
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    setProfile((prev: any) => ({
      ...prev,
      avatar_url: data.publicUrl,
    }))

    setAvatarUploading(false)
  }

  async function updateProfile() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      alert('隢??餃')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profile?.display_name || '',
        username: profile?.username || '',
        bio: profile?.bio || '',
        avatar_url: profile?.avatar_url || null,
      })
      .eq('id', user.id)

    if (error) {
      console.error('?湔 profile 憭望?:', error)
      alert('?湔憭望?')
      return
    }

    alert('?湔??')
    setIsEditProfileOpen(false)
  }

  return {
    profile,
    setProfile,
    followerCount,
    setFollowerCount,
    ensureMyProfile,
    loadMyFollowerCount,
    uploadAvatar,
    updateProfile,
  }
}
