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
  googleLoginFailed: string
  languageTitle: string
  languageSubtitle: string
  googleLoginButton: string
  emailLoginButton: string
  uploadGuideTitle: string
  uploadGuideSubtitle: string
  uploadContent: string
  later: string
  loginRequired: string
  invalidResponse: string
  timeoutError: string
  networkError: string
  similarToUserPrompt: (name: string) => string
}

export const AI_RADAR_I18N: Record<Locale, AIRadarLanguagePack> = {
  'zh-TW': {
    loginTitle: '登入 Vibelink',
    loginSubtitle: '登入後即可使用 AI 雷達與完整功能',
    loginButton: 'GOOGLE 登入',
    loggingIn: '登入中...',
    heroTitle: 'AI 雷達：想找什麼 Vibe 的人？',
    retry: '重新搜尋',
    rewriteTitle: '你也可以試著問',
    inputPlaceholder: 'AI 雷達',
    loadingPrompts: '正在生成提示...',
    loading: {
      searching: '正在搜尋...',
      parsing: '正在分析...',
      generating: '正在整理結果...',
    },
    noResultPrefix: '目前沒有找到完全符合的用戶。',
    noResultSuffix: '可以換個描述再搜尋一次。',
    voiceNotSupported: '目前瀏覽器不支援語音輸入，請改用 Chrome 或其他瀏覽器。',
    googleLoginFailed: 'Google 登入失敗，請稍後再試或使用 Email 登入',
    languageTitle: '選擇語言',
    languageSubtitle: '請選擇您想使用的語言',
    googleLoginButton: '使用 Google 登入',
    emailLoginButton: '使用 Email 登入',
    uploadGuideTitle: '歡迎來到 Vibelink',
    uploadGuideSubtitle:
      '請先上傳第一篇內容，讓 AI 雷達更容易理解你的 Vibe，也讓其他人更容易找到你。',
    uploadContent: '上傳內容',
    later: '稍後再說',
    loginRequired: '請先登入後再使用 AI 雷達。',
    invalidResponse: 'AI 雷達目前回傳格式異常，請再試一次。',
    timeoutError: 'AI 雷達處理時間較久，請再試一次。',
    networkError: 'AI 雷達暫時無法連線，請再試一次。',
    similarToUserPrompt: (name: string) =>
      `請以 ${name} 為參考，找出生活風格、照片氛圍、互動感與整體 Vibe 類似的人。`,
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
    noResultPrefix: 'No users fully matched your search. ',
    noResultSuffix: 'Try a shorter description and search again.',
    voiceNotSupported:
      'Voice input is not supported in this browser. Please try Chrome or another browser.',
    googleLoginFailed:
      'Google login failed. Please try again later or use Email login.',
    languageTitle: 'Choose language',
    languageSubtitle: 'Choose the language you want to use',
    googleLoginButton: 'Continue with Google',
    emailLoginButton: 'Continue with Email',
    uploadGuideTitle: 'Welcome to Vibelink',
    uploadGuideSubtitle:
      'Upload your first post so AI Radar can understand your vibe and help others find you.',
    uploadContent: 'Upload content',
    later: 'Maybe later',
    loginRequired: 'Please log in before using AI Radar.',
    invalidResponse:
      'AI Radar returned an unexpected response. Please try again.',
    timeoutError: 'AI Radar is taking longer than expected. Please try again.',
    networkError: 'AI Radar is temporarily unavailable. Please try again.',
    similarToUserPrompt: (name: string) =>
      `Use ${name} as a reference and find people with a similar lifestyle, photo style, interaction vibe, and overall energy.`,
  },
}

export function getAIRadarText(locale?: Locale) {
  const safeLocale: Locale = locale ?? 'zh-TW'
  return AI_RADAR_I18N[safeLocale] ?? AI_RADAR_I18N['zh-TW']
}