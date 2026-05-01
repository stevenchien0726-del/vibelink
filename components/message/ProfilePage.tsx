'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Grid2x2,
  Clapperboard,
  Bookmark,
  Image as ImageIcon,
  Menu,
  PlusSquare,
  UserCircle2,
  Activity,
  Bell,
  Clock3,
  Ticket,
  Grid3x3,
  Settings,
  Megaphone,
Heart,
MessageCircle,
Send,
ChevronLeft,
MoreHorizontal,
} from 'lucide-react'

import UploadFullPage from '@/components/home/sections/upload/UploadFullPage'
import AccountManagePage from '@/components/message/AccountManagePage'
import SettingsPage from '@/pages/SettingsPage'
import type { CapsulePosition } from '@/app/page'

import { MEMBERSHIP_URL, VIBETV_APP_URL, openLink } from '@/lib/links'

import { PlaySquare } from 'lucide-react'

import { Plus } from 'lucide-react'
import { X } from 'lucide-react'

import { supabase } from '@/lib/supabase'

import { Link as LinkIcon } from 'lucide-react'

import WideMenuSheet from '@/components/WideMenuSheet'

type ProfilePageProps = {
  onCloseMenu?: () => void
  feedCapsulePosition: CapsulePosition
  onChangeFeedCapsulePosition: (value: CapsulePosition) => void
}

type MenuItemProps = {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

const activeColor = '#d89ad0'
const inactiveColor = '#222'


function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[52px] w-full justify-center rounded-[14px] bg-transparent px-2 py-[12px] text-[17px] text-[#222] transition hover:bg-[#ececec]"
    >
      <div className="flex min-w-[170px] items-center justify-center gap-4">
        <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center text-[#111]">
          {icon}
        </span>
        <span className="w-[96px] text-left leading-none">{label}</span>
      </div>
    </button>
  )
}


export default function ProfilePage({
  feedCapsulePosition,
  onChangeFeedCapsulePosition,
}: ProfilePageProps) {
  
  useEffect(() => {
  async function init() {
    await ensureMyProfile()
    await loadMyPosts()
  }

  init()
}, [])

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isLinkPortOpen, setIsLinkPortOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [showSettingsPage, setShowSettingsPage] = useState(false)
  const [showAccountManagePage, setShowAccountManagePage] = useState(false)
  const [isFavoritesPublic, setIsFavoritesPublic] = useState(true)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [profile, setProfile] = useState<any>(null)

  const albumItems = Array.from({ length: 5 })

  const tabTouchStartX = useRef<number | null>(null)
  const tabTouchDeltaX = useRef(0)
  const albumScrollRef = useRef<HTMLDivElement | null>(null)

  const [myPosts, setMyPosts] = useState<any[]>([])
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false)
  const [selectedPostImageIndex, setSelectedPostImageIndex] = useState(0)

  const gridItems = myPosts

  async function ensureMyProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('尚未登入')
    return
  }

  const { data: existingProfile, error: selectError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (selectError) {
    console.error('讀取 profile 失敗:', selectError)
    return
  }

  if (existingProfile) {
    setProfile(existingProfile)
    return
  }

  const fallbackName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Vibelink User'

  const newProfile = {
    id: user.id,
    username: `user_${user.id.slice(0, 5)}`,
    display_name: fallbackName,
    avatar_url: user.user_metadata?.avatar_url || null,
    bio: '',
  }

  const { data: createdProfile, error: insertError } = await supabase
    .from('profiles')
    .insert(newProfile)
    .select()
    .single()

  if (insertError) {
    console.error('建立 profile 失敗:', insertError)
    return
  }

  setProfile(createdProfile)
}

async function uploadAvatar(file: File) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    alert('請先登入')
    return
  }

  setAvatarUploading(true)

  const fileExt = file.name.split('.').pop()
  const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true,
    })

  if (uploadError) {
    console.error('上傳頭像失敗:', uploadError)
    alert('上傳頭像失敗')
    setAvatarUploading(false)
    return
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  setProfile((prev: any) => ({
    ...prev,
    avatar_url: data.publicUrl,
  }))

  setAvatarUploading(false)
}

async function updateProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    alert('請先登入')
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({
  display_name: profile?.display_name || '',
  username: profile?.username || '',
  bio: profile?.bio || '',
  avatar_url: profile?.avatar_url || null,
})
    .eq('id', user.id)

  if (error) {
    console.error('更新 profile 失敗:', error)
    alert('更新失敗')
    return
  }

  alert('更新成功')
  setIsEditProfileOpen(false)
}

async function loadMyPosts() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('尚未登入')
    return
  }

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      caption,
      created_at,
      post_images (
        image_url
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('讀取我的貼文失敗:', error)
    return
  }

  setMyPosts(data ?? [])
}

async function deleteSelectedPost() {
  if (!selectedPost?.id) return

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    alert('請先登入')
    return
  }

  const { data: deletedImages, error: imageDeleteError } = await supabase
    .from('post_images')
    .delete()
    .eq('post_id', selectedPost.id)
    .select()

  if (imageDeleteError) {
    console.error('刪除圖片資料失敗:', imageDeleteError)
    alert('刪除圖片資料失敗')
    return
  }

  const { data: deletedPosts, error: postDeleteError } = await supabase
    .from('posts')
    .delete()
    .eq('id', selectedPost.id)
    .eq('user_id', user.id)
    .select()

  if (postDeleteError) {
    console.error('刪除貼文失敗:', postDeleteError)
    alert('刪除貼文失敗')
    return
  }

  if (!deletedPosts || deletedPosts.length === 0) {
    alert('資料庫沒有刪到貼文，請檢查 Supabase RLS DELETE policy')
    return
  }

  setMyPosts((prev) => prev.filter((post) => post.id !== selectedPost.id))
  setIsPostMenuOpen(false)
  setSelectedPost(null)
}

  function goToTab(index: number) {
    if (index < 0 || index > 3) return
    setActiveTab(index)
  }

  function canSwipeFromAlbum(deltaX: number) {
    const el = albumScrollRef.current
    if (!el) return true

    const atFirst = el.scrollLeft <= 4
    const atLast = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4

    if (deltaX > 0) return atFirst
    if (deltaX < 0) return atLast

    return true
  }

  function handleTabTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0]
    tabTouchStartX.current = touch.clientX
    tabTouchDeltaX.current = 0
  }

  function handleTabTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (tabTouchStartX.current == null) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - tabTouchStartX.current
    tabTouchDeltaX.current = deltaX

    if (activeTab === 3 && !canSwipeFromAlbum(deltaX)) {
      return
    }

    if (Math.abs(deltaX) > 8) {
      e.stopPropagation()
    }
  }

  function handleTabTouchEnd() {
    const deltaX = tabTouchDeltaX.current

    if (Math.abs(deltaX) > 50) {
      if (activeTab === 3 && !canSwipeFromAlbum(deltaX)) {
        tabTouchStartX.current = null
        tabTouchDeltaX.current = 0
        return
      }

      if (deltaX < 0) {
        goToTab(activeTab + 1)
      } else {
        goToTab(activeTab - 1)
      }
    }

    tabTouchStartX.current = null
    tabTouchDeltaX.current = 0
  }

  return (
    <div className="relative min-h-screen bg-[#f3f3f3] pb-[110px]">
      <div className="mx-auto w-full max-w-[430px] px-4 pt-[90px]">
        <div className="fixed top-0 left-1/2 z-[100] w-full max-w-[430px] -translate-x-1/2 bg-[#f3f3f3]/95 px-4 pt-4 pb-3 backdrop-blur-md">
  <div className="flex items-center justify-between">
    <motion.button
  type="button"
  onClick={() => {
    setIsUploadOpen(false)
    setIsMenuOpen((prev) => !prev)
  }}
  whileTap={{ scale: 0.9 }}
  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
  className="relative z-[30] flex h-[38px] items-center gap-2 rounded-[14px] bg-[#d9d9d9] px-3 text-[13px] text-[#222]"
>
  <Menu size={18} />
  <span>{isMenuOpen ? 'CLOSE' : 'MENU'}</span>
</motion.button>

    <button
      type="button"
      onClick={() => {
        setIsMenuOpen(false)
        setIsUploadOpen((prev) => !prev)
      }}
      className="relative z-[30] flex h-[38px] items-center gap-2 rounded-[14px] bg-[#d9d9d9] px-3 text-[13px] text-[#222]"
    >
      <PlusSquare size={15} />
      <span>上傳內容</span>
    </button>
  </div>
</div>
          
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
  {profile?.display_name || profile?.username || 'Loading...'}
</div>
              <div className="text-[18px] font-medium text-[#444]">
  {profile?.username || 'Loading...'}
</div>
            </div>
          </div>

          <div className="flex gap-10 pr-4">
  {/* 貼文 */}
  <div className="flex flex-col items-center">
    <div className="text-[18px] text-[#222]">{myPosts.length}</div>
    <div className="text-[14px] text-[#666]">貼文</div>
  </div>

  {/* 粉絲 */}
  <div className="flex flex-col items-center">
    <div className="text-[18px] text-[#222]">5萬</div>
    <div className="text-[14px] text-[#666]">粉絲</div>
  </div>
</div>
        </div>

        <div className="mb-3">
  <div className="text-[16px] leading-[1.45] text-[#333]">
    {profile?.bio || 'Loading...'}
  </div>
</div>

        <div className="mb-4 flex items-center">

  {/* LINKPORT */}
  <motion.button
  type="button"
  onClick={() => setIsLinkPortOpen(true)}
  whileTap={{ scale: 0.9 }} // 👈 按下去縮
  initial={{ scale: 1 }}
  animate={{ scale: 1 }}
  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
  className="
    inline-flex h-[32px] items-center gap-2
    rounded-[18px] border-[3px] border-[#8f8f8f]
    bg-transparent px-6 text-[14px] text-[#8B5CF6]
  "
>
  <LinkIcon size={16}/>
  <span className="text-[#8B5CF6]">LINKPORT</span>
</motion.button>

</div>


        <div className="mb-4 flex w-full items-center gap-3">
          
          <button
  type="button"
  onClick={() => setIsEditProfileOpen(true)}
  className="flex h-[44px] flex-1 items-center justify-center rounded-[18px] !border-[1.5px] !border-solid !border-[#8f8f8f] !bg-transparent px-3 text-[15px] leading-none whitespace-nowrap text-[#222]"
  style={{ WebkitAppearance: 'none', appearance: 'none' }}
>
  編輯檔案
</button>

          <button
            type="button"
            className="flex h-[44px] flex-1 items-center justify-center rounded-[18px] !border-[1.5px] !border-solid !border-[#8f8f8f] !bg-transparent px-3 text-[15px] leading-none whitespace-nowrap text-[#222]"
            style={{ WebkitAppearance: 'none', appearance: 'none' }}
          >
            分享檔案
          </button>
        </div>

        <div className="relative mb-2 border-b border-[#d9d9d9] pb-2">
          <div className="grid grid-cols-4">
            <button
              type="button"
              onClick={() => goToTab(0)}
              className="flex h-[34px] items-center justify-center"
            >
              <Grid2x2
                size={20}
                className="transition-colors duration-200"
                color={activeTab === 0 ? activeColor : inactiveColor}
              />
            </button>

            <button
              type="button"
              onClick={() => goToTab(1)}
              className="flex h-[34px] items-center justify-center"
            >
              <PlaySquare
  size={20}
  className="transition-colors duration-200"
  color={activeTab === 1 ? activeColor : inactiveColor}
/>
            </button>

            <button
              type="button"
              onClick={() => goToTab(2)}
              className="flex h-[34px] items-center justify-center"
            >
              <ImageIcon
                size={20}
                className="transition-colors duration-200"
                color={activeTab === 2 ? activeColor : inactiveColor}
              />
            </button>

            <button
              type="button"
              onClick={() => goToTab(3)}
              className="flex h-[34px] items-center justify-center"
            >
              <Bookmark
                size={20}
                className="transition-colors duration-200"
                color={activeTab === 3 ? activeColor : inactiveColor}
              />
            </button>
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

        <div
          data-no-page-swipe="true"
          className="overflow-hidden touch-pan-y"
          onTouchStart={handleTabTouchStart}
          onTouchMove={handleTabTouchMove}
          onTouchEnd={handleTabTouchEnd}
        >
          <div
  className="flex w-full transition-transform duration-300 ease-out"
  style={{
    transform: `translateX(-${activeTab * 100}%)`,
  }}
>
  {/* 第1頁 */}
  <div className="w-full shrink-0">
    <div className="grid grid-cols-3 gap-[2px]">
      {gridItems.map((post) => {
  const image = post.post_images?.[0]?.image_url

  return (
    <button
  type="button"
  key={post.id}
  onClick={() => {
  setSelectedPost(post)
  setSelectedPostImageIndex(0)
}}
  className="h-[190px] bg-[#d9d9d9]"
>
      {image && (
        <img
          src={image}
          className="h-full w-full object-cover"
        />
      )}
      {post.post_images?.length > 1 && (
  <div className="absolute right-2 top-2 text-white text-xs bg-black/50 px-2 py-[2px] rounded-full">
    {post.post_images.length}
  </div>
)}
    </button>

  )
})}
    </div>
  </div>

  {/* 第2頁：短影片 */}
<div className="w-full shrink-0">
  <div className="flex min-h-[220px] items-center justify-center text-[14px] text-[#999]">
    尚無短影片
  </div>
</div>

    {/* 第3頁（精選限動） */}
  <div className="w-full shrink-0">
    <div className="mb-3 mt-2 flex items-center justify-between px-[2px]">
      <span className="text-[16px] font-medium">
        <span className="ml-[1px] text-[#111]">精選限動</span>
      </span>

    </div>

    {/* 第3頁（精選限動） */}
<div className="w-full shrink-0">
  

  {/* 👇 加這段 */}
  <div className="grid grid-cols-2 gap-3">
    {[
      { label: '日常' },
      { label: '跳舞' },
      { label: '旅遊' },
      { label: '健身' },
    ].map((item, index) => (
      <div
        key={index}
        className="relative h-[250px] w-full overflow-hidden rounded-[20px] bg-[#d9d9d9]"
      >
        {/* 未來可以放封面圖 */}
        <div className="absolute inset-0 bg-[#cfcfcf]" />

        {/* 底部文字 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[15px] font-medium text-[#222]">
          {item.label}
        </div>
      </div>
    ))}
  </div>
</div>

  </div>

  

  {/* 第4頁（收藏） */}
  <div className="w-full shrink-0">
    
      <div className="mb-3 mt-2 flex items-center justify-between">
        <span className="text-[16px] font-medium text-[#111]">
          我的收藏
        </span>

        <div className="flex items-center gap-3">
          <span
            className={`text-[14px] font-medium transition-colors ${
              isFavoritesPublic ? 'text-[#8B5CF6]' : 'text-[#666]'
            }`}
          >
            {isFavoritesPublic ? '公開' : '不公開'}
          </span>

          <button
            type="button"
            onClick={() => setIsFavoritesPublic((prev) => !prev)}
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
      {gridItems.map((post) => {
  const image = post.post_images?.[0]?.image_url

  return (
    <div key={post.id} className="h-[190px] bg-[#d9d9d9]">
      {image && (
        <img
          src={image}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  )
})}
    </div>
  </div>
</div>
        </div>
      </div>

<AnimatePresence>
  {isEditProfileOpen && (
    <motion.div
      className="fixed inset-0 z-[650] bg-[#f3f3f3]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 360, damping: 34 }}
    >
      <div className="mx-auto w-full max-w-[430px] px-4 pt-5">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsEditProfileOpen(false)}
            className="text-[16px] text-[#222]"
          >
            取消
          </button>

          <div className="text-[18px] font-medium text-[#111]">
            編輯檔案
          </div>

          <button
            type="button"
            onClick={updateProfile}
            className="text-[16px] font-medium text-[#8B5CF6]"
          >
            儲存
          </button>
        </div>

        <div className="mb-6 flex flex-col items-center gap-3">
  <div className="h-[86px] w-[86px] overflow-hidden rounded-full bg-[#d9d9d9]">
    {profile?.avatar_url && (
      <img
        src={profile.avatar_url}
        className="h-full w-full object-cover"
      />
    )}
  </div>

  <label className="cursor-pointer text-[15px] font-medium text-[#8B5CF6]">
    {avatarUploading ? '上傳中...' : '更換頭像'}
    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) uploadAvatar(file)
      }}
    />
  </label>
</div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-[14px] text-[#666]">
            顯示名稱
            <input
              value={profile?.display_name || ''}
              onChange={(e) =>
                setProfile((prev: any) => ({
                  ...prev,
                  display_name: e.target.value,
                }))
              }
              className="h-[46px] rounded-[14px] border border-[#ddd] bg-white px-4 text-[16px] text-[#222] outline-none"
              placeholder="輸入顯示名稱"
            />
          </label>

          <label className="flex flex-col gap-2 text-[14px] text-[#666]">
            使用者名稱
            <input
              value={profile?.username || ''}
              onChange={(e) =>
                setProfile((prev: any) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              className="h-[46px] rounded-[14px] border border-[#ddd] bg-white px-4 text-[16px] text-[#222] outline-none"
              placeholder="輸入 username"
            />
          </label>

          <label className="flex flex-col gap-2 text-[14px] text-[#666]">
            自我介紹
            <textarea
              value={profile?.bio || ''}
              onChange={(e) =>
                setProfile((prev: any) => ({
                  ...prev,
                  bio: e.target.value,
                }))
              }
              className="min-h-[120px] rounded-[14px] border border-[#ddd] bg-white px-4 py-3 text-[16px] text-[#222] outline-none"
              placeholder="輸入自我介紹"
            />
          </label>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>

      <AnimatePresence>
        {isUploadOpen && (
          <UploadFullPage
  onClose={() => setIsUploadOpen(false)}
  onPostCreated={(post) => {
    setMyPosts((prev) => [
      {
        ...post,
        post_images: post.imageUrls.map((url) => ({
          image_url: url,
        })),
      },
      ...prev,
    ])
  }}
/>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettingsPage && (
          
  <SettingsPage
            onClose={() => {
              setShowSettingsPage(false)
              setIsMenuOpen(true)
            }}
            capsulePosition={feedCapsulePosition}
            onCapsulePositionChange={onChangeFeedCapsulePosition}
            initialDarkMode={false}
            initialShowCity={false}
            onDarkModeChange={(value) => {
              console.log('dark mode:', value)
            }}
            onShowCityChange={(value) => {
              console.log('show city:', value)
            }}
            onBlockedClick={() => {
              console.log('blocked clicked')
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
  {isLinkPortOpen && (
    <>
      {/* 背景遮罩 */}
      <motion.div
        className="fixed inset-0 z-[200] bg-black/30"
        onClick={() => setIsLinkPortOpen(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* 底部 Sheet */}
      <motion.div
        className="fixed bottom-0 left-1/2 z-[210] w-full max-w-[430px] -translate-x-1/2 rounded-t-[24px] bg-[#f3f3f3] px-5 pt-4 pb-6"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        {/* 上方拉條 */}
        <div className="mb-3 flex justify-center">
          <div className="h-[4px] w-[40px] rounded-full bg-[#bbb]" />
        </div>

        {/* Header */}
        <div className="relative mb-4 text-center">
          <div className="text-[18px] font-medium">LINKPORT</div>

          <button
  onClick={() => setIsLinkPortOpen(false)}
  className="absolute right-0 top-0 flex h-[32px] w-[32px] items-center justify-center rounded-full hover:bg-[#e5e5e5]"
>
  <X size={23} />
</button>
        </div>

        <div className="mb-4 h-[1px] bg-[#ddd]" />

        {/* Link list */}
        <div className="flex flex-col items-center gap-7 text-[18px]">

  <div className="flex w-[160px] items-center gap-3">
    <LinkIcon size={20} />
    <span>Instagram</span>
  </div>

  <div className="flex w-[160px] items-center gap-3">
    <LinkIcon size={20} />
    <span>TIKTOK</span>
  </div>

  <div className="flex w-[160px] items-center gap-3">
    <LinkIcon size={20} />
    <span>Onlyfans</span>
  </div>

  <div className="flex w-[160px] items-center gap-3 text-[#666]">
  <Plus size={23} />
  <span>新增</span>
</div>

</div>
      </motion.div>
    </>
  )}
</AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close profile menu overlay"
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[20] bg-black/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            />

            <motion.div
              className="fixed left-1/2 top-[96px] z-[25] w-[300px] -translate-x-1/2 rounded-[26px] bg-[#f3f3f3] px-6 py-6 shadow-[0_16px_40px_rgba(0,0,0,0.10)]"
              initial={{ opacity: 0, scale: 0.82, y: -18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.86, y: -10 }}
              transition={{
                type: 'spring',
                stiffness: 360,
                damping: 28,
                mass: 0.9,
              }}
              style={{ originX: 0.88, originY: 0 }}
            >
              <div className="flex flex-col gap-3">
                <MenuItem icon={<Bell size={22} />} label="通知" />
                
                <MenuItem
  icon={<Settings size={22} />}
  label="設定"
  onClick={() => {
    setShowSettingsPage(true)
  }}
/>
                

                <MenuItem icon={<Activity size={22} />} label="流量報告" />
                
                <MenuItem icon={<Clock3 size={22} />} label="典藏內容" />

                <MenuItem
  icon={<Ticket size={22} />}
  label="Vibe會員"
  onClick={() => {
  setIsMenuOpen(false)
  window.open('https://vibe-membership-web.vercel.app', '_blank', 'noopener,noreferrer')
}}
/>

                <MenuItem icon={<Grid3x3 size={22} />} label="Vibe Hub" />

                
                <MenuItem
  icon={<UserCircle2 size={22} />}
  label="帳號管理"
  onClick={() => {
    setShowAccountManagePage(true)
    setIsMenuOpen(false)
  }}
/>

                <MenuItem icon={<Megaphone size={22} />} label="廣告中心" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
  {showAccountManagePage && (
    <AccountManagePage
      onClose={() => setShowAccountManagePage(false)}
    />
  )}
</AnimatePresence>
    
    <AnimatePresence>
  {selectedPost && (
    <motion.div
      className="fixed inset-0 z-[500] bg-[#f3f3f3]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 360, damping: 34 }}
    >
      {/* Top Bar */}
      <div className="fixed left-1/2 top-0 z-[510] flex h-[58px] w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[#f3f3f3]/95 px-4 backdrop-blur-md">
        <button
          type="button"
          onClick={() => {
  setIsPostMenuOpen(false)
  setSelectedPost(null)
}}
          className="flex h-10 w-10 items-center justify-center rounded-full active:scale-90"
        >
          <ChevronLeft />
        </button>

        <button
          type="button"
          onClick={() => setIsPostMenuOpen(true)}
          className="flex h-10 items-center gap-2 rounded-full px-2 active:scale-95"
        >
          <MoreHorizontal size={22} strokeWidth={2.4} />
          <span className="text-[15px] font-medium">MENU</span>
        </button>
      </div>

      <div className="mx-auto h-full w-full max-w-[430px] overflow-y-auto pt-[58px] pb-[120px]">
        {/* Author */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-[34px] w-[34px] rounded-full bg-[#d6d6d6]" />
            <div className="text-[15px] font-medium text-[#222]">
              {profile?.display_name || profile?.username || 'Vibelink User'}
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="px-3">
  <div className="relative overflow-hidden rounded-[18px]">
    <motion.div
      className="flex"
      animate={{ x: `-${selectedPostImageIndex * 100}%` }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
    >
      {selectedPost.post_images?.map((img: any, index: number) => (
        <div
          key={index}
          className="w-full shrink-0 grow-0 basis-full"
        >
          <img
            src={img.image_url}
            className="w-full object-cover"
          />
        </div>
      ))}
    </motion.div>
  </div>

  {/* dots */}
  <div className="mt-3 flex justify-center gap-2">
    {selectedPost.post_images?.map((_: any, index: number) => (
      <button
        key={index}
        onClick={() => setSelectedPostImageIndex(index)}
        className={`h-[7px] w-[7px] rounded-full ${
          selectedPostImageIndex === index
            ? 'bg-[#c86cff]'
            : 'bg-[#ddd]'
        }`}
      />
    ))}
  </div>
</div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-5">
            <button type="button" className="active:scale-90">
              <Heart size={25} strokeWidth={2.1} />
            </button>

            <button type="button" className="active:scale-90">
              <MessageCircle size={25} strokeWidth={2.1} />
            </button>
          </div>

          <div className="flex items-center gap-5">
            <button type="button" className="active:scale-90">
              <Send size={24} strokeWidth={2.1} />
            </button>

            <button type="button" className="active:scale-90">
              <Bookmark size={25} strokeWidth={2.1} />
            </button>
          </div>
        </div>

        {/* Caption */}
        {selectedPost.caption && (
          <div className="px-4 pt-3 text-[15px] text-[#222]">
            {selectedPost.caption}
          </div>
        )}

        {/* Comments */}
        <div className="mt-5 border-t border-[#ddd] px-4 pt-4">
          <div className="mb-4 text-[15px] font-medium text-[#222]">
            留言
          </div>

          <div className="flex flex-col gap-4 pb-8">
            <div className="text-[14px] text-[#999]">
              尚無留言，成為第一個留言的人
            </div>
          </div>
        </div>
      </div>

      {/* Comment Input */}
      <div className="fixed bottom-0 left-1/2 z-[510] w-full max-w-[430px] -translate-x-1/2 bg-[#f3f3f3]/95 px-4 py-3 backdrop-blur-md">
        <div className="flex h-[46px] items-center gap-3 rounded-full bg-white px-4 shadow-sm">
          <div className="h-[28px] w-[28px] rounded-full bg-[#d6d6d6]" />
          <input
            placeholder="加入留言..."
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#999]"
          />
          <button className="text-[14px] font-medium text-[#8B5CF6]">
            發送
          </button>
        </div>
      </div>

      <AnimatePresence>
  {isPostMenuOpen && (
    <WideMenuSheet
      variant="mine"
      onClose={() => setIsPostMenuOpen(false)}
      onDelete={deleteSelectedPost}
    />
  )}
</AnimatePresence>

    </motion.div>
  )}
</AnimatePresence>
    
    </div>
  )
}