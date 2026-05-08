// src/lib/mockUsersExtra.ts

import type { MockUser } from './mockUsers'

const vibeSets = [
  ['gym', 'fitness', 'workout'],
  ['kpop', 'dance', 'fashion'],
  ['beach', 'travel', 'summer'],
  ['coffee', 'cafe', 'softgirl'],
  ['nightlife', 'techno', 'rave'],
  ['streetwear', 'hiphop', 'sneakers'],
  ['art', 'film', 'design'],
  ['startup', 'ai', 'coding'],
  ['basketball', 'street', 'sports'],
  ['music', 'lofi', 'vinyl'],
  ['yoga', 'wellness', 'calm'],
  ['model', 'fashion', 'photo'],
]

const feedImageIds = [
  '1524504388940-b1c1722653e1',
  '1515886657613-9f3515b0c78f',
  '1503023345310-bd7c1de61c7d',
  '1500648767791-00dcc994a43e',
  '1517836357463-d25dfeac3438',
  '1518611012118-696072aa579a',
  '1507525428034-b723cf961d3e',
  '1506744038136-46273834b3fb',
  '1511367461989-f85a21fda167',
  '1521119989659-a83eee488004',

  '1494790108377-be9c29b29330',
  '1488426862026-3ee34a7d66df',
  '1496747611176-843222e1e57c',
  '1500917293891-ef795e70e1f6',
  '1517838277536-f5f99be501cd',
  '1483721310020-03333e577078',
  '1495474472287-4d71bcdd2085',
  '1501785888041-af3ef285b470',
  '1511919884226-fd3cad34687c',
  '1517649763962-0c623066013b',

  '1519345182560-3f2917c472ef',
  '1515886657613-9f3515b0c78f',
  '1494790108755-2616b612b786',
  '1517841905240-472988babdf9',
  '1517365830460-955ce3ccd263',
  '1515886657613-9f3515b0c78f',
  '1521572267360-ee0c2909d518',
  '1519085360753-af0119f7cbe7',
  '1512436991641-6745cdb1723f',
  '1504593811423-6dd665756598',

  '1492562080023-ab3db95bfbce',
  '1524504388940-b1c1722653e1',
  '1494790108377-be9c29b29330',
  '1515886657613-9f3515b0c78f',
  '1521119989659-a83eee488004',
  '1519345182560-3f2917c472ef',
  '1500648767791-00dcc994a43e',
  '1488426862026-3ee34a7d66df',
  '1517365830460-955ce3ccd263',
  '1496747611176-843222e1e57c',

  '1519085360753-af0119f7cbe7',
  '1512436991641-6745cdb1723f',
  '1494790108755-2616b612b786',
  '1521572267360-ee0c2909d518',
  '1517836357463-d25dfeac3438',
  '1518611012118-696072aa579a',
  '1503023345310-bd7c1de61c7d',
  '1511367461989-f85a21fda167',
  '1517649763962-0c623066013b',
  '1500917293891-ef795e70e1f6',

  '1517838277536-f5f99be501cd',
  '1501785888041-af3ef285b470',
  '1483721310020-03333e577078',
  '1495474472287-4d71bcdd2085',
  '1511919884226-fd3cad34687c',
  '1507525428034-b723cf961d3e',
  '1506744038136-46273834b3fb',
  '1492562080023-ab3db95bfbce',
  '1504593811423-6dd665756598',
  '1519345182560-3f2917c472ef',

  '1494790108377-be9c29b29330',
  '1515886657613-9f3515b0c78f',
  '1500648767791-00dcc994a43e',
  '1488426862026-3ee34a7d66df',
  '1517365830460-955ce3ccd263',
  '1496747611176-843222e1e57c',
  '1519085360753-af0119f7cbe7',
  '1512436991641-6745cdb1723f',
  '1494790108755-2616b612b786',
  '1521572267360-ee0c2909d518',

  '1517836357463-d25dfeac3438',
  '1518611012118-696072aa579a',
  '1503023345310-bd7c1de61c7d',
  '1511367461989-f85a21fda167',
  '1517649763962-0c623066013b',
  '1500917293891-ef795e70e1f6',
  '1517838277536-f5f99be501cd',
  '1501785888041-af3ef285b470',
  '1483721310020-03333e577078',
  '1495474472287-4d71bcdd2085',

  '1511919884226-fd3cad34687c',
  '1507525428034-b723cf961d3e',
  '1506744038136-46273834b3fb',
  '1492562080023-ab3db95bfbce',
  '1504593811423-6dd665756598',
  '1519345182560-3f2917c472ef',
  '1524504388940-b1c1722653e1',
  '1494790108377-be9c29b29330',
  '1515886657613-9f3515b0c78f',
  '1500648767791-00dcc994a43e',

  '1488426862026-3ee34a7d66df',
  '1517365830460-955ce3ccd263',
  '1496747611176-843222e1e57c',
  '1519085360753-af0119f7cbe7',
  '1512436991641-6745cdb1723f',
  '1494790108755-2616b612b786',
  '1521572267360-ee0c2909d518',
  '1517836357463-d25dfeac3438',
  '1518611012118-696072aa579a',
  '1503023345310-bd7c1de61c7d',
]

const mockNames = [
  'Aiden', 'Emma', 'Jay', 'Yuna', 'Ryan', 'Lucas', 'Mia', 'Ethan', 'Nina', 'Alex',
  'Sophie', 'Kaio', 'Lily', 'Dylan', 'Ava', 'Max', 'Ella', 'Noah', 'Zoe', 'Logan',
  'Ivy', 'Leo', 'Celine', 'Miles', 'Aria', 'Theo', 'Nora', 'Finn', 'Iris', 'Cole',
  'Lana', 'Owen', 'Jade', 'Kairos', 'Mira', 'Rex', 'Tina', 'Axel', 'June', 'Eli',
  'Skye', 'Duke', 'Rina', 'Ash', 'Vera', 'Jett', 'Luna K', 'Nico', 'Sia', 'Troy',
  'May', 'Kane', 'Rosa', 'Dean', 'Elle', 'Hugo', 'Kira', 'Ace', 'Momo', 'Ray',
  'Lia', 'Blake', 'Yuki', 'Sean', 'Faye', 'Ian', 'Nami', 'Chris', 'Aya', 'Ben',
  'Tara', 'Zion', 'Mina K', 'Louis', 'Nell', 'Marco', 'Jia', 'Evan', 'Rumi', 'Carl',
  'Vivi', 'Jules', 'Mei', 'Dante', 'Nola', 'Eason', 'Bella', 'Kobe', 'Irene', 'Rio',
  'Hana', 'Mason', 'Ruby', 'Kenji', 'Stella', 'Claire', 'Adam', 'Isaac', 'Grace', 'Aaron',
]

function getGender(index: number) {
  return index % 2 === 0 ? 'women' : 'men'
}

function getPortraitNumber(index: number) {
  return index % 90
}

export const mockUsersExtra: MockUser[] = mockNames.map((name, index) => {
  const number = index + 10
  const id = `mock-${String(number).padStart(3, '0')}`
  const tags = vibeSets[index % vibeSets.length]
  const gender = getGender(index)
  const portraitNumber = getPortraitNumber(index)

  return {
    id,

    username: `${name.toLowerCase().replace(/\s+/g, '')}.vibe${number}`,

    display_name: name,

    avatar_url: `https://randomuser.me/api/portraits/${gender}/${portraitNumber}.jpg`,

    bio: `${tags[0]} / ${tags[1]} / ${tags[2]} mood`,

    city: 'Taipei',

    vibe_tags: tags,

    images: [
  `https://images.unsplash.com/photo-${
    feedImageIds[index % feedImageIds.length]
  }?q=80&w=1200&auto=format&fit=crop&sig=${index}`,
],
  }
})