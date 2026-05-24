// src/lib/mockPosts.ts

import type { PostItem } from '@/components/home/sections/feed/FeedGrid'
import { mockUsers } from './mockUsers'

function getStableLikeCount(seed: string) {
  let total = 0

  for (let i = 0; i < seed.length; i++) {
    total += seed.charCodeAt(i)
  }

  return 12 + (total % 88)
}

// ✅ 只保留前 12 個 mock user
const reducedMockUsers = mockUsers.slice(0, 12)

export const mockPosts: PostItem[] = reducedMockUsers.map((user) => {
  const id = `${user.id}-post-main`

  return {
    id,
    user_id: user.id,
    author: user.display_name,
    text: user.bio,
    likes: getStableLikeCount(id),

    // ✅ 避免太多圖造成初始化壓力
    images: user.images.slice(0, 1),

    aiTags: user.vibe_tags,
    type: 'post',

    isMine: false,
    isLiked: false,
    isSaved: false,
    isMock: true,
  }
})

// ✅ 暫時完全移除假短影片
export const mockShortVideos: PostItem[] = []