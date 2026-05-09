// src/lib/aiRadarParser.ts

export type AIRadarParsedQuery = {
  raw: string

  city?: string

  genderHint?: 'male' | 'female'

  tags: string[]

  vibes: string[]

  keywords: string[]
}

const CITY_KEYWORDS = [
  '台北',
  '台中',
  '高雄',
  '台南',
  '新北',
  '桃園',
]

const FEMALE_HINTS = [
  '女生',
  '女孩',
  '女性',
  '姐姐',
]

const MALE_HINTS = [
  '男生',
  '男孩',
  '男性',
  '帥哥',
]

const TAG_MAP: Record<string, string[]> = {
    腹肌: ['腹肌', '六塊肌'],
可愛: ['可愛', '奶狗'],
性感: ['性感', '辣'],
帥哥: ['帥哥'],
  健身: ['健身', 'gym', '重訓'],
  海邊: ['海邊', '沙灘', 'beach'],
  旅行: ['旅行', '旅遊'],
  咖啡: ['咖啡', 'coffee'],
  街舞: ['街舞', 'dancer', 'dance'],
  KPOP: ['kpop'],
  穿搭: ['穿搭', 'streetwear', 'fashion'],
  音樂祭: ['音樂祭', 'festival', 'edm'],
}

const VIBE_MAP: Record<string, string[]> = {
    可愛感: ['可愛', '奶狗'],
性感感: ['性感', '辣'],
  陽光: ['海邊', '戶外', '陽光'],
  戶外: ['露營', '登山', '旅行'],
  生活感: ['咖啡', '日常', '散步'],
  潮流感: ['穿搭', '街頭', '潮流'],
  派對感: ['夜店', '酒吧', 'festival'],
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((k) => text.includes(k))
}

export function parseAIRadarQuery(
  input: string
): AIRadarParsedQuery {
  const normalized = input.toLowerCase()

  let city: string | undefined
  let genderHint: 'male' | 'female' | undefined

  const tags: string[] = []
  const vibes: string[] = []

  // city
  for (const c of CITY_KEYWORDS) {
    if (input.includes(c)) {
      city = c
      break
    }
  }

  // gender
  if (includesAny(input, FEMALE_HINTS)) {
    genderHint = 'female'
  }

  if (includesAny(input, MALE_HINTS)) {
    genderHint = 'male'
  }

  // tags
  for (const [tag, keywords] of Object.entries(TAG_MAP)) {
    if (includesAny(normalized, keywords)) {
      tags.push(tag)
    }
  }

  // vibes
  for (const [vibe, keywords] of Object.entries(VIBE_MAP)) {
    if (includesAny(input, keywords)) {
      vibes.push(vibe)
    }
  }

  return {
    raw: input,

    city,

    genderHint,

    tags,

    vibes,

    keywords: input
      .replace(/[，、。！？,.]/g, ' ')
      .split(/\s+/)
      .filter(Boolean),
  }
}