import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.vibecity.vibelink',
  appName: 'Vibelink Social',
  webDir: 'public',
  server: {
    url:
      process.env.CAPACITOR_SERVER_URL ??
      'https://vibelink-web-puce.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
  },
}

export default config
