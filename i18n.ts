export type Locale = 'zh-TW' | 'en'

export const LOCALE_STORAGE_KEY = 'vibelink_locale'

export const dictionaries = {
  'zh-TW': {
    nav: {
      home: '首頁',
      ai: 'AI雷達',
      message: '訊息',
      profile: '個人',
      tv: 'Vibe TV',
    },
    settings: {
      language: '語言',
      traditionalChinese: '繁中',
      english: 'English',
    },
    aiRadar: {
      title: 'AI雷達：想找什麼Vibe的人?',
      prompt1: '幫我找可愛奶狗弟弟',
      prompt2: '喜歡大自然的女生',
      prompt3: '身材性感內建男模特',
      placeholder: 'AI雷達',
      loginTitle: '登入 Vibelink',
      loginSubtitle: '登入後即可使用 AI 雷達與完整功能',
      googleLogin: 'GOOGLE 登入',
      loggingIn: '登入中...',
    },
  },
  en: {
    nav: {
      home: 'Home',
      ai: 'AI Radar',
      message: 'Messages',
      profile: 'Profile',
      tv: 'Vibe TV',
    },
    settings: {
      language: 'Language',
      traditionalChinese: '繁中',
      english: 'English',
    },
    aiRadar: {
      title: 'AI Radar: What kind of vibe are you looking for?',
      prompt1: 'Find me a cute softboy',
      prompt2: 'Girls who love nature',
      prompt3: 'Sexy model-type guys',
      placeholder: 'AI Radar',
      loginTitle: 'Log in to Vibelink',
      loginSubtitle: 'Log in to use AI Radar and all features',
      googleLogin: 'Continue with Google',
      loggingIn: 'Logging in...',
    },
  },
} as const