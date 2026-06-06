import { NextResponse } from 'next/server'

function shuffleArray<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

function getStarterPrompts(locale: string) {
  const prompts =
    locale === 'en'
      ? [
          'Find emotionally warm people who are easy to talk to',
          'Looking for stylish people with Korean outfit vibes',
          'Find mysterious people with deep late-night energy',
          'Find people who love techno, rave, and nightlife',
          'Looking for cute gamer or anime vibe people',
          'Find creative people into photography and art',
          'Find soft healing people who love pets',
          'Looking for confident people with luxury vibes',
          'Find chill people who enjoy cafes and slow life',
          'Find social people with strong party energy',
          'Looking for emotionally mature and calm people',
          'Find people with a sunny sporty outdoor vibe',
        ]
      : [
          '幫我找情緒穩定、很好聊天的人',
          '想找韓系穿搭 vibe 很強的人',
          '幫我找有神秘感、深夜感的人',
          '找喜歡 Techno、Rave、夜生活的人',
          '想找動漫或遊戲感比較重的人',
          '幫我找喜歡攝影和創作的人',
          '找有寵物感、很療癒的人',
          '幫我找有高級感、富二代感的人',
          '想找喜歡咖啡廳和慢生活的人',
          '找社交感很強、很會玩的人',
          '幫我找情緒成熟、氣質安定的人',
          '找陽光運動系、戶外感的人',
        ]

  return shuffleArray(prompts).slice(0, 3)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale') ?? 'zh-TW'

  return NextResponse.json({
    ok: true,
    prompts: getStarterPrompts(locale),
  })
}
