'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, Play } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { PostItem } from '@/components/home/sections/feed/FeedGrid'

type Props = {
  onClose: () => void
  onOpenPost: (post: PostItem) => void
}

export default function FollowingFeedPage({ onClose, onOpenPost }: Props) {
  const [items, setItems] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFollowingFeed() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setItems([])
        setLoading(false)
        return
      }

      const { data: followRows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followingIds =
        (followRows ?? []).map((row: any) => row.following_id)

      if (followingIds.length === 0) {
        setItems([])
        setLoading(false)
        return
      }

      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          id,
          caption,
          created_at,
          user_id,
          profiles (
            username,
            display_name
          ),
          post_images (
            image_url
          )
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })

      const { data: videoData } = await supabase
        .from('short_videos')
        .select(`
          id,
          caption,
          video_url,
          created_at,
          user_id
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })

      const postIds = (postsData ?? []).map((post: any) => post.id)
      const videoIds = (videoData ?? []).map((video: any) => video.id)

      const { data: likeRows } =
        postIds.length > 0
          ? await supabase
              .from('likes')
              .select('post_id, user_id')
              .in('post_id', postIds)
          : { data: [] }

      const { data: videoLikeRows } =
        videoIds.length > 0
          ? await supabase
              .from('short_video_likes')
              .select('short_video_id, user_id')
              .in('short_video_id', videoIds)
          : { data: [] }

      const likeCountMap = new Map<string, number>()
      const videoLikeCountMap = new Map<string, number>()

      ;(likeRows ?? []).forEach((like: any) => {
        likeCountMap.set(
          like.post_id,
          (likeCountMap.get(like.post_id) ?? 0) + 1
        )
      })

      ;(videoLikeRows ?? []).forEach((like: any) => {
        videoLikeCountMap.set(
          like.short_video_id,
          (videoLikeCountMap.get(like.short_video_id) ?? 0) + 1
        )
      })

      const photoItems: PostItem[] = (postsData ?? [])
        .map((post: any) => ({
          id: post.id,
          user_id: post.user_id,
          author:
            post.profiles?.display_name ||
            post.profiles?.username ||
            'Vibelink User',
          text: post.caption || '',
          likes: likeCountMap.get(post.id) ?? 0,
          images: (post.post_images ?? []).map((img: any) => img.image_url),
          type: 'post' as const,
          aiTags: ['追蹤中'],
          isMine: false,
        }))
        .filter((post) => post.images.length > 0)

      const videoItems: PostItem[] = (videoData ?? []).map((video: any) => ({
        id: video.id,
        user_id: video.user_id,
        author: 'Vibelink User',
        text: video.caption || '',
        likes: videoLikeCountMap.get(video.id) ?? 0,
        images: [],
        videoUrl: video.video_url,
        type: 'video' as const,
        aiTags: ['追蹤中短影音'],
        isMine: false,
      }))

      setItems([...videoItems, ...photoItems])
      setLoading(false)
    }

    loadFollowingFeed()
  }, [])

  return (
    <div className="fixed inset-0 z-[900] bg-[#f3f3f3]">
      <div className="mx-auto h-full w-full max-w-[430px] overflow-y-auto bg-white px-3 pb-[120px] pt-3">
        <div className="mb-4 flex h-[36px] items-center">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 text-[13px] text-[#111] active:scale-95"
          >
            <ChevronLeft size={16} />
            <span>追蹤中</span>
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center text-[14px] text-[#999]">
            載入追蹤中貼文...
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center text-[14px] text-[#999]">
            目前追蹤用戶還沒有貼文或短影音
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {items.map((post) => {
              const isVideo = post.type === 'video' || !!post.videoUrl
              const cover = post.images?.[0]

              return (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => onOpenPost(post)}
                  className="relative h-[280px] w-full overflow-hidden rounded-[20px] bg-[#d9d9d9] active:scale-[0.98]"
                >
                  {isVideo ? (
                    <>
                      {post.videoUrl ? (
                        <video
                          src={post.videoUrl}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <div className="h-full w-full bg-[#d9d9d9]" />
                      )}

                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <Play size={30} fill="white" color="white" />
                      </div>
                    </>
                  ) : (
                    cover && (
                      <img
                        src={cover}
                        className="h-full w-full object-cover"
                      />
                    )
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}