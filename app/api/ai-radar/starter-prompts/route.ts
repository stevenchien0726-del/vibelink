import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function shuffleArray<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

function getFallbackPrompts(locale: string) {
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

function getSystemPrompt(locale: string) {
  if (locale === 'en') {
    return `
You are Vibelink AI Radar's homepage prompt generator.

Vibelink AI Radar helps users find people by vibe, lifestyle, aura, appearance, social energy, interests, and emotional feeling.

Generate exactly 3 search prompts.

Important:
- Make the 3 prompts feel clearly different from each other.
- Do NOT keep returning only fitness, beach, cafe, travel, or nightlife.
- Use a wider range of people-search themes.
- The prompts must sound like real users searching for people.
- They should be short and natural.
- Around 7 to 16 words each.
- Do not make them sound like chat questions.
- Do not make them sound like personality quiz questions.
- Do not make them sound like dating interview questions.

You can choose from a wide range of themes:
emotional warmth, late-night conversations, MBTI, romantic vibe, softboy, cool girl, Korean style, American style, fashion, outfit photos, music taste, techno, rave, K-pop, hip hop, anime, gaming, pets, photography, creators, startup people, artsy people, introverts, extroverts, mysterious aura, cold aura, sunny aura, healing energy, luxury rich-kid vibe, study-abroad vibe, party girl, party boy, gym, outdoor life, cafe life, slow life, nightlife, social butterfly energy.

Good examples:
- Find emotionally warm people who are easy to talk to
- Looking for stylish people with Korean outfit vibes
- Find mysterious people with deep late-night energy
- Find cute gamer or anime vibe people
- Looking for emotionally mature and calm people

Return ONLY a JSON array of strings.
No markdown.
No explanation.
`.trim()
  }

  return `
你是 Vibelink 的 AI 雷達首頁提示詞生成器。

Vibelink AI 雷達的核心是：
「幫使用者用 vibe、生活感、氣質、外貌感、興趣、社交能量、情緒感去找人」。

請生成 exactly 3 個搜尋提示詞。

重要要求：
- 3 句主題要明顯不一樣。
- 不要每次都集中在健身、海邊、旅行、咖啡廳、夜生活。
- 主題範圍要比一般交友 App 更大。
- 要像真人會輸入 AI 雷達的搜尋句。
- 要明確描述想找的人。
- 不要變成聊天問題。
- 不要像心理測驗。
- 不要像約會訪談。
- 不要太長。
- 使用繁體中文。
- 每句 10～28 字左右。

你可以從以下大範圍主題中自由混合：
情緒穩定、療癒感、深夜聊天、戀愛感、微曖昧感、MBTI、韓系、歐美感、台妹感、台男感、穿搭、黑色穿搭、音樂品味、Techno、Rave、KPOP、Hip Hop、動漫、遊戲、寵物、攝影、創作、創業、文青、內向、外向、社交蝴蝶、神秘感、高冷感、陽光感、富二代感、留學生感、party girl、party boy、健身、戶外、咖啡廳、慢生活、夜生活、IG 小網紅感。

好的方向例如：
- 幫我找情緒穩定、很好聊天的人
- 想找韓系穿搭 vibe 很強的人
- 幫我找有神秘感、深夜感的人
- 想找動漫或遊戲感比較重的人
- 幫我找情緒成熟、氣質安定的人

只回傳 JSON array of strings。
不要 markdown。
不要解釋。
`.trim()
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale') ?? 'zh-TW'

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        ok: false,
        prompts: getFallbackPrompts(locale),
      })
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 1.25,
      presence_penalty: 0.7,
      frequency_penalty: 0.6,
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(locale),
        },
      ],
    })

    const text = response.choices[0]?.message?.content ?? '[]'

    const cleanedText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    let prompts: string[] = []

    try {
      const parsed = JSON.parse(cleanedText)

      if (Array.isArray(parsed)) {
        prompts = parsed
          .filter((item) => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 3)
      }
    } catch (error) {
      console.error('starter prompts JSON parse failed:', error)
    }

    const finalPrompts =
      prompts.length === 3
        ? prompts
        : getFallbackPrompts(locale)

    console.log('🟢 starter prompts locale:', locale)
    console.log('🟢 starter prompts raw:', text)
    console.log('🟢 starter prompts parsed:', prompts)
    console.log('🟢 starter prompts final:', finalPrompts)

    return NextResponse.json({
      ok: true,
      prompts: finalPrompts,
    })
  } catch (error) {
    console.error('starter-prompts route failed:', error)

    return NextResponse.json({
      ok: false,
      prompts: getFallbackPrompts(locale),
    })
  }
}