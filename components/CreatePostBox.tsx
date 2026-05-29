'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { uiText } from '@/lib/uiText'

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.readAsDataURL(file)

    reader.onload = () => {
      const img = new Image()

      img.src = reader.result as string

      img.onload = () => {
        const canvas = document.createElement('canvas')

        const MAX_WIDTH = 1600
        const scale = Math.min(
          1,
          MAX_WIDTH / img.width
        )

        canvas.width = img.width * scale
        canvas.height = img.height * scale

        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('canvas error'))
          return
        }

        ctx.drawImage(
          img,
          0,
          0,
          canvas.width,
          canvas.height
        )

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('compress failed'))
              return
            }

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.\w+$/, '.jpg'),
              {
                type: 'image/jpeg',
              }
            )

            resolve(compressedFile)
          },
          'image/jpeg',
          0.82
        )
      }

      img.onerror = reject
    }

    reader.onerror = reject
  })
}

export type CreatePostBoxRef = {
  submitPost: () => Promise<void>
}

export type CreatedPostPayload = {
  id: string
  user_id: string

  author: string

  caption: string

  imageUrl: string
  imageUrls: string[]

  likes: number

  aiTags: string[]

  type: 'post'

  isMine: boolean
  isLiked: boolean
  isSaved: boolean
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

    const [uploadStatus, setUploadStatus] = useState('')
    const text = {
      selectImage: uiText('請先選擇圖片', 'Please select images first'),
      maxImages: uiText('一次最多只能上傳 10 張圖片', 'You can upload up to 10 images at once'),
      preparing: uiText('準備上傳中...', 'Preparing upload...'),
      loginFirst: uiText('請先登入', 'Please log in first'),
      imageTooLarge: uiText('單張圖片不能超過 12MB', 'Each image must be under 12MB'),
      uploadingImage: (index: number, total: number) =>
        uiText(`正在上傳第 ${index} / ${total} 張圖片...`, `Uploading image ${index} / ${total}...`),
      creatingPost: uiText('正在建立貼文...', 'Creating post...'),
      createPostFailed: uiText('建立貼文失敗', 'Failed to create post'),
      writingImages: uiText('正在寫入圖片資料...', 'Writing image data...'),
      postFailed: uiText('發文失敗，請檢查網路或圖片大小後再試一次。', 'Post failed. Please check your connection or image size and try again.'),
      previewAlt: (index: number) => uiText(`預覽圖片 ${index}`, `Preview image ${index}`),
      captionPlaceholder: uiText('寫點什麼...', 'Write something...'),
      uploadPhotos: uiText('上傳相片（1–10張）', 'Upload Photos (1-10)'),
      selectedCount: (count: number) => uiText(`已選擇 ${count} / 10 張`, `${count} / 10 selected`),
      posting: uiText('發文中...', 'Posting...'),
    }

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
  onReadyChange?.(files.length > 0 && !loading)
}, [files, loading, onReadyChange])

    async function submitPost() {
      if (loading) return

      if (files.length === 0) {
        alert(text.selectImage)
        return
      }

      if (files.length > 10) {
        alert(text.maxImages)
        return
      }

      setLoading(true)
      onReadyChange?.(false)
      setUploadStatus(text.preparing)

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          alert(text.loginFirst)
          return
        }

        const uploadedImageUrls = await Promise.all(
  files.map(async (rawFile, index) => {
    if (rawFile.size > 12 * 1024 * 1024) {
  throw new Error(text.imageTooLarge)
}

let file = rawFile

try {
  file = await compressImage(rawFile)
} catch (error) {
  console.warn('圖片壓縮失敗，改用原圖上傳:', error)
}

    const fileExt = file.type === 'image/jpeg'
  ? 'jpg'
  : file.name.split('.').pop() || 'jpg'

    const safeFileName =
      `${crypto.randomUUID()}.${fileExt}`

    const filePath =
      `${user.id}/${Date.now()}-${safeFileName}`

      setUploadStatus(text.uploadingImage(index + 1, files.length))
    const uploadResult = await Promise.race([
  supabase.storage
    .from('post-images')
    .upload(filePath, file),

  new Promise<never>((_, reject) => {
    window.setTimeout(() => {
      reject(new Error('upload timeout'))
    }, 12000)
  }),
])

if (uploadResult.error) {
  throw uploadResult.error
}

    const { data: publicUrlData } =
      supabase.storage
        .from('post-images')
        .getPublicUrl(filePath)

    return publicUrlData.publicUrl
  })
)

setUploadStatus(text.creatingPost)
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
  throw postError || new Error(text.createPostFailed)
}

        const imageRows = uploadedImageUrls.map((imageUrl) => ({
          post_id: postData.id,
          image_url: imageUrl,
        }))

        setUploadStatus(text.writingImages)
        const { error: imageError } = await supabase
          .from('post_images')
          .insert(imageRows)

        if (imageError) {
  console.error(imageError)
  throw imageError
}

        const createdPost: CreatedPostPayload = {
  id: postData.id,

  user_id: user.id,

  author: 'You',

  caption,

  imageUrl: uploadedImageUrls[0],
  imageUrls: uploadedImageUrls,

  likes: 0,

  aiTags: [],

  type: 'post',

  isMine: true,
  isLiked: false,
  isSaved: false,
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
      } catch (error) {
        console.error('發文失敗:', error)
        alert(text.postFailed)
      } finally {
      setLoading(false)
setUploadStatus('')
onReadyChange?.(false)
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
                  alt={text.previewAlt(index + 1)}
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
          placeholder={text.captionPlaceholder}
          className="mb-3 h-28 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none"
        />

        <label className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-[#eeeeee] text-[15px] font-medium text-[#222] active:scale-[0.98]">
          {text.uploadPhotos}
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
            {text.selectedCount(files.length)}
          </p>
        )}

        {loading && (
  <p className="mt-3 text-center text-sm text-[#777]">
    {uploadStatus || text.posting}
  </p>
)}
      </div>
    )
  }
)

export default CreatePostBox
