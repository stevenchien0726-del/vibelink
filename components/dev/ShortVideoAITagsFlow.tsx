'use client'

import { useState } from 'react'

export default function ShortVideoAITagsFlow() {
  const [videoUrl, setVideoUrl] = useState('')
  const [frames, setFrames] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
const [caption, setCaption] = useState('')
const [videoId, setVideoId] = useState('')

const [analyzing, setAnalyzing] = useState(false)

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

  async function handleAnalyze() {
  if (frames.length === 0) return

  setAnalyzing(true)

  try {
    const response = await fetch('/api/short-video-ai-tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
  frames,
  videoId: videoId || null,
}),
    })

    const data = await response.json()

    if (!data?.ok) {
      throw new Error(data?.error || 'Analyze failed')
    }

    setTags(data.tags ?? [])
setCaption(data.caption ?? '')
  } catch (error) {
    console.error('分析短影片 tags 失敗:', error)
    alert('分析失敗，請再試一次')
  } finally {
    setAnalyzing(false)
  }
}

  return (
    <main className="min-h-screen bg-[#f3f3f3] px-6 py-10">
      <div className="mx-auto max-w-[620px]">
        <h1 className="mb-8 text-[44px] font-black text-[#222]">
          短影片 AI Tags
        </h1>

        <div className="rounded-[28px] bg-white p-6 shadow-sm">
          <div className="mb-3 text-[17px] font-semibold">
            Upload Video
          </div>

          <input
  value={videoId}
  onChange={(e) => setVideoId(e.target.value)}
  placeholder="貼上 short_videos.id，可留空"
  className="mb-4 h-[52px] w-full rounded-[18px] border border-[#ddd] bg-[#fafafa] px-4 outline-none"
/>

          <input
  type="file"
  accept="video/*"
  onChange={async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const extracted = await extractFramesFromVideo(file)
    setFrames(extracted)
  }}
  className="mb-4 block w-full rounded-[18px] border border-[#ddd] bg-[#fafafa] px-4 py-4"
/>

        </div>

        {frames.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 text-[22px] font-bold">
              Keyframes
            </div>

            {caption && (
  <div className="mb-4 rounded-[18px] bg-[#f7f0ff] px-4 py-3 text-[15px] leading-relaxed text-[#555]">
    {caption}
  </div>
)}

            <div className="grid grid-cols-3 gap-3">
              {frames.map((frame) => (
                <img
                  key={frame}
                  src={frame}
                  className="aspect-[9/16] rounded-[18px] object-cover"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              className="mt-6 rounded-full bg-black px-5 py-3 text-white"
            >
              {analyzing
                ? 'AI 分析中...'
                : '開始 Vision Analysis'}
            </button>
          </div>
        )}

        {tags.length > 0 && (
          <div className="mt-10 rounded-[28px] bg-white p-6 shadow-sm">
            <div className="mb-4 text-[22px] font-bold">
              AI Vibe Tags
            </div>

            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="rounded-full bg-[#ead5ff] px-4 py-2 font-medium text-[#7b2cbf]"
                >
                  #{tag}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}