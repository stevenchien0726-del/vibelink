'use client'

import { motion } from 'framer-motion'

type StoryItem = {
  id: string
  author: string
}

type StoryRowProps = {
  stories: StoryItem[]
  onOpenStory: (story: StoryItem) => void
}

export default function StoryRow({
  stories,
  onOpenStory,
}: StoryRowProps) {
  return (
    <div
      data-horizontal-scroll="true"
      className="scrollbar-hide flex gap-4 overflow-x-auto px-[2px] pb-1"
    >
      {stories.map((story) => (
        <button
          key={story.id}
          type="button"
          onClick={() => onOpenStory(story)}
          className="flex w-[82px] shrink-0 flex-col items-center bg-transparent"
        >
          <motion.div
            layoutId={`story-avatar-${story.id}`}
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 30,
            }}
            className="h-[82px] w-[82px] rounded-full bg-[#d8d8d8]"
          />

          <div className="mt-2 w-full truncate text-center text-[13px] text-[#444]">
            {story.author}
          </div>
        </button>
      ))}
    </div>
  )
}