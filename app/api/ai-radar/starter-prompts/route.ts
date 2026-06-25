import { NextResponse } from 'next/server'

function shuffleArray<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

function getStarterPrompts(locale: string) {
  const prompts =
    locale === 'en'
      ? [
          'Find emotionally steady people who feel comfortable to talk to and easy to know slowly',
          'Find people with a mysterious late-night vibe for deep talks about life and music',
          'Find people with clean Korean outfit vibes and a polished photo style',
          'Find people who love techno, rave, nightlife, and going out on weekends',
          'Find soft healing people who love pets and give off gentle daily-life energy',
          'Find sunny sporty people who feel disciplined, healthy, and easy to be around',
          'Find stylish people who know outfits, photos, and have a memorable IG vibe',
          'Find creative people into photography, art, exhibitions, and beautiful daily details',
          'Find people who feel a little distant and mysterious but full of hidden stories',
          'Find anime or gamer vibe people who would be fun to chat with at home',
          'Find calm people who enjoy cafes, walks, slow living, and peaceful routines',
          'Find social people with strong party energy who are fun to go out with',
          'Find emotionally mature people who speak gently and feel safe to be around',
          'Find party girl or party boy vibes with more depth than expected',
          'Find people with luxury taste, polished lifestyle, and rich-kid energy',
          'Find cute daily-life people who love cats or dogs and feel easy to message',
          'Find people who would be fun to travel with, take photos with, and explore cities with',
          'Find people with strong music taste and a clear attitude in their style',
          'Find people who look great in black outfits with a cool minimal personality',
          'Find quiet-looking people with thoughtful inner worlds who open up slowly',
        ]
      : [
          '幫我找看起來情緒穩定、聊天舒服，適合慢慢認識的人',
          '想找有深夜感、神秘感，適合聊人生和音樂的人',
          '幫我找韓系穿搭 vibe 強，照片風格乾淨又有質感的人',
          '找喜歡 Techno、Rave、夜生活，週末會一起出門玩的人',
          '想找有療癒感、喜歡寵物，日常氛圍很溫柔的人',
          '幫我找陽光運動系，感覺自律、健康又好相處的人',
          '想找很會穿搭、懂拍照，IG 風格有記憶點的人',
          '幫我找喜歡攝影、創作、展覽，生活很有美感的人',
          '找有一點距離感和神秘感，但越認識越有故事的人',
          '想找動漫、遊戲 vibe 明顯，適合一起宅聊天的人',
          '幫我找喜歡咖啡廳、散步、慢生活，氣質安定的人',
          '找社交感很強、很會玩，適合一起參加派對的人',
          '幫我找情緒成熟、說話有分寸，給人安全感的人',
          '想找 party girl / party boy vibe，但聊天也有深度的人',
          '幫我找有高級感、生活品味好，像富二代 vibe 的人',
          '找喜歡貓狗、日常很可愛，讓人想主動聊天的人',
          '想找適合一起旅行、拍照、探索城市角落的人',
          '幫我找音樂品味很強，從穿搭到照片都有態度的人',
          '找有黑色穿搭、冷感風格，看起來很有個性的人',
          '想找外表安靜但內心有想法，適合慢慢聊開的人',
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
