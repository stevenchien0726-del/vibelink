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

function buildHumanFeelingFallback({
  locale = 'zh-TW',
  aiTags = [],
  aiStyleTags = [],
  aiCaption = '',
  captions = [],
}: Params) {
  const signalText = [
    ...aiTags,
    ...aiStyleTags,
    aiCaption,
    ...captions,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const hasAny = (keywords: string[]) =>
    keywords.some((keyword) => signalText.includes(keyword))

  if (hasAny(['cat', 'dog', 'pet'])) {
    return locale === 'en'
      ? 'They feel soft, easygoing, and comforting to be around.'
      : '這個人帶有柔和、療癒的日常感，互動起來可能比較輕鬆沒有壓力。'
  }

  if (hasAny(['coffee', 'cafe', 'dessert', 'food'])) {
    return locale === 'en'
      ? 'They seem warm, relaxed, and easy to chat with.'
      : '這個人像是很會享受生活細節的人，聊天節奏可能舒服、自然、有溫度。'
  }

  if (hasAny(['travel', 'beach', 'outdoor'])) {
    return locale === 'en'
      ? 'They feel open, relaxed, and curious about life.'
      : '這個人給人自由、放鬆的探索感，像是適合一起分享生活和新鮮事的人。'
  }

  if (hasAny(['nightlife', 'rave', 'techno', 'dj'])) {
    return locale === 'en'
      ? 'They bring social energy without feeling too serious.'
      : '這個人帶有比較強的社交能量，熟了之後可能很會帶動氣氛。'
  }

  if (hasAny(['fashion', 'outfit', 'style'])) {
    return locale === 'en'
      ? 'They have a clear style that feels memorable.'
      : '這個人有明顯的個人風格，給人的第一印象比較有記憶點。'
  }

  if (hasAny(['gym', 'fitness', 'workout'])) {
    return locale === 'en'
      ? 'They feel active, direct, and self-driven.'
      : '這個人給人比較自律、有活力的感覺，生活節奏可能清楚又直接。'
  }

  if (hasAny(['art', 'photo', 'photography', 'creative'])) {
    return locale === 'en'
      ? 'They seem observant, quiet, and detail-sensitive.'
      : '這個人感覺比較有觀察力，像是會注意到生活中細節與氛圍的人。'
  }

  return locale === 'en'
    ? 'Their vibe feels natural, light, and easy to start with.'
    : '這個人整體氛圍自然舒服，適合從輕鬆的日常話題開始互動。'
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
- Every description must be generated from the specific input content.
- Do not use a generic reusable template.
- Do not return the same sentence for different users.
- NEVER say things like:
  "this person likes fitness/travel/nightlife"
- NEVER return generic lines like:
  "They feel warm, relaxed, and easy to start a conversation with."
- NEVER sound analytical
- NEVER sound corporate
- NEVER mention AI tags
- NEVER explain categories

Instead, describe:
- what kind of person they FEEL like
- what interacting with them feels like
- what their emotional/social energy feels like

Examples of GOOD style:

"They feel warm, calm, and easy to approach."

"They seem social, but with a softer private side."

"Their vibe feels relaxed, curious, and low-pressure."

Length:
- 1 sentence
- maximum 2 very short sentences
- under 28 words
- concise and mobile-friendly
- avoid dreamy long paragraphs
- avoid scene-building like "late-night chats over sushi..."
- avoid long phrases after commas
- avoid over-describing
- make it feel like a short human observation, not a mini story
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
- 35～65字
- 不要寫成小作文
- 避免長句與過多形容詞堆疊
- 可以有情緒感，但要精簡、自然、像真人觀察
- 每個人的介紹都必須根據輸入內容生成，不可使用通用模板
- 不可回傳「這個人感覺溫和放鬆，像是很容易自然聊起來」這種泛用句
- 不可讓不同用戶介紹文完全相同
- 保留真人觀察感，但要具體一點
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
      return buildHumanFeelingFallback({
        locale,
        username,
        aiTags,
        aiStyleTags,
        aiCaption,
        captions,
      })
    }

    return text
  } catch (error) {
    console.error(
      'generateHumanFeeling failed:',
      error
    )

    return buildHumanFeelingFallback({
      locale,
      username,
      aiTags,
      aiStyleTags,
      aiCaption,
      captions,
    })
  }
}
