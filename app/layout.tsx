import type { Metadata, Viewport } from 'next'
import './globals.css'
import ThemeInit from '../components/ThemeInit'
import ReactQueryProvider from '../components/providers/ReactQueryProvider'
import AuthDeepLinkHandler from '../components/auth/AuthDeepLinkHandler'


export const metadata: Metadata = {
  title: 'Vibelink',
  description: 'Vibelink App',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var savedTheme = localStorage.getItem('vibelink-dark-mode');
                document.documentElement.classList.toggle('dark', savedTheme !== 'light');
              } catch (error) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body>
        <ThemeInit />
        <AuthDeepLinkHandler />
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  )
}
