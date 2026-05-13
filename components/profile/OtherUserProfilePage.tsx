'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import {
  ChevronLeft,
  Copy,
  Grid2x2,
  Image as ImageIcon,
  Bookmark,
  PlaySquare,
  Link as LinkIcon,
  MoreHorizontal,
  Bell,
  Send,
  BadgeAlert,
  Ban,
  ChevronDown,
Star,
CircleX,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Props = {
  userId: string
  onClose: () => void
}

const activeColor = '#d89ad0'
const inactiveColor = '#222'

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )

export default function OtherUserProfilePage({ userId, onClose }: Props) {
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isFollowMenuOpen, setIsFollowMenuOpen] = useState(false)
  const [isUnfollowConfirmOpen, setIsUnfollowConfirmOpen] = useState(false)

  const [isFollowing, setIsFollowing] = useState(false)
const [followerCount, setFollowerCount] = useState(0)

  useEffect(() => {
    let alive = true

    async function loadProfile() {
      setLoading(true)
      setLoadError('')

      if (!userId) {
        setLoadError('找不到對方用戶 ID')
        setLoading(false)
        return
      }

      if (!isUuid(userId)) {
        setLoadError('目前這是模擬用戶，還沒有連到真實 Supabase Profile')
        setProfile(null)
        setPosts([])
        setLoading(false)
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio')
        .eq('id', userId)
        .maybeSingle()

      if (!alive) return

      if (profileError) {
        setLoadError('Profile 載入失敗')
        setProfile(null)
        setPosts([])
        setLoading(false)
        return
      }

      if (!profileData) {
        setLoadError('找不到這位用戶')
        setProfile(null)
        setPosts([])
        setLoading(false)
        return
      }

      setProfile(profileData)
      setLoading(false)

      const {
  data: { user },
} = await supabase.auth.getUser()

const { count } = await supabase
  .from('follows')
  .select('*', { count: 'exact', head: true })
  .eq('following_id', userId)

if (!alive) return

setFollowerCount(count ?? 0)

if (user) {
  const { data: followRow } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .maybeSingle()

  if (!alive) return

  setIsFollowing(!!followRow)
}

      const { data: postsData, error: postsError } = await supabase
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

      if (!alive) return

      if (postsError) {
        setPosts([])
        return
      }

      setPosts(postsData ?? [])
    }

    loadProfile()

    return () => {
      alive = false
    }
  }, [userId])

  const gridItems = posts.filter((post) => post.post_images?.length > 0)

  async function toggleFollow() {
  if (!userId || !isUuid(userId)) return

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    alert('請先登入')
    return
  }

  if (user.id === userId) return

  if (isFollowing) {
    setIsFollowing(false)
    setFollowerCount((prev) => Math.max(0, prev - 1))

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId)

    if (error) {
      console.error('取消追蹤失敗:', error)
      setIsFollowing(true)
      setFollowerCount((prev) => prev + 1)
    }

    return
  }

  setIsFollowing(true)
  setFollowerCount((prev) => prev + 1)

  const { error } = await supabase.from('follows').insert({
    follower_id: user.id,
    following_id: userId,
  })

  if (error) {
    console.error('追蹤失敗:', error)
    setIsFollowing(false)
    setFollowerCount((prev) => Math.max(0, prev - 1))
  }
}

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
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
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

            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="flex h-[38px] items-center gap-1 rounded-[14px] px-2 text-[13px] text-[#111] active:scale-95"
            >
              <MoreHorizontal size={22} strokeWidth={2.4} />
              <span>MENU</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[14px] text-[#999]">
            載入對方 Profile 中...
          </div>
        ) : loadError ? (
          <div className="py-20 text-center text-[14px] text-[#999]">
            {loadError}
          </div>
        ) : !profile ? (
          <div className="py-20 text-center text-[14px] text-[#999]">
            找不到這位用戶
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-start justify-between">
              <div className="flex gap-3">
                <div className="h-[58px] w-[58px] overflow-hidden rounded-full bg-[#d9d9d9]">
                  {profile?.avatar_url && (
                    <img
                      src={profile.avatar_url}
                      className="h-full w-full object-cover"
                    />
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
                  <div className="text-[18px] text-[#222]">
                    {gridItems.length}
                  </div>
                  <div className="text-[14px] text-[#666]">貼文</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-[18px] text-[#222]">{followerCount}</div>

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
    onClick={() => {
      if (isFollowing) {
        setIsFollowMenuOpen(true)
        return
      }

      toggleFollow()
    }}
    className="flex h-[44px] flex-1 items-center justify-center gap-2 rounded-full border border-transparent text-[15px] font-medium shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition active:scale-95"
style={{
  backgroundColor: isFollowing ? '#ececec' : '#C084FC',
  color: isFollowing ? '#111' : '#fff',
}}
  >
    <span>{isFollowing ? '追蹤中' : '追蹤'}</span>

    {isFollowing && (
      <ChevronDown size={20} strokeWidth={3} />
    )}
  </button>

  <button
    type="button"
    className="flex h-[44px] flex-1 items-center justify-center rounded-full bg-white text-[15px] font-medium text-[#111] shadow-[0_4px_14px_rgba(0,0,0,0.06)] active:scale-95"
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

            <AnimatePresence mode="wait">
        {isMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[200] bg-black/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              className="fixed bottom-0 left-1/2 z-[210] w-full max-w-[430px] -translate-x-1/2 rounded-t-[24px] bg-[#d9d9d9] px-4 pt-4 pb-8 shadow-[0_-12px_32px_rgba(0,0,0,0.12)]"
              initial={{ y: 260, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 260, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 360,
                damping: 34,
              }}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex justify-end">
                <div className="rounded-[18px] bg-[#ececec] p-1">
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex h-[42px] min-w-[112px] items-center justify-center rounded-[15px] bg-white text-[13px] text-[#111] active:scale-95"
                  >
                    CLOSE
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-[16px] bg-white">
                <button
                  type="button"
                  className="flex h-[58px] w-full items-center pr-8 text-[14px] text-[#111] active:bg-black/5"
                >
                  <div className="flex w-[54px] items-center justify-center">
                    <Bell size={23} />
                  </div>

                  <span className="ml-1">通知</span>

                  <div className="ml-auto mr-2 flex h-[20px] w-[42px] items-center justify-end rounded-full bg-[#d89ad0] px-[2px]">
                    <div className="h-[16px] w-[16px] rounded-full bg-white" />
                  </div>
                </button>

                <div className="mx-5 h-px bg-[#cfcfcf]" />

                <button
                  type="button"
                  className="flex h-[58px] w-full items-center pr-8 text-[14px] text-[#111] active:bg-black/5"
                >
                  <div className="flex w-[54px] items-center justify-center">
                    <Send size={23} />
                  </div>

                  <span className="ml-1">分享</span>
                </button>
              </div>

              <div className="mt-5 overflow-hidden rounded-[16px] bg-white">
                <button
                  type="button"
                  className="flex h-[58px] w-full items-center pr-8 text-[14px] text-[#111] active:bg-black/5"
                >
                  <div className="flex w-[54px] items-center justify-center">
                    <BadgeAlert size={23} />
                  </div>

                  <span className="ml-1">檢舉</span>
                </button>

                <div className="mx-5 h-px bg-[#cfcfcf]" />

                <button
                  type="button"
                  className="flex h-[58px] w-full items-center pr-8 text-[14px] text-[#111] active:bg-black/5"
                >
                  <div className="flex w-[54px] items-center justify-center">
                    <Ban size={23} />
                  </div>

                  <span className="ml-1">封鎖</span>
                </button>
              </div>
            </motion.div>
                    </>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isFollowMenuOpen && (
    <>
      <motion.div
        className="fixed inset-0 z-[220] bg-black/35"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => setIsFollowMenuOpen(false)}
      />

      <motion.div
        className="fixed bottom-0 left-1/2 z-[230] w-full max-w-[430px] -translate-x-1/2 rounded-t-[24px] bg-[#d9d9d9] px-4 pt-4 pb-8 shadow-[0_-12px_32px_rgba(0,0,0,0.12)]"
        initial={{ y: 230, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 230, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 360,
          damping: 34,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex justify-end">
          <div className="rounded-[18px] bg-[#ececec] p-1">
            <button
              type="button"
              onClick={() => setIsFollowMenuOpen(false)}
              className="flex h-[42px] min-w-[112px] items-center justify-center rounded-[15px] bg-white text-[13px] text-[#111] active:scale-95"
            >
              CLOSE
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[16px] bg-white">
  <button
    type="button"
    className="flex h-[58px] w-full items-center pr-5 text-[14px] text-[#111] active:bg-black/5"
  >
    <div className="flex w-[54px] items-center justify-end">
      <Star size={18} />
    </div>

    <span className="ml-5">加到最愛</span>
  </button>

  <div className="mx-5 h-px bg-[#cfcfcf]" />

  <button
    type="button"
    onClick={() => {
  setIsFollowMenuOpen(false)
  setIsUnfollowConfirmOpen(true)
}}
    className="flex h-[58px] w-full items-center pr-5 text-[14px] text-[#111] active:bg-black/5"
  >
    <div className="flex w-[54px] items-center justify-end">
      <CircleX size={18} />
    </div>

    <span className="ml-5">
      {isFollowing ? '取消追蹤' : '追蹤'}
    </span>
  </button>
</div>
      </motion.div>
    </>
  )}
            </AnimatePresence>

      <AnimatePresence>
        {isUnfollowConfirmOpen && (
    <>
      <motion.div
        className="fixed inset-0 z-[240] bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsUnfollowConfirmOpen(false)}
      />

      <motion.div
        className="fixed left-1/2 top-1/2 z-[250] w-[300px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[22px] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.22)]"
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={{
          type: 'spring',
          stiffness: 360,
          damping: 30,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-6 pb-4 text-center">
          <div className="text-[17px] font-semibold text-[#111]">
            取消追蹤？
          </div>

          <div className="mt-2 text-[14px] leading-[1.45] text-[#777]">
            確定要取消追蹤這位用戶嗎？
          </div>
        </div>

        <div className="h-px bg-[#e5e5e5]" />

        <button
          type="button"
          onClick={() => {
            toggleFollow()
            setIsUnfollowConfirmOpen(false)
          }}
          className="flex h-[50px] w-full items-center justify-center text-[15px] font-semibold text-red-500 active:bg-black/5"
        >
          確認取消追蹤
        </button>

        <div className="h-px bg-[#e5e5e5]" />

        <button
          type="button"
          onClick={() => setIsUnfollowConfirmOpen(false)}
          className="flex h-[50px] w-full items-center justify-center text-[15px] text-[#111] active:bg-black/5"
        >
          取消
        </button>
      </motion.div>
    </>
  )}
      
      </AnimatePresence>
    </motion.div>
  )
}