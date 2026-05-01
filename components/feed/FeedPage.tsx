'use client'

import { useEffect, useState } from 'react'
import { Heart, MessageCircle, Send, Bookmark, Copy } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeedPosts()
  }, [])

  async function loadFeedPosts() {
    setLoading(true)

    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        caption,
        created_at,
        user_id,
        post_images (
          image_url
        ),
        profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) {
      console.error('讀取 Feed 失敗:', error)
      setLoading(false)
      return
    }

    const visiblePosts = (data ?? []).filter(
      (post) => post.post_images?.length > 0
    )

    setPosts(visiblePosts)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#999]">
        Feed 載入中...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] pb-[110px]">
      <div className="mx-auto w-full max-w-[430px] px-3 pt-5">
        <div className="mb-5 text-[24px] font-semibold text-[#111]">
          Vibelink
        </div>

        <div className="flex flex-col gap-6">
          {posts.map((post) => {
            const firstImage = post.post_images?.[0]?.image_url
            const isMultiImage = post.post_images?.length > 1

            return (
              <div
                key={post.id}
                className="overflow-hidden rounded-[22px] bg-white shadow-sm"
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="h-[38px] w-[38px] overflow-hidden rounded-full bg-[#d9d9d9]">
                    {post.profiles?.avatar_url && (
                      <img
                        src={post.profiles.avatar_url}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div>
                    <div className="text-[15px] font-medium text-[#111]">
                      {post.profiles?.display_name ||
                        post.profiles?.username ||
                        'Vibelink User'}
                    </div>
                    <div className="text-[12px] text-[#777]">
                      @{post.profiles?.username || 'user'}
                    </div>
                  </div>
                </div>

                <div className="relative bg-[#ddd]">
                  {firstImage && (
                    <img
                      src={firstImage}
                      className="w-full object-cover"
                    />
                  )}

                  {isMultiImage && (
                    <div className="absolute right-3 top-3 flex h-[28px] w-[28px] items-center justify-center rounded-full bg-black/45 text-white">
                      <Copy size={16} strokeWidth={2.3} />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-5">
                    <button className="active:scale-90">
                      <Heart size={25} />
                    </button>
                    <button className="active:scale-90">
                      <MessageCircle size={25} />
                    </button>
                  </div>

                  <div className="flex items-center gap-5">
                    <button className="active:scale-90">
                      <Send size={24} />
                    </button>
                    <button className="active:scale-90">
                      <Bookmark size={25} />
                    </button>
                  </div>
                </div>

                {post.caption && (
                  <div className="px-4 pb-4 text-[15px] text-[#222]">
                    {post.caption}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}page.tsx