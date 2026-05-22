'use client'

import { motion } from 'framer-motion'

type Props = {
  open: boolean
  text: any
  profile: any
  avatarUploading: boolean
  onClose: () => void
  onSave: () => void
  onChangeProfile: (updater: any) => void
  onUploadAvatar: (file: File) => void
}

export default function EditProfilePage({
  open,
  text,
  profile,
  avatarUploading,
  onClose,
  onSave,
  onChangeProfile,
  onUploadAvatar,
}: Props) {
  if (!open) return null

  return (
    <motion.div
      className="fixed inset-0 z-[650] bg-[var(--app-bg)] text-[var(--app-text)]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 360, damping: 34 }}
    >
      <div className="mx-auto w-full max-w-[430px] px-4 pt-5">
        <div className="mb-6 flex items-center justify-between">
          <button type="button" onClick={onClose} className="text-[16px] text-[var(--app-text)]">
            {text.cancel}
          </button>

          <div className="text-[18px] font-medium text-[var(--app-text)]">
            {text.editProfile}
          </div>

          <button type="button" onClick={onSave} className="text-[16px] font-medium text-[#8B5CF6]">
            {text.save}
          </button>
        </div>

        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="h-[86px] w-[86px] overflow-hidden rounded-full bg-[#d9d9d9]">
            {profile?.avatar_url && (
              <img src={profile.avatar_url} className="h-full w-full object-cover" />
            )}
          </div>

          <label className="cursor-pointer text-[15px] font-medium text-[#8B5CF6]">
            {avatarUploading ? text.uploading : text.changeAvatar}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onUploadAvatar(file)
              }}
            />
          </label>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-[14px] text-[var(--app-muted)]">
            {text.displayName}
            <input
              value={profile?.display_name || ''}
              onChange={(e) =>
                onChangeProfile((prev: any) => ({
                  ...prev,
                  display_name: e.target.value,
                }))
              }
              className="h-[46px] rounded-[14px] border border-[#ddd] bg-white px-4 text-[16px] text-[#222] outline-none"
              placeholder={text.displayNamePlaceholder}
            />
          </label>

          <label className="flex flex-col gap-2 text-[14px] text-[var(--app-muted)]">
            {text.username}
            <input
              value={profile?.username || ''}
              onChange={(e) =>
                onChangeProfile((prev: any) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              className="h-[46px] rounded-[14px] border border-[#ddd] bg-white px-4 text-[16px] text-[#222] outline-none"
              placeholder={text.usernamePlaceholder}
            />
          </label>

          <label className="flex flex-col gap-2 text-[14px] text-[var(--app-muted)]">
            {text.bio}
            <textarea
              value={profile?.bio || ''}
              onChange={(e) =>
                onChangeProfile((prev: any) => ({
                  ...prev,
                  bio: e.target.value,
                }))
              }
              className="min-h-[120px] rounded-[14px] border border-[#ddd] bg-white px-4 py-3 text-[16px] text-[#222] outline-none"
              placeholder={text.bioPlaceholder}
            />
          </label>
        </div>
      </div>
    </motion.div>
  )
}