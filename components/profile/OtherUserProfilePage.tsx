'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Copy, Grid2x2, Image as ImageIcon, Bookmark, PlaySquare, Link as LinkIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Props = {
  userId: string
  onClose: () => void
}

const activeColor = '#d89ad0'
const inactiveColor = '#222'

export default function OtherUserProfilePage({ userId, onClose }: Props) {
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio')
        .eq('id', userId)
        .maybeSingle()

      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          id,
          caption,
          created_at,
          user_id,
          post_images (
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      setProfile(profileData)
      setPosts(postsData ?? [])
      setLoading(false)
    }

    loadProfile()
  }, [userId])

  const gridItems = posts.filter((post) => post.post_images?.length > 0)

  return (
  <motion.div
    className="fixed inset-0 z-[9999] overflow-y-auto bg-[#f3f3f3] pb-[110px]"
    initial={{ opacity: 0, scale: 0.92, y: 24 }}
    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
    exit={{ opacity: 0, scale: 0.92, y: 40 }}
    transition={{
      type: 'spring',
      stiffness: 360,
      damping: 34,
    }}
    drag
    dragDirectionLock
    dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
    dragElastic={0.22}
    onDragEnd={(_, info) => {
      const shouldClose =
        info.offset.y > 120 ||
        info.offset.x > 120 ||
        info.velocity.y > 700 ||
        info.velocity.x > 700

      if (shouldClose) {
        onClose()
      }
    }}
  >
      <div className="mx-auto w-full max-w-[430px] px-4 pt-[76px]">
        <div className="fixed left-1/2 top-0 z-[100] w-full max-w-[430px] -translate-x-1/2 bg-[#f3f3f3]/95 px-4 pt-4 pb-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="flex h-[38px] items-center gap-1 rounded-[14px] bg-[#d9d9d9] px-3 text-[13px] text-[#222] active:scale-95"
            >
              <ChevronLeft size={18} />
              <span>返回</span>
            </button>

            <div />

            <div className="w-[70px]" />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[14px] text-[#999]">
            載入對方 Profile 中...
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-start justify-between">
              <div className="flex gap-3">
                <div className="h-[58px] w-[58px] overflow-hidden rounded-full bg-[#d9d9d9]">
                  {profile?.avatar_url && (
                    <img src={profile.avatar_url} className="h-full w-full object-cover" />
                  )}
                </div>

                <div>
                  <div className="text-[18px] font-medium text-[#222]">
                    {profile?.display_name || profile?.username || 'Vibelink User'}
                  </div>
                  <div className="text-[18px] font-medium text-[#444]">
                    {profile?.username || 'user'}
                  </div>
                </div>
              </div>

              <div className="flex gap-10 pr-4">
                <div className="flex flex-col items-center">
                  <div className="text-[18px] text-[#222]">{gridItems.length}</div>
                  <div className="text-[14px] text-[#666]">貼文</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-[18px] text-[#222]">5萬</div>
                  <div className="text-[14px] text-[#666]">粉絲</div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-[16px] leading-[1.45] text-[#333]">
                {profile?.bio || ''}
              </div>
            </div>

            <div className="mb-4 flex items-center">
              <button
                type="button"
                className="inline-flex h-[32px] items-center gap-2 rounded-[18px] border-[3px] border-[#8f8f8f] bg-transparent px-6 text-[14px] text-[#8B5CF6] active:scale-95"
              >
                <LinkIcon size={16} />
                <span>LINKPORT</span>
              </button>
            </div>

            <div className="mb-4 flex w-full items-center gap-3">
              <button
                type="button"
                className="flex h-[44px] flex-1 items-center justify-center rounded-[18px] border-[1.5px] border-[#8f8f8f] bg-transparent px-3 text-[15px] text-[#222]"
              >
                追蹤
              </button>

              <button
                type="button"
                className="flex h-[44px] flex-1 items-center justify-center rounded-[18px] border-[1.5px] border-[#8f8f8f] bg-transparent px-3 text-[15px] text-[#222]"
              >
                訊息
              </button>
            </div>

            <div className="relative mb-2 border-b border-[#d9d9d9] pb-2">
              <div className="grid grid-cols-4">
                {[Grid2x2, PlaySquare, ImageIcon, Bookmark].map((Icon, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveTab(index)}
                    className="flex h-[34px] items-center justify-center"
                  >
                    <Icon
                      size={20}
                      color={activeTab === index ? activeColor : inactiveColor}
                    />
                  </button>
                ))}
              </div>

              <div
                className="pointer-events-none absolute bottom-0 h-[4px] px-2 transition-all duration-300 ease-out"
                style={{
                  left: `${activeTab * 25}%`,
                  width: '25%',
                }}
              >
                <div className="h-[4px] w-full rounded-full bg-[#d89ad0]" />
              </div>
            </div>

            <div className="overflow-hidden">
              <div
                className="flex w-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeTab * 100}%)` }}
              >
                <div className="w-full shrink-0">
                  {gridItems.length === 0 ? (
                    <div className="flex min-h-[220px] items-center justify-center text-[14px] text-[#999]">
                      目前還沒有公開貼文
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-[2px]">
                      {gridItems.map((post) => {
                        const image = post.post_images?.[0]?.image_url

                        return (
                          <button
                            key={post.id}
                            type="button"
                            className="relative h-[190px] overflow-hidden bg-[#d9d9d9]"
                          >
                            {image && (
                              <img src={image} className="h-full w-full object-cover" />
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
                  )}
                </div>

                <div className="w-full shrink-0">
                  <div className="flex min-h-[220px] items-center justify-center text-[14px] text-[#999]">
                    對方短影片功能下一步接
                  </div>
                </div>

                <div className="w-full shrink-0">
                  <div className="flex min-h-[220px] items-center justify-center text-[14px] text-[#999]">
                    精選限動功能下一步接
                  </div>
                </div>

                <div className="w-full shrink-0">
                  <div className="flex min-h-[220px] items-center justify-center text-[14px] text-[#999]">
                    對方收藏不公開
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}