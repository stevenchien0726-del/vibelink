'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type CreateShortVideoBoxRef = {
  submitVideo: () => Promise<void>
}

type Props = {
  onReadyChange?: (ready: boolean) => void
  onSuccess?: () => void
}

const MAX_DURATION = 180

const CreateShortVideoBox = forwardRef<CreateShortVideoBoxRef, Props>(
  function CreateShortVideoBox({ onReadyChange, onSuccess }, ref) {
    const inputRef = useRef<HTMLInputElement | null>(null)

    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [caption, setCaption] = useState('')
    const [loading, setLoading] = useState(false)
    const [errorText, setErrorText] = useState('')

    useEffect(() => {
      onReadyChange?.(!!file && !loading)
    }, [file, loading, onReadyChange])

    useEffect(() => {
      if (!file) {
        setPreviewUrl('')
        return
      }

      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      return () => URL.revokeObjectURL(url)
    }, [file])

    async function checkVideoDuration(targetFile: File) {
      return new Promise<number>((resolve, reject) => {
        const video = document.createElement('video')
        video.preload = 'metadata'

        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src)
          resolve(video.duration)
        }

        video.onerror = () => {
          reject(new Error('無法讀取影片長度'))
        }

        video.src = URL.createObjectURL(targetFile)
      })
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
      const selected = e.target.files?.[0]
      if (!selected) return

      setErrorText('')

      if (!selected.type.startsWith('video/')) {
        setErrorText('只能上傳影片檔')
        setFile(null)
        return
      }

      try {
        const duration = await checkVideoDuration(selected)

        if (duration > MAX_DURATION) {
          setErrorText('短影片不能超過 3 分鐘')
          setFile(null)
          e.target.value = ''
          return
        }

        setFile(selected)
      } catch {
        setErrorText('影片讀取失敗，請換一支影片')
        setFile(null)
      }
    }

    async function submitVideo() {
  if (!file || loading) return

  setLoading(true)
  setErrorText('')

  console.log('開始上傳影片')

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log('user:', user)

  if (userError || !user) {
    console.error('user error', userError)
    setErrorText('請先登入')
    setLoading(false)
    return
  }

  const fileExt = file.name.split('.').pop()
  const filePath = `${user.id}/${Date.now()}.${fileExt}`

  console.log('upload path:', filePath)

  const { error: uploadError } = await supabase.storage
    .from('short-videos')
    .upload(filePath, file)

  if (uploadError) {
    console.error('upload error:', uploadError)
    setErrorText('影片上傳失敗')
    setLoading(false)
    return
  }

  console.log('upload success')

  const { data: publicUrlData } = supabase.storage
    .from('short-videos')
    .getPublicUrl(filePath)

  console.log('public url:', publicUrlData)

const publicUrl = publicUrlData.publicUrl

const { error: insertError } = await supabase.from('posts').insert({
  user_id: user.id,
  caption,
  video_url: publicUrl,
  post_type: 'video',
})

  if (insertError) {
    console.error('insert error:', insertError)
    setErrorText('資料寫入失敗')
    setLoading(false)
    return
  }

  console.log('insert success')

  setLoading(false)
  setFile(null)
  setCaption('')
  onSuccess?.()
}

    useImperativeHandle(ref, () => ({
      submitVideo,
    }))

    return (
      <div className="flex flex-col items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileChange}
        />


        {previewUrl && (
          <video
            src={previewUrl}
            controls
            playsInline
            className="max-h-[360px] w-full rounded-[18px] bg-black object-contain"
          />
        )}

        <button
  type="button"
  onClick={() => inputRef.current?.click()}
  className="flex h-[52px] w-full items-center justify-center rounded-[16px] border border-[#d6d6d6] bg-[#e3e3e3] px-6 text-[16px] font-medium text-[#111] shadow-sm active:scale-95"
>
  選擇短影片
</button>

        {file && (
          <textarea
            placeholder="寫點內容..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="mt-2 h-[84px] w-full resize-none rounded-[16px] border border-[#ddd] bg-white px-4 py-3 text-[15px] outline-none"
          />
        )}

        {errorText && (
          <div className="text-[13px] text-red-500">{errorText}</div>
        )}
      </div>
    )
  }
)

export default CreateShortVideoBox