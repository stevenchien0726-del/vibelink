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
      uploadFailed: (message: string) =>
        uiText(`短影片上傳失敗：${message}`, `Short video upload failed: ${message}`),
      thumbnailFailed: uiText('縮圖產生失敗', 'Failed to generate thumbnail'),
      databaseFailed: (message: string) =>
        uiText(`資料庫寫入失敗：${message}`, `Database write failed: ${message}`),
      noVideo: uiText('尚未選擇短影片', 'No short video selected'),
      selectVideo: uiText('選擇短影片', 'Select Short Video'),
      captionPlaceholder: uiText('寫點內容...', 'Write something...'),
      aiAnalyzing: uiText('AI 分析中...', 'AI analyzing...'),
      uploading: uiText('影片上傳中...', 'Uploading video...'),
    }

    useEffect(() => {
      onReadyChange?.(!!file && !uploading)
    }, [file, uploading, onReadyChange])

    useEffect(() => {
      return () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
      }
    }, [previewUrl])

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
      video.muted = true
      video.playsInline = true
      video.src = url

      video.onloadedmetadata = () => {
        if (video.duration > MAX_DURATION) {
          alert(text.maxDuration)
          URL.revokeObjectURL(url)
          setFile(null)
          setPreviewUrl('')
          onReadyChange?.(false)
          return
        }

        if (previewUrl) URL.revokeObjectURL(previewUrl)

        setFile(selected)
        setPreviewUrl(url)
        onReadyChange?.(true)
      }

      video.onerror = () => {
        URL.revokeObjectURL(url)
        alert(text.selectVideoFile)
      }
    }

    async function createVideoThumbnail(file: File): Promise<Blob> {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video')
        const canvas = document.createElement('canvas')
        const url = URL.createObjectURL(file)

        video.src = url
        video.muted = true
        video.playsInline = true
        video.preload = 'metadata'

        video.onloadedmetadata = () => {
          video.currentTime = Math.min(1, video.duration || 1)
        }

        video.onseeked = () => {
          canvas.width = video.videoWidth || 720
          canvas.height = video.videoHeight || 1280

          const ctx = canvas.getContext('2d')

          if (!ctx) {
            URL.revokeObjectURL(url)
            reject(new Error('Canvas context not available'))
            return
          }

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url)

              if (!blob) {
                reject(new Error('Failed to create thumbnail'))
                return
              }

              resolve(blob)
            },
            'image/jpeg',
            0.82
          )
        }

        video.onerror = () => {
          URL.revokeObjectURL(url)
          reject(new Error('Failed to load video for thumbnail'))
        }
      })
    }

    async function extractFramesFromVideo(file: File) {
      const video = document.createElement('video')
      const url = URL.createObjectURL(file)

      video.src = url
      video.muted = true
      video.playsInline = true
      video.preload = 'metadata'

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve()
        video.onerror = () => reject(new Error('Failed to load video metadata'))
      })

      const duration = video.duration || 1
      const times = [duration * 0.2, duration * 0.5, duration * 0.8]

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        return []
      }

      const results: string[] = []

      for (const time of times) {
        video.currentTime = time

        await new Promise<void>((resolve) => {
          video.onseeked = () => resolve()
        })

        canvas.width = video.videoWidth || 720
        canvas.height = video.videoHeight || 1280
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        results.push(canvas.toDataURL('image/jpeg', 0.82))
      }

      URL.revokeObjectURL(url)

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

      try {
        const ext = file.name.split('.').pop() || 'mp4'
        const videoFileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`

        const thumbnailBlob = await createVideoThumbnail(file)
        const thumbnailFileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}-thumbnail.jpg`

        const { error: thumbnailUploadError } = await supabase.storage
          .from('short-video-thumbnails')
          .upload(thumbnailFileName, thumbnailBlob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
          })

        if (thumbnailUploadError) throw thumbnailUploadError

        const { data: thumbnailPublicUrlData } = supabase.storage
          .from('short-video-thumbnails')
          .getPublicUrl(thumbnailFileName)

        const thumbnailUrl = thumbnailPublicUrlData.publicUrl

        const { error: uploadError } = await supabase.storage
          .from('short-videos')
          .upload(videoFileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          })

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('short-videos')
          .getPublicUrl(videoFileName)

        const videoUrl = publicUrlData.publicUrl

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

        if (insertError) throw insertError

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
      } catch (error: any) {
        console.error('短影片上傳流程失敗:', error)
        alert(text.uploadFailed(error?.message || 'Unknown error'))
        setUploading(false)
        onReadyChange?.(true)
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