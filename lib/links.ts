// src/lib/links.ts

// ✅ Vibe會員（固定 Production 網址）
export const MEMBERSHIP_URL = 'https://vibelink-j9m5.vercel.app/'

// ✅ VibeTV App（如果有固定網址也放這）
export const VIBETV_APP_URL = 'https://vibetv-app.vercel.app'

// 🔧 開啟新分頁（統一用）
export function openLink(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}