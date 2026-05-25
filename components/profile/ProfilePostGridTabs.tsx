'use client'

import { Copy, Pin } from 'lucide-react'

type Props = {
  activeTab: number
  text: any

  gridItems: any[]
  myShortVideos: any[]
  savedPosts: any[]
  archivedShortVideos: any[]

  isFavoritesPublic: boolean
  onToggleFavoritesPublic: () => void

  onOpenPost: (post: any) => void
  onOpenShortVideo: (videoId: string) => void

  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void
  onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void
  onTouchEnd: () => void
}

export default function ProfilePostGridTabs({
  activeTab,
  text,
  gridItems,
  myShortVideos,
  savedPosts,
  archivedShortVideos,
  isFavoritesPublic,
  onToggleFavoritesPublic,
  onOpenPost,
  onOpenShortVideo,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: Props) {
  return (
    <div
      data-no-page-swipe="true"
      className="overflow-hidden touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex w-full transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(-${activeTab * 100}%)`,
        }}
      >
        {/* 第1頁：貼文 */}
        <div className="w-full shrink-0">
          <div className="grid grid-cols-3 gap-[2px]">
            {gridItems.map((post, index) => {
              const image = post?.post_images?.[0]?.image_url

              return (
                <button
                  type="button"
                  key={`${post.type || 'post'}-${post.id}-${index}`}
                  onClick={(e) => {
                    e.stopPropagation()

                    const isVideo = post.type === 'video' || !!post.video_url
                    const image = post?.post_images?.[0]?.image_url

                    if (isVideo) return
                    if (!image) return

                    onOpenPost(post)
                  }}
                  className="relative h-[190px] overflow-hidden bg-[#d9d9d9]"
                >
                  {image && (
                    <img
                      src={image}
                      className="h-full w-full object-cover"
                    />
                  )}

                  {post.post_images?.length > 1 && (
                    <div className="absolute right-2 top-2 flex h-[24px] w-[24px] items-center justify-center rounded-full bg-black/45 text-white">
                      <Copy size={15} strokeWidth={2.3} />
                    </div>
                  )}
                  {post.isPinned && (
  <div className="pointer-events-none absolute left-2 top-2 z-20 flex h-[24px] w-[24px] items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
    <Pin
      size={13}
      strokeWidth={2}
      className="rotate-[45deg]"
      fill="white"
    />
  </div>
)}
                </button>
              )
            })}
          </div>
        </div>

        {/* 第2頁：短影片 */}
        <div className="w-full shrink-0">
          {myShortVideos.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center text-[14px] text-[#999]">
              {text.noVideos}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[2px]">
              {myShortVideos
                .filter(
                  (video) =>
                    !archivedShortVideos.some((item) => item.id === video.id)
                )
                .map((video, index) => (
                  <button
                    type="button"
                    key={`video-${video.id}-${index}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenShortVideo(video.id)
                    }}
                    className="relative h-[190px] overflow-hidden bg-black"
                  >
                    <video
                      src={video.video_url}
                      muted
                      playsInline
                      preload="auto"
                      autoPlay
                      loop
                      className="h-full w-full object-cover bg-black"
                      onLoadedData={(e) => {
                        e.currentTarget.currentTime = 0.1
                      }}
                    />
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* 第3頁：收藏 */}
        <div className="w-full shrink-0">
          <div className="mb-3 mt-2 flex items-center justify-between">
            <span className="text-[16px] font-medium text-[#111] dark:text-white">
              {text.favorites}
            </span>

            <div className="flex items-center gap-3">
              <span
                className={`text-[14px] font-medium transition-colors ${
                  isFavoritesPublic
                    ? 'text-[#8B5CF6]'
                    : 'text-[#666] dark:text-white/45'
                }`}
              >
                {isFavoritesPublic ? text.public : text.private}
              </span>

              <button
                type="button"
                onClick={onToggleFavoritesPublic}
                className="relative flex h-[28px] w-[54px] items-center rounded-full border border-transparent transition-all duration-300 active:scale-[0.96]"
                style={{
                  backgroundColor: isFavoritesPublic ? '#dc5cf6b1' : '#d0d0d0',
                  boxShadow: isFavoritesPublic
                    ? '0 4px 12px rgba(233, 92, 246, 0.35)'
                    : '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <span
                  className={`absolute top-1/2 h-[20px] w-[20px] -translate-y-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-all duration-300 ${
                    isFavoritesPublic ? 'left-[30px]' : 'left-[4px]'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-[2px]">
            {savedPosts.map((post, index) => {
              const isVideo = post.type === 'video' || !!post.video_url
              const image = post?.post_images?.[0]?.image_url

              return (
                <button
                  type="button"
                  key={`${post.type || 'saved'}-${post.id}-${index}`}
                  onClick={(e) => {
                    e.stopPropagation()

                    if (isVideo) {
                      onOpenShortVideo(post.id)
                      return
                    }

                    if (!image) return

                    onOpenPost(post)
                  }}
                  className="relative h-[190px] overflow-hidden bg-[#d9d9d9]"
                >
                  {isVideo ? (
                    <video
                      src={post.video_url}
                      muted
                      playsInline
                      preload="auto"
                      autoPlay
                      loop
                      className="h-full w-full object-cover bg-black"
                      onLoadedData={(e) => {
                        e.currentTarget.currentTime = 0.1
                      }}
                    />
                  ) : (
                    image && (
                      <img
                        src={image}
                        className="h-full w-full object-cover"
                      />
                    )
                  )}

                  {post.post_images?.length > 1 && (
                    <div className="absolute right-2 top-2 flex h-[24px] w-[24px] items-center justify-center rounded-full bg-black/45 text-white">
                      <Copy size={15} strokeWidth={2.3} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}