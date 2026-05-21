'use client'

import { motion } from 'framer-motion'
import { Link as LinkIcon } from 'lucide-react'

type ProfileHeaderProps = {
  profile: any
  postCount: number
  followerCount: number
  postsLabel: string
  followersLabel: string
  onOpenLinkPort: () => void
}

export default function ProfileHeader({
  profile,
  postCount,
  followerCount,
  postsLabel,
  followersLabel,
  onOpenLinkPort,
}: ProfileHeaderProps) {
  return (
    <>
      <div className="mb-3 flex items-start justify-between text-[var(--app-text)]">
        <div className="flex gap-3">
          <div className="h-[58px] w-[58px] overflow-hidden rounded-full bg-[var(--app-card)]">
            {profile?.avatar_url && (
              <img
                src={profile.avatar_url}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div>
            <div className="text-[18px] font-medium text-[var(--app-text)]">
              {profile?.display_name || profile?.username || 'Loading...'}
            </div>

            <div className="text-[18px] font-medium text-[var(--app-muted)]">
              {profile?.username || 'Loading...'}
            </div>
          </div>
        </div>

        <div className="flex gap-10 pr-4">
          <div className="flex flex-col items-center">
            <div className="text-[18px] text-[var(--app-text)]">
              {postCount}
            </div>
            <div className="text-[14px] text-[var(--app-muted)]">
              {postsLabel}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-[18px] text-[var(--app-text)]">
              {followerCount}
            </div>
            <div className="text-[14px] text-[var(--app-muted)]">
              {followersLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-[16px] leading-[1.45] text-[var(--app-text)]">
          {profile?.bio || 'Loading...'}
        </div>
      </div>

      <div className="mb-4 flex items-center">
        <motion.button
          type="button"
          onClick={onOpenLinkPort}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="
            inline-flex h-[32px] items-center gap-2
            rounded-[18px] border-[3px] border-[var(--app-muted)]
            bg-transparent px-6 text-[14px] text-[#8B5CF6]
          "
        >
          <LinkIcon size={16} />
          <span className="text-[#8B5CF6]">LINKPORT</span>
        </motion.button>
      </div>
    </>
  )
}