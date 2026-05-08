// src/lib/mockUsers.ts

export type MockUser = {
  id: string
  username: string
  display_name: string
  avatar_url: string
  bio: string
  vibe_tags: string[]
  city: string
  images: string[]
  short_videos?: string[]
}

export const mockUsers: MockUser[] = [
  {
    id: 'mock-001',
    username: 'kai.vibes',
    display_name: 'Kai',
    avatar_url:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop',
    bio: 'Gym / Beach / Coffee / Chill House',
    city: 'Taipei',
    vibe_tags: ['gym', 'beach', 'streetwear', 'coffee'],
    images: [
      'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop',
    ],
    short_videos: [
      'https://www.w3schools.com/html/mov_bbb.mp4',
    ],
  },

  {
    id: 'mock-002',
    username: 'mina.dayoff',
    display_name: 'Mina',
    avatar_url:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1200&auto=format&fit=crop',
    bio: 'KPOP dancer / Seoul vibe / Fashion',
    city: 'Taipei',
    vibe_tags: ['kpop', 'dance', 'fashion', 'cute'],
    images: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    ],
  },

  {
    id: 'mock-003',
    username: 'ryu.street',
    display_name: 'Ryu',
    avatar_url:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop',
    bio: 'Hip Hop / Night drive / Tokyo mood',
    city: 'Taipei',
    vibe_tags: ['hiphop', 'street', 'nightlife'],
    images: [
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
    ],
  },

  {
    id: 'mock-004',
    username: 'luna.wave',
    display_name: 'Luna',
    avatar_url:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1200&auto=format&fit=crop',
    bio: 'Beach sunset / Europe vibe / Cafe hopping',
    city: 'Taipei',
    vibe_tags: ['beach', 'travel', 'europe', 'cafe'],
    images: [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
],
  },

  {
    id: 'mock-005',
    username: 'neo.runner',
    display_name: 'Neo',
    avatar_url:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop',
    bio: 'Running / Gym / Healthy life',
    city: 'Taipei',
    vibe_tags: ['fitness', 'running', 'gym'],
    images: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
    ],
  },
]