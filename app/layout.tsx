import type { Metadata } from 'next'
import './globals.css'
import ThemeInit from '../components/ThemeInit'
import ReactQueryProvider from '../components/providers/ReactQueryProvider'
import AuthDeepLinkHandler from '../components/auth/AuthDeepLinkHandler'


export const metadata: Metadata = {
  title: 'Vibelink',
  description: 'Vibelink App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
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
