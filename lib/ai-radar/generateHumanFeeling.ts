import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type Params = {
  locale?: 'zh-TW' | 'en'
  username?: string
  aiTags?: string[]
  aiStyleTags?: string[]
  aiCaption?: string
  captions?: string[]
  signal?: AbortSignal
}

export async function generateHumanFeeling({
  locale = 'zh-TW',
  username,
  aiTags = [],
  aiStyleTags = [],
  aiCaption = '',
  captions = [],
  signal,
}: Params) {
  const safeCaptions = captions
    .filter(Boolean)
    .slice(0, 5)
    .join('\n')

  const systemPrompt =
    locale === 'en'
      ? `
You are Vibelink AI Radar's human feeling interpreter.

Your job is NOT:
- describing tags
- listing interests
- summarizing content
- sounding like LinkedIn
- sounding like ChatGPT

Your job IS:
- describing human feeling
- emotional imagination
- social aura
- relationship energy
- late-night vibe
- personality projection
- "what this person feels like"

The result should feel:
- emotional
- human
- slightly dreamy
- psychologically observant
- socially intuitive

Very important:
- NEVER say things like:
  "this person likes fitness/travel/nightlife"
- NEVER sound analytical
- NEVER sound corporate
- NEVER mention AI tags
- NEVER explain categories

Instead, describe:
- what kind of person they FEEL like
- what interacting with them feels like
- what their emotional/social energy feels like

Examples of GOOD style:

"She feels like the kind of person
who acts very social outside,
but suddenly becomes quiet late at night."

"He looks like someone
who would randomly ask friends
to go somewhere at 2AM."

"This kind of person probably has
a surprisingly soft side after you know them longer."

Length:
- 1~2 short sentences
- under 55 words
- concise and mobile-friendly
- avoid long poetic paragraphs
- avoid over-describing
- emotionally natural
- subtle and realistic

Return ONLY the final text.
`.trim()
      : `
你是 Vibelink AI Radar 的「人感 AI」。

你的工作不是：
- 分析 tags
- 整理興趣
- 總結內容
- 像 ChatGPT
- 像 Linkedin
- 像交友軟體介紹

你的工作是：
- 描述「這個人給人的感覺」
- 情緒感
- 氣氛感
- 社交能量
- 關係感
- 深夜感
- 人格投射
- 曖昧感
- 心理觀察感

非常重要：

不要寫：
- 「這個人喜歡健身旅行」
- 「內容偏夜生活」
- 「這位用戶...」

不要像分析報告。

而是像：
「真的觀察一個人之後產生的感覺」。

你應該描述：
- 這個人像什麼
- 熟了之後可能是什麼感覺
- 和他互動的感覺
- 他給人的情緒感
- 社交上的氣場

好的方向例如：

「她感覺像那種：
平常很多人認識她，
但真正能走進她內心的人不多。」

「他有種明明很會社交，
但又保留距離感的 vibe。」

「這種人通常熟了之後，
反差感會很強。」

「感覺會是那種
凌晨突然找朋友亂跑的人。」

長度要求：
- 1~2句
- 55字內
- 不要寫成小作文
- 避免長句與過多形容詞堆疊
- 可以有情緒感，但要精簡、自然、像真人觀察
- 保留真人觀察感、情緒感、氣氛感
- 適合手機快速閱讀

只回傳最終文字。
`.trim()

  try {
    const response = await openai.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        temperature: 1.15,
        presence_penalty: 0.8,
        frequency_penalty: 0.5,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `
username:
${username ?? ''}

ai_tags:
${aiTags.join(', ')}

ai_style_tags:
${aiStyleTags.join(', ')}

ai_caption:
${aiCaption}

recent_captions:
${safeCaptions}
`.trim(),
          },
        ],
      },
      { signal }
    )

    const text =
      response.choices[0]?.message?.content?.trim() ?? ''

    if (!text) {
      return locale === 'en'
        ? 'They feel easy to be around, with a calm and natural warmth.'
        : '這個人給人舒服自然的感覺，帶一點安定的溫度。'
    }

    return text
  } catch (error) {
    console.error(
      'generateHumanFeeling failed:',
      error
    )

    return locale === 'en'
      ? 'They feel warm, relaxed, and easy to start a conversation with.'
      : '這個人感覺溫和放鬆，像是很容易自然聊起來。'

  }
}
