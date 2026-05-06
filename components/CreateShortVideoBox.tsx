'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
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
    const videoRef = useRef<HTMLVideoElement | null>(null)

    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [caption, setCaption] = useState('')
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
      onReadyChange?.(!!file && !uploading)
    }, [file, uploading, onReadyChange])

    function handleSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
      const selected = e.target.files?.[0]
      if (!selected) return

      if (!selected.type.startsWith('video/')) {
        alert('請選擇影片檔')
        return
      }

      const url = URL.createObjectURL(selected)

      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = url

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)

        if (video.duration > MAX_DURATION) {
          alert('短影片不能超過 3 分鐘')
          setFile(null)
          setPreviewUrl('')
          onReadyChange?.(false)
          return
        }

        setFile(selected)
        setPreviewUrl(url)
        onReadyChange?.(true)
      }
    }

    async function submitVideo() {
      if (!file || uploading) return

      setUploading(true)
      onReadyChange?.(false)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('取得使用者失敗:', userError)
        alert('請先登入')
        setUploading(false)
        onReadyChange?.(true)
        return
      }

      const ext = file.name.split('.').pop() || 'mp4'
      const fileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('short-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })

      if (uploadError) {
        console.error('短影片上傳 Storage 失敗:', uploadError)
        alert(`短影片上傳失敗：${uploadError.message}`)
        setUploading(false)
        onReadyChange?.(true)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('short-videos')
        .getPublicUrl(fileName)

      const videoUrl = publicUrlData.publicUrl

      const { error: insertError } = await supabase.from('short_videos').insert({
        user_id: user.id,
        caption: caption.trim(),
        video_url: videoUrl,
      })

      if (insertError) {
        console.error('寫入 short_videos 失敗:', insertError)
        alert(`資料庫寫入失敗：${insertError.message}`)
        setUploading(false)
        onReadyChange?.(true)
        return
      }

      setUploading(false)
      onReadyChange?.(false)
      onSuccess?.()
    }

    useImperativeHandle(ref, () => ({
      submitVideo,
    }))

    return (
      <div className="flex flex-col items-center gap-6">
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleSelectFile}
        />

        {previewUrl ? (
          <video
            ref={videoRef}
            src={previewUrl}
            controls
            playsInline
            className="h-[360px] w-full max-w-[280px] rounded-[20px] bg-black object-cover"
          />
        ) : (
          <div className="flex h-[360px] w-full max-w-[280px] items-center justify-center rounded-[20px] bg-black text-white/70">
            尚未選擇短影片
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="h-[54px] w-full rounded-[18px] bg-[#eeeeee] text-[17px] font-medium text-[#111] shadow-sm active:scale-[0.98]"
        >
          選擇短影片
        </button>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="寫點內容..."
          className="min-h-[110px] w-full resize-none rounded-[18px] border border-[#e2e2e2] bg-white px-4 py-3 text-[15px] outline-none"
        />

        {uploading && (
          <div className="text-[14px] text-[#777]">
            影片上傳中...
          </div>
        )}
      </div>
    )
  }
)

export default CreateShortVideoBox