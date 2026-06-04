'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from 'react'
import { loadMyFollowerCount as fetchMyFollowerCount } from '@/lib/profile/profileApi'
import { supabase } from '@/lib/supabase'

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
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('撠?餃')
      return
    }

    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (selectError) {
      console.error('霈??profile 憭望?:', selectError)
      throw selectError
    }

    if (existingProfile) {
      setProfile(existingProfile)
      return
    }

    const fallbackName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Vibelink User'

    const newProfile = {
      id: user.id,
      username: `user_${user.id.slice(0, 5)}`,
      display_name: fallbackName,
      avatar_url: user.user_metadata?.avatar_url || null,
      bio: '',
    }

    const { error: insertError } = await supabase
      .from('profiles')
      .insert(newProfile)

    if (insertError) {
      console.error('撱箇? profile 憭望?:', insertError)

      setProfile(newProfile)

      return
    }

    setProfile(newProfile)
  }

  async function loadMyFollowerCount() {
    if (followerCountLoadingRef.current) return

    followerCountLoadingRef.current = true

    try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const count = await fetchMyFollowerCount(user.id)

    setFollowerCount(count)
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
