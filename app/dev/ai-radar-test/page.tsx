import { notFound } from 'next/navigation'

export default async function AIRadarTestPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const { default: AIRadarTestClient } = await import('./AIRadarTestClient')

  return <AIRadarTestClient />
}
