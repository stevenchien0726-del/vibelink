export type FakeUser = {
  id: number
  name: string
  age: number
  followers: number
  bio: string
  tags: string[]
  avatar: string
  images: string[]
}

export const fakeUsers: FakeUser[] = [
  {
    id: 1,
    name: 'Jay',
    age: 22,
    followers: 1200,
    bio: 'Cute but hot. Loves music, clubs, and spontaneous nights.',
    tags: ['奶狗感', '夜生活', '可愛', '音樂', '年輕男生', '互動感高'],
    avatar: '/mock/jay-1.jpg',
    images: [
      '/mock/jay-1.jpg',
      '/mock/jay-2.jpg',
      '/mock/jay-3.jpg',
      '/mock/jay-4.jpg',
      '/mock/jay-5.jpg',
    ],
  },
  {
    id: 2,
    name: 'Kenny',
    age: 24,
    followers: 4100,
    bio: 'Warm, caring, slightly mature but still has puppy-like energy.',
    tags: ['奶狗感', '可愛', '溫柔', '弟弟感', '成熟', '互動感高'],
    avatar: '/mock/kenny-1.jpg',
    images: [
      '/mock/kenny-1.jpg',
      '/mock/kenny-2.jpg',
      '/mock/kenny-3.jpg',
      '/mock/kenny-4.jpg',
      '/mock/kenny-5.jpg',
    ],
  },
  {
    id: 3,
    name: 'Leo',
    age: 25,
    followers: 1800,
    bio: 'Poolside body, beach energy, relaxed confidence.',
    tags: ['游泳池', '好身材', '腹肌', '帥', '年輕男生'],
    avatar: '/mock/leo-1.jpg',
    images: [
      '/mock/leo-1.jpg',
      '/mock/leo-2.jpg',
      '/mock/leo-3.jpg',
    ],
  },
  {
    id: 4,
    name: 'Ryan',
    age: 24,
    followers: 3200,
    bio: 'Nightlife lover, gym lifestyle, confident vibe.',
    tags: ['夜生活', '帥', '健身', '高追蹤', '派對'],
    avatar: '/mock/ryan-1.jpg',
    images: [
      '/mock/ryan-1.jpg',
      '/mock/ryan-2.jpg',
    ],
  },
]