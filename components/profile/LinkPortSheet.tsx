'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { X, Plus, Trash2, Link as LinkIcon } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  userId: string
  isOwner: boolean
}

type LinkItem = {
  id: string
  title: string
  url: string
}

export default function LinkPortSheet({
  open,
  onClose,
  userId,
  isOwner,
}: Props) {
  const [links, setLinks] = useState<LinkItem[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const isMaxLinks = links.length >= 5

  useEffect(() => {
    if (!open || !userId) return
    loadLinks()
  }, [open, userId])

  async function loadLinks() {
    const { data, error } = await supabase
      .from('linkports')
      .select('id,title,url')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('load linkports error:', error)
      return
    }

    setLinks(data || [])
  }

  function normalizeUrl(url: string) {
    const trimmed = url.trim()
    if (!trimmed) return ''
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed
    }
    return `https://${trimmed}`
  }

  async function addLink() {
    if (!isOwner) return
    if (isMaxLinks) return
    if (!newTitle.trim() || !newUrl.trim()) return

    setLoading(true)

    const { error } = await supabase.from('linkports').insert({
      user_id: userId,
      title: newTitle.trim(),
      url: normalizeUrl(newUrl),
    })

    setLoading(false)

    if (error) {
      console.error('add linkport error:', error)
      return
    }

    setNewTitle('')
    setNewUrl('')
    setIsAddOpen(false)
    loadLinks()
  }

  async function deleteLink(id: string) {
    if (!isOwner) return

    const { error } = await supabase.from('linkports').delete().eq('id', id)

    if (error) {
      console.error('delete linkport error:', error)
      return
    }

    setLinks((prev) => prev.filter((link) => link.id !== id))
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] bg-black/40"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 rounded-t-[24px] bg-[#f3f3f3] px-5 pt-4 pb-6"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="text-[18px] font-medium">LINKPORT</div>

              <button type="button" onClick={onClose} className="active:scale-95">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-[16px] bg-white px-4 py-3"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <LinkIcon size={18} className="shrink-0 text-[#6D28D9]" />

                    <span className="truncate text-[15px] font-medium text-[#111]">
                      {link.title}
                    </span>
                  </a>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => deleteLink(link.id)}
                      className="ml-3 shrink-0 rounded-full p-2 active:scale-95"
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>
              ))}

              {links.length === 0 && (
                <div className="py-8 text-center text-[14px] text-[#888]">
                  尚未新增任何連結
                </div>
              )}
            </div>

            {isOwner && (
              <div className="mt-6">
                <button
                  type="button"
                  disabled={isMaxLinks}
                  onClick={() => {
                    if (isMaxLinks) return
                    setIsAddOpen((prev) => !prev)
                  }}
                  className={`flex h-[44px] w-full items-center justify-center gap-2 text-[17px] active:scale-95 ${
                    isMaxLinks ? 'text-[#aaa]' : 'text-[#111]'
                  }`}
                >
                  <Plus size={20} />
                  {isMaxLinks ? '最多只能新增 5 個連結' : '新增'}
                </button>

                <AnimatePresence>
                  {isAddOpen && !isMaxLinks && (
                    <motion.div
                      className="mt-3 flex flex-col gap-3 overflow-hidden"
                      initial={{ height: 0, opacity: 0, y: -8 }}
                      animate={{ height: 'auto', opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <input
                        placeholder="名稱"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="h-[50px] rounded-[16px] border border-[#ddd] bg-white px-4 text-[15px] text-[#222] outline-none placeholder:text-[#999]"
                      />

                      <input
                        placeholder="連結"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="h-[50px] rounded-[16px] border border-[#ddd] bg-white px-4 text-[15px] text-[#222] outline-none placeholder:text-[#999]"
                      />

                      <button
                        type="button"
                        onClick={addLink}
                        disabled={
                          loading || !newTitle.trim() || !newUrl.trim()
                        }
                        className="flex h-[46px] items-center justify-center rounded-[16px] bg-[#8B5CF6] text-[15px] font-medium text-white active:scale-95 disabled:opacity-40"
                      >
                        {loading ? '儲存中...' : '儲存連結'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}