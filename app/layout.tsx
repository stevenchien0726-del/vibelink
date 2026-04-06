import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}