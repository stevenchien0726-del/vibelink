'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { supabase } from '@/lib/supabase'
import { uiText } from '@/lib/uiText'

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
    const [aiAnalyzing, setAiAnalyzing] = useState(false)
    const [videoReloadKey, setVideoReloadKey] = useState(0)
    const text = {
      selectVideoFile: uiText('請選擇影片檔', 'Please select a video file'),
      maxDuration: uiText('短影片不能超過 3 分鐘', 'Short videos cannot be longer than 3 minutes'),
      loginFirst: uiText('請先登入', 'Please log in first'),
      uploadFailed: (message: string) => uiText(`短影片上傳失敗：${message}`, `Short video upload failed: ${message}`),
      thumbnailFailed: uiText('縮圖產生失敗', 'Failed to generate thumbnail'),
      databaseFailed: (message: string) => uiText(`資料庫寫入失敗：${message}`, `Database write failed: ${message}`),
      noVideo: uiText('尚未選擇短影片', 'No short video selected'),
      selectVideo: uiText('選擇短影片', 'Select Short Video'),
      captionPlaceholder: uiText('寫點內容...', 'Write something...'),
      aiAnalyzing: uiText('AI 分析中...', 'AI analyzing...'),
      uploading: uiText('影片上傳中...', 'Uploading video...'),
    }

    useEffect(() => {
      onReadyChange?.(!!file && !uploading)
    }, [file, uploading, onReadyChange])

    function handleSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
      const selected = e.target.files?.[0]
      if (!selected) return

      if (!selected.type.startsWith('video/')) {
        alert(text.selectVideoFile)
        return
      }

      const url = URL.createObjectURL(selected)

      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = url

      video.onloadedmetadata = () => {

        if (video.duration > MAX_DURATION) {
          alert(text.maxDuration)
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

async function extractFramesFromVideo(file: File) {
  const video = document.createElement('video')
  video.src = URL.createObjectURL(file)
  video.crossOrigin = 'anonymous'
  video.muted = true
  video.playsInline = true

  await new Promise<void>((resolve) => {
    video.onloadedmetadata = () => resolve()
  })

  const duration = video.duration || 1
  const times = [duration * 0.2, duration * 0.5, duration * 0.8]

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return []

  const results: string[] = []

  for (const time of times) {
    video.currentTime = time

    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve()
    })

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    results.push(canvas.toDataURL('image/jpeg', 0.82))
  }

  URL.revokeObjectURL(video.src)

  return results
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
        alert(text.loginFirst)
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
        alert(text.uploadFailed(uploadError.message))
        setUploading(false)
        onReadyChange?.(true)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('short-videos')
        .getPublicUrl(fileName)

      const videoUrl = publicUrlData.publicUrl

      // ✅ 自動產生影片縮圖
const thumbnailCanvas = document.createElement('canvas')
const thumbnailVideo = document.createElement('video')

thumbnailVideo.src = videoUrl
thumbnailVideo.crossOrigin = 'anonymous'
thumbnailVideo.muted = true
thumbnailVideo.playsInline = true

await new Promise<void>((resolve) => {
  thumbnailVideo.onloadeddata = () => resolve()
})

thumbnailVideo.currentTime = 0.1

await new Promise<void>((resolve) => {
  thumbnailVideo.onseeked = () => resolve()
})

thumbnailCanvas.width = thumbnailVideo.videoWidth
thumbnailCanvas.height = thumbnailVideo.videoHeight

const ctx = thumbnailCanvas.getContext('2d')

if (!ctx) {
  alert(text.thumbnailFailed)
  setUploading(false)
  return
}

ctx.drawImage(
  thumbnailVideo,
  0,
  0,
  thumbnailCanvas.width,
  thumbnailCanvas.height
)

const thumbnailBlob: Blob = await new Promise((resolve) => {
  thumbnailCanvas.toBlob(
    (blob) => resolve(blob as Blob),
    'image/jpeg',
    0.82
  )
})

const thumbnailFileName = `${user.id}/${Date.now()}-thumbnail.jpg`

const { error: thumbnailUploadError } = await supabase.storage
  .from('short-video-thumbnails')
  .upload(thumbnailFileName, thumbnailBlob, {
    contentType: 'image/jpeg',
    upsert: false,
  })

if (thumbnailUploadError) {
  console.error('縮圖上傳失敗:', thumbnailUploadError)
}

const { data: thumbnailPublicUrlData } = supabase.storage
  .from('short-video-thumbnails')
  .getPublicUrl(thumbnailFileName)

const thumbnailUrl =
  thumbnailPublicUrlData.publicUrl

      const { data: newVideo, error: insertError } = await supabase
  .from('short_videos')
  .insert({
  user_id: user.id,
  caption: caption.trim(),
  video_url: videoUrl,
  thumbnail_url: thumbnailUrl,
})
  .select('id')
  .single()

      if (insertError) {
        console.error('寫入 short_videos 失敗:', insertError)
        alert(text.databaseFailed(insertError.message))
        setUploading(false)
        onReadyChange?.(true)
        return
      }

      

      setUploading(false)
onReadyChange?.(false)
onSuccess?.()

if (newVideo?.id) {
  window.setTimeout(async () => {
    try {
      setAiAnalyzing(true)

      const frames = await extractFramesFromVideo(file)

      await fetch('/api/short-video-ai-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frames,
          videoId: newVideo.id,
        }),
      })
    } catch (error) {
      console.error('短影片 AI tags 分析失敗:', error)
    } finally {
      setAiAnalyzing(false)
    }
  }, 1500)
}

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
  key={videoReloadKey}
  ref={videoRef}
  src={previewUrl}
  controls
  playsInline
  preload="metadata"
  onLoadStart={() => {
    window.setTimeout(() => {
      const video = videoRef.current

      if (!video) return

      if (video.readyState < 2) {
        console.warn('手機短影片載入超時，自動重讀')
        setVideoReloadKey((prev) => prev + 1)
      }
    }, 10000)
  }}
            className="h-[360px] w-full max-w-[280px] rounded-[20px] bg-black object-cover"
          />
        ) : (
          <div className="flex h-[360px] w-full max-w-[280px] items-center justify-center rounded-[20px] bg-black text-white/70">
            {text.noVideo}
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="h-[54px] w-full rounded-[18px] bg-[#eeeeee] text-[17px] font-medium text-[#111] shadow-sm active:scale-[0.98]"
        >
          {text.selectVideo}
        </button>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={text.captionPlaceholder}
          className="min-h-[110px] w-full resize-none rounded-[18px] border border-[#e2e2e2] bg-white px-4 py-3 text-[15px] outline-none"
        />

        {(uploading || aiAnalyzing) && (
  <div className="text-[14px] text-[#777]">
    {aiAnalyzing ? text.aiAnalyzing : text.uploading}
  </div>
)}
      </div>
    )
  }
)

export default CreateShortVideoBox
