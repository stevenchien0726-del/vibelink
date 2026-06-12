import type { Locale } from '@/i18n'

export type AIRadarLanguagePack = {
  loginTitle: string
  loginSubtitle: string
  loginButton: string
  loggingIn: string
  heroTitle: string
  retry: string
  rewriteTitle: string
  inputPlaceholder: string
  loadingPrompts: string
  loading: {
    searching: string
    parsing: string
    generating: string
  }
  noResultPrefix: string
  noResultSuffix: string
  voiceNotSupported: string
  similarToUserPrompt: (name: string) => string
}

export const AI_RADAR_I18N: Record<Locale, AIRadarLanguagePack> = {
  'zh-TW': {
    loginTitle: '登入 Vibelink',
    loginSubtitle: '登入後即可使用 AI 雷達與完整功能',
    loginButton: 'GOOGLE 登入',
    loggingIn: '登入中...',
    heroTitle: 'AI雷達：想找什麼Vibe的人?',
    retry: '重新搜尋',
    rewriteTitle: '你也可以試試這樣問',
    inputPlaceholder: 'AI雷達',
    loadingPrompts: '生成提示詞中...',
    loading: {
      searching: '正在搜索...',
      parsing: '正在解析...',
      generating: '準備產生結果...',
    },
    noResultPrefix: '目前沒有找到完全符合「',
    noResultSuffix: '」的用戶，你可以換更簡短的描述再試一次。',
    voiceNotSupported: '目前瀏覽器不支援語音輸入，建議使用 Chrome 測試。',
    similarToUserPrompt: (name: string) =>
      `以 ${name} 為參考，幫我找生活風格、照片氣質、互動感和整體 Vibe 相似的人`,
  },

  en: {
    loginTitle: 'Log in to Vibelink',
    loginSubtitle: 'Log in to use AI Radar and all features',
    loginButton: 'Continue with Google',
    loggingIn: 'Logging in...',
    heroTitle: 'AI Radar: What kind of vibe are you looking for?',
    retry: 'Search again',
    rewriteTitle: 'You can also try asking',
    inputPlaceholder: 'AI Radar',
    loadingPrompts: 'Generating prompts...',
    loading: {
      searching: 'Searching...',
      parsing: 'Analyzing...',
      generating: 'Preparing results...',
    },
    noResultPrefix: 'No users fully matched “',
    noResultSuffix: '”. Try a shorter description and search again.',
    voiceNotSupported:
      'Voice input is not supported in this browser. Please try Chrome.',
    similarToUserPrompt: (name: string) =>
      `Use ${name} as a reference and find people with a similar lifestyle, photo style, interaction vibe, and overall energy.`,
  },
}

export function getAIRadarText(locale?: Locale) {
  const safeLocale: Locale = locale ?? 'zh-TW'
  return AI_RADAR_I18N[safeLocale] ?? AI_RADAR_I18N['zh-TW']
}
