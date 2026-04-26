'use client'

import { useEffect, useMemo, useState } from 'react'
import AIStoryViewer from './AIStoryViewer'

type StoryPage = {
  id: number
  image: string
  tags: string[]
}

type StoryUser = {
  id: number
  name: string
  avatar: string
  stories: StoryPage[]
}

const storyUsers: StoryUser[] = [
  {
    id: 1,
    name: 'Ethan',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
    stories: [
      {
        id: 101,
        image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=900&q=80',
        tags: ['海邊', '陽光感', '好身材'],
      },
      {
        id: 102,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80',
        tags: ['海景', '放鬆感', '度假'],
      },
      {
        id: 103,
        image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=900&q=80',
        tags: ['海風', '自由感', '療癒'],
      },
    ],
  },
  {
    id: 2,
    name: 'Lucas',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
    stories: [
      {
        id: 201,
        image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=900&q=80',
        tags: ['夜生活', '派對感', '社交型'],
      },
      {
        id: 202,
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80',
        tags: ['燈光', '熱鬧', '派對'],
      },
    ],
  },
  {
    id: 3,
    name: 'Noah',
    avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=300&q=80',
    stories: [
      {
        id: 301,
        image: 'https://images.unsplash.com/photo-1492447166138-50c3889fccb1?w=900&q=80',
        tags: ['文青', '咖啡廳', '安靜感'],
      },
      {
        id: 302,
        image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=900&q=80',
        tags: ['閱讀', '安靜', '氣質'],
      },
      {
        id: 303,
        image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&q=80',
        tags: ['咖啡', '舒適感', '文青'],
      },
      {
        id: 304,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80',
        tags: ['慢生活', '室內', '溫柔感'],
      },
    ],
  },
  {
    id: 4,
    name: 'Jay',
    avatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=300&q=80',
    stories: [
      {
        id: 401,
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=80',
        tags: ['旅行', '戶外', '自由感'],
      },
      {
        id: 402,
        image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80',
        tags: ['公路', '探險', '遠方'],
      },
    ],
  },
  {
    id: 5,
    name: 'Mason',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
    stories: [
      {
        id: 501,
        image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&q=80',
        tags: ['健身', '自律感', '陽光'],
      },
    ],
  },
  {
    id: 6,
    name: 'Ryan',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
    stories: [
      {
        id: 601,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80',
        tags: ['時尚', '街頭感', '潮流'],
      },
      {
        id: 602,
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80',
        tags: ['穿搭', '城市', '造型感'],
      },
    ],
  },
  {
    id: 7,
    name: 'Aiden',
    avatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=300&q=80',
    stories: [
      {
        id: 701,
        image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=900&q=80',
        tags: ['咖啡廳', '舒服感', '文青'],
      },
    ],
  },
  {
    id: 8,
    name: 'Leo',
    avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=300&q=80',
    stories: [
      {
        id: 801,
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80',
        tags: ['海景', '度假', '放鬆感'],
      },
      {
        id: 802,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80',
        tags: ['藍天', '舒服感', '夏天'],
      },
    ],
  },
  {
    id: 9,
    name: 'Chris',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
    stories: [
      {
        id: 901,
        image: 'https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=900&q=80',
        tags: ['城市夜景', '成熟感', '高級感'],
      },
    ],
  },
  {
    id: 10,
    name: 'Owen',
    avatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=300&q=80',
    stories: [
      {
        id: 1001,
        image: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=900&q=80',
        tags: ['戶外', '自然', '安靜感'],
      },
      {
        id: 1002,
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=80',
        tags: ['森林', '清新感', '綠意'],
      },
      {
        id: 1003,
        image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=900&q=80',
        tags: ['自然', '療癒', '慢節奏'],
      },
    ],
  },
]

function getInitialUnreadCount(user: StoryUser, index: number) {
  const countMap = [3, 2, 0, 2, 1, 0, 1, 2, 0, 3]
  const fallback = Math.min(user.stories.length, 3)
  return countMap[index] ?? fallback
}

export default function AIStoryRow() {
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null)
  const [selectedPageIndex, setSelectedPageIndex] = useState(0)
  const [storyProgress, setStoryProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const unreadCountMap = useMemo(() => {
    return storyUsers.reduce<Record<number, number>>((acc, user, index) => {
      acc[user.id] = getInitialUnreadCount(user, index)
      return acc
    }, {})
  }, [])

  const selectedUser =
    selectedUserIndex !== null ? storyUsers[selectedUserIndex] : null

  const selectedPage = useMemo(() => {
    if (!selectedUser) return null
    return selectedUser.stories[selectedPageIndex] ?? selectedUser.stories[0] ?? null
  }, [selectedUser, selectedPageIndex])

  useEffect(() => {
    if (!selectedUser || !selectedPage) return
    if (isPaused) return

    const duration = 3000
    const intervalMs = 50
    const step = 100 / (duration / intervalMs)

    const timer = setInterval(() => {
      setStoryProgress((prev) => {
        const next = prev + step

        if (next >= 100) {
          const isLastPageOfUser =
            selectedPageIndex >= selectedUser.stories.length - 1

          if (!isLastPageOfUser) {
            setSelectedPageIndex((p) => p + 1)
            return 0
          }

          const isLastUser = selectedUserIndex === storyUsers.length - 1
          if (!isLastUser && selectedUserIndex !== null) {
            setSelectedUserIndex(selectedUserIndex + 1)
            setSelectedPageIndex(0)
            return 0
          }

          setSelectedUserIndex(null)
          setSelectedPageIndex(0)
          return 0
        }

        return next
      })
    }, intervalMs)

    return () => clearInterval(timer)
  }, [selectedUser, selectedPage, selectedPageIndex, selectedUserIndex, isPaused])

  const handleOpenStory = (userIndex: number) => {
    setSelectedUserIndex(userIndex)
    setSelectedPageIndex(0)
    setStoryProgress(0)
    setIsPaused(false)
  }

  const handleCloseViewer = () => {
    setSelectedUserIndex(null)
    setSelectedPageIndex(0)
    setStoryProgress(0)
    setIsPaused(false)
  }

  const handleNextPage = () => {
    if (selectedUserIndex === null) return
    const user = storyUsers[selectedUserIndex]
    const isLastPage = selectedPageIndex >= user.stories.length - 1

    if (!isLastPage) {
      setSelectedPageIndex((p) => p + 1)
      setStoryProgress(0)
      setIsPaused(false)
      return
    }

    const isLastUser = selectedUserIndex >= storyUsers.length - 1
    if (!isLastUser) {
      setSelectedUserIndex((u) => (u === null ? 0 : u + 1))
      setSelectedPageIndex(0)
      setStoryProgress(0)
      setIsPaused(false)
      return
    }

    handleCloseViewer()
  }

  const handlePrevPage = () => {
    if (selectedUserIndex === null) return

    if (storyProgress > 15) {
      setStoryProgress(0)
      setIsPaused(false)
      return
    }

    if (selectedPageIndex > 0) {
      setSelectedPageIndex((p) => p - 1)
      setStoryProgress(0)
      setIsPaused(false)
      return
    }

    if (selectedUserIndex > 0) {
      const prevUserIndex = selectedUserIndex - 1
      const prevUser = storyUsers[prevUserIndex]
      setSelectedUserIndex(prevUserIndex)
      setSelectedPageIndex(Math.max(prevUser.stories.length - 1, 0))
      setStoryProgress(0)
      setIsPaused(false)
      return
    }

    setStoryProgress(0)
    setIsPaused(false)
  }

  const handleNextUser = () => {
    if (selectedUserIndex === null) return
    if (selectedUserIndex >= storyUsers.length - 1) {
      handleCloseViewer()
      return
    }

    setSelectedUserIndex(selectedUserIndex + 1)
    setSelectedPageIndex(0)
    setStoryProgress(0)
    setIsPaused(false)
  }

  const handlePrevUser = () => {
    if (selectedUserIndex === null) return
    if (selectedUserIndex <= 0) {
      setSelectedPageIndex(0)
      setStoryProgress(0)
      setIsPaused(false)
      return
    }

    const prevUserIndex = selectedUserIndex - 1
    setSelectedUserIndex(prevUserIndex)
    setSelectedPageIndex(0)
    setStoryProgress(0)
    setIsPaused(false)
  }

  return (
    <>
      <div className="px-3 pt-2">
        
        <div
          data-no-page-swipe="true"
          className="scrollbar-hide flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory touch-pan-x"
          onTouchStart={(e) => {
            e.stopPropagation()
          }}
          onTouchMove={(e) => {
            e.stopPropagation()
          }}
          onTouchEnd={(e) => {
            e.stopPropagation()
          }}
        >
          {storyUsers.map((user, index) => {
            const cover = user.stories[0]
            const unreadCount = unreadCountMap[user.id] ?? 0
            const isAllSeen = unreadCount <= 0

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => handleOpenStory(index)}
                onTouchStart={(e) => {
                  e.stopPropagation()
                }}
                onTouchMove={(e) => {
                  e.stopPropagation()
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation()
                }}
                className="w-[116px] shrink-0 snap-start text-left"
              >
                <div className="relative h-[170px] w-[120px] overflow-hidden rounded-[24px] bg-[#e9e9e9] shadow-sm">
                  <img
                    src={cover.image}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/65" />

                  <div className="absolute right-[8px] top-[8px] z-10">
                    {isAllSeen ? (
                      <div className="h-[14px] w-[14px] rounded-full bg-[#bdbdbd] shadow-[0_1px_4px_rgba(0,0,0,0.18)]" />
                    ) : (
                      <div className="flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#8b5cf6] px-[5px] text-[10px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(139,92,246,0.35)]">
                        {Math.min(unreadCount, 10)}
                      </div>
                    )}
                  </div>

                  
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selectedUser && selectedPage && (
        <AIStoryViewer
  userName={selectedUser.name}
  avatar={selectedUser.avatar}
  story={selectedPage}
  storyCount={selectedUser.stories.length}
  currentIndex={selectedPageIndex}
  progress={storyProgress}
  onClose={handleCloseViewer}
  onNextPage={handleNextPage}
  onPrevPage={handlePrevPage}
  onNextUser={handleNextUser}
  onPrevUser={handlePrevUser}
  onPause={() => setIsPaused(true)}
  onResume={() => setIsPaused(false)}
/>
      )}
    </>
  )
}