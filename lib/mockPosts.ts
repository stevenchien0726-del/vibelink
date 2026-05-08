// src/lib/mockPosts.ts

import type { PostItem } from '@/components/home/sections/feed/FeedGrid'
import { mockUsers } from './mockUsers'

function getStableLikeCount(seed: string) {
  let total = 0

  for (let i = 0; i < seed.length; i++) {
    total += seed.charCodeAt(i)
  }

  return 20 + (total % 180)
}

export const mockPosts: PostItem[] = mockUsers.map((user) => {
  const id = `${user.id}-post-main`

  return {
    id,
    user_id: user.id,
    author: user.display_name,
    text: user.bio,
    likes: getStableLikeCount(id),
    images: user.images,
    aiTags: user.vibe_tags,
    type: 'post' as const,
    isMine: false,
    isLiked: false,
    isSaved: false,
    isMock: true,
  }
})