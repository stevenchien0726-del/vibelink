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
}

type CreatePostBoxProps = {
  onSuccess?: (post: CreatedPostPayload) => void
}

const CreatePostBox = forwardRef<CreatePostBoxRef, CreatePostBoxProps>(
  function CreatePostBox({ onSuccess }, ref) {
    const [caption, setCaption] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
      if (!file) {
        setPreviewUrl('')
        return
      }

      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      return () => {
        URL.revokeObjectURL(objectUrl)
      }
    }, [file])

    async function submitPost() {
      if (loading) return

      if (!file) {
        alert('請先選擇圖片')
        return
      }

      setLoading(true)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        alert('請先登入')
        setLoading(false)
        return
      }

      const filePath = `${user.id}/${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file)

      if (uploadError) {
        alert('圖片上傳失敗')
        console.error(uploadError)
        setLoading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath)

      const imageUrl = publicUrlData.publicUrl

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          caption,
        })
        .select()
        .single()

      if (postError || !postData) {
        alert('建立貼文失敗')
        console.error(postError)
        setLoading(false)
        return
      }

      const { error: imageError } = await supabase.from('post_images').insert({
        post_id: postData.id,
        image_url: imageUrl,
        order_index: 0,
      })

      if (imageError) {
        alert('圖片資料寫入失敗')
        console.error(imageError)
        setLoading(false)
        return
      }

      const createdPost: CreatedPostPayload = {
        id: postData.id,
        caption,
        imageUrl,
      }

      setCaption('')
      setFile(null)
      setLoading(false)
      alert('發文成功')
      onSuccess?.(createdPost)
    }

    useImperativeHandle(ref, () => ({
      submitPost,
    }))

    return (
      <div className="w-full rounded-2xl bg-white p-4 shadow-sm">
        {previewUrl && (
  <div className="relative mb-3 overflow-hidden rounded-2xl bg-[#eeeeee]">
    <img
      src={previewUrl}
      alt="預覽圖片"
      className="max-h-[360px] w-full object-cover"
    />

    <button
      type="button"
      onClick={() => setFile(null)}
      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-[18px] text-white"
    >
      ×
    </button>
  </div>
)}

<textarea
  value={caption}
  onChange={(e) => setCaption(e.target.value)}
  placeholder="寫點什麼..."
  className="mb-3 h-28 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none"
/>

<label className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-[#eeeeee] text-[15px] font-medium text-[#222] active:scale-[0.98]">
  上傳相片／影片
  <input
    type="file"
    accept="image/*,video/*"
    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
    className="hidden"
  />
</label>

        {loading && (
          <p className="mt-3 text-center text-sm text-[#777]">發文中...</p>
        )}
      </div>
    )
  }
)

export default CreatePostBox