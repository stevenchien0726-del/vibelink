export type FakeUser = {
  id: string
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
    id: 'jay',
    name: 'Jay',
    age: 24,
    followers: 3200,
    bio: 'Cute nightlife vibe, playful energy, and high interaction style.',
    tags: ['奶狗感', '夜生活', '可愛', '音樂', '年輕男生', '互動感高'],
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=80',
      'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=1200&q=80',
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=1200&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&q=80&sig=2',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=80&sig=3',
    ],
  },
  {
    id: 'kenny',
    name: 'Kenny',
    age: 26,
    followers: 4100,
    bio: 'Gentle younger-boy charm with warm replies and cute energy.',
    tags: ['奶狗感', '可愛', '溫柔', '弟弟感', '成熟', '互動感高'],
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&q=80&sig=11',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=80&sig=12',
      'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=1200&q=80&sig=13',
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=1200&q=80&sig=14',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1200&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
    ],
  },
  {
    id: 'leo',
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
    id: 'ryan',
    name: 'Ryan',
    age: 25,
    followers: 2900,
    bio: 'Playful street vibe with cute energy and easy conversation.',
    tags: ['奶狗感', '活潑', '街頭感', '可愛', '互動感高'],
    avatar:
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&q=80&sig=21',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=80&sig=22',
      'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=1200&q=80&sig=23',
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=1200&q=80&sig=24',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1200&q=80&sig=25',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80&sig=26',
    ],
  },
]