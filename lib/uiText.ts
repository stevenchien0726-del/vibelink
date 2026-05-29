import { LOCALE_STORAGE_KEY, type Locale } from '@/i18n'

export function getUiLocale(): Locale {
  if (typeof window === 'undefined') return 'zh-TW'

  return window.localStorage.getItem(LOCALE_STORAGE_KEY) === 'en'
    ? 'en'
    : 'zh-TW'
}

export function uiText(zh: string, en: string) {
  return getUiLocale() === 'en' ? en : zh
}
