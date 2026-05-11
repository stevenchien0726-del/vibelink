'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type CreatePostBoxRef = {
  submitPost: () => Promise<void>
}

export type CreatedPostPayload = {
  id: string
  caption: string
  imageUrl: string
  imageUrls: string[]
}

type CreatePostBoxProps = {
  onSuccess?: (post: CreatedPostPayload) => void
  onReadyChange?: (ready: boolean) => void
}

const CreatePostBox = forwardRef<CreatePostBoxRef, CreatePostBoxProps>(
  function CreatePostBox({ onSuccess, onReadyChange }, ref) {
    const [caption, setCaption] = useState('')
    const [files, setFiles] = useState<File[]>([])
    const [previewUrls, setPreviewUrls] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
      if (files.length === 0) {
        setPreviewUrls([])
        return
      }

      const objectUrls = files.map((file) => URL.createObjectURL(file))
      setPreviewUrls(objectUrls)

      return () => {
        objectUrls.forEach((url) => URL.revokeObjectURL(url))
      }
    }, [files])

    useEffect(() => {
  onReadyChange?.(files.length > 0)
}, [files])

    async function submitPost() {
      if (loading) return

      if (files.length === 0) {
        alert('請先選擇圖片')
        return
      }

      if (files.length > 10) {
        alert('一次最多只能上傳 10 張圖片')
        return
      }

      setLoading(true)

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          alert('請先登入')
          return
        }

        const uploadedImageUrls: string[] = []

        for (const file of files) {
          const fileExt = file.name.split('.').pop() || 'png'
          const safeFileName = `${crypto.randomUUID()}.${fileExt}`
          const filePath = `${user.id}/${Date.now()}-${safeFileName}`

          const { error: uploadError } = await supabase.storage
            .from('post-images')
            .upload(filePath, file)

          if (uploadError) {
            console.error(uploadError)
            alert('圖片上傳失敗')
            return
          }

          const { data: publicUrlData } = supabase.storage
            .from('post-images')
            .getPublicUrl(filePath)

          uploadedImageUrls.push(publicUrlData.publicUrl)
        }

        const { data: postData, error: postError } = await supabase
          .from('posts')
          .insert({
            user_id: user.id,
            caption,
          })
          .select()
          .single()

        if (postError || !postData) {
          console.error(postError)
          alert('建立貼文失敗')
          return
        }

        const imageRows = uploadedImageUrls.map((imageUrl) => ({
          post_id: postData.id,
          image_url: imageUrl,
        }))

        const { error: imageError } = await supabase
          .from('post_images')
          .insert(imageRows)

        if (imageError) {
          console.error(imageError)
          alert('圖片資料寫入失敗')
          return
        }

        const createdPost: CreatedPostPayload = {
          id: postData.id,
          caption,
          imageUrl: uploadedImageUrls[0],
          imageUrls: uploadedImageUrls,
        }

console.log(
  '🟣 analyze trigger:',
  postData.id,
  uploadedImageUrls
)

        fetch('/api/ai-radar/analyze-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    postId: postData.id,
    imageUrl: uploadedImageUrls[0],
  }),
})
  .then(async (res) => {
    const data = await res.json()

    console.log(
      '🟢 AI image analyze success:',
      data
    )
  })
  .catch((error) => {
    console.error(
      '🔴 AI image analyze failed:',
      error
    )
  })

        setCaption('')
        setFiles([])
        onSuccess?.(createdPost)
      } finally {
        setLoading(false)
      }
    }

    useImperativeHandle(ref, () => ({
      submitPost,
    }))

    return (
      <div className="w-full rounded-2xl bg-white p-4 shadow-sm">
        {previewUrls.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {previewUrls.map((url, index) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-2xl bg-[#eeeeee]"
              >
                <img
                  src={url}
                  alt={`預覽圖片 ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => {
                    setFiles((prev) => prev.filter((_, i) => i !== index))
                  }}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-[16px] text-white"
                >
                  ×
                </button>

                <div className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-[2px] text-[11px] text-white">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="寫點什麼..."
          className="mb-3 h-28 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none"
        />

        <label className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-[#eeeeee] text-[15px] font-medium text-[#222] active:scale-[0.98]">
          上傳相片（1–10張）
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const selectedFiles = Array.from(e.target.files ?? []).slice(0, 10)
              setFiles(selectedFiles)
            }}
            className="hidden"
          />
        </label>

        {files.length > 0 && (
          <p className="mt-2 text-center text-xs text-[#777]">
            已選擇 {files.length} / 10 張
          </p>
        )}

        {loading && (
          <p className="mt-3 text-center text-sm text-[#777]">發文中...</p>
        )}
      </div>
    )
  }
)

export default CreatePostBox