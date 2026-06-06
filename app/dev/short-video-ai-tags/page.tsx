import { notFound } from 'next/navigation'

export default async function Page() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const { default: ShortVideoAITagsFlow } = await import(
    '@/components/dev/ShortVideoAITagsFlow'
  )

  return <ShortVideoAITagsFlow />
}
