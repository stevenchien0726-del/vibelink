'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import {
  ChevronRight,
  ExternalLink,
  Link as LinkIcon,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  userId: string
  isOwner: boolean
}

const LINK_TYPES = [
  'Instagram',
  'Threads',
  'TikTok',
  'YouTube',
  'X',
  'Website',
  'Custom',
] as const

type LinkType = (typeof LINK_TYPES)[number]

type LinkItem = {
  id: string
  type: LinkType
  title: string
  url: string
}

type LinkPortRow = {
  id: string
  type?: string | null
  title: string
  url: string
}

type FormMode = 'list' | 'add' | 'edit'

const MAX_LINKS = 8
const DEFAULT_TYPE: LinkType = 'Custom'
const LINKPORT_READ_TIMEOUT_MS = 8000
const LINKPORT_WRITE_TIMEOUT_MS = 20000

function getLinkType(type?: string | null): LinkType {
  return (
    LINK_TYPES.find(
      (linkType) => linkType.toLowerCase() === type?.toLowerCase()
    ) ?? DEFAULT_TYPE
  )
}

function isValidUuid(value?: string | null) {
  if (!value) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

function normalizeUrl(url: string) {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  return `https://${trimmed}`
}

function getShortUrl(url: string) {
  return normalizeUrl(url).replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function formatLinkRows(rows: LinkPortRow[]): LinkItem[] {
  return rows.map((row) => ({
    id: row.id,
    type: getLinkType(row.type),
    title: row.title,
    url: row.url,
  }))
}

function formatSupabaseError(error: unknown) {
  if (error && typeof error === 'object') {
    const supabaseError = error as {
      message?: unknown
      details?: unknown
      hint?: unknown
      code?: unknown
    }

    return {
      message: supabaseError.message,
      details: supabaseError.details,
      hint: supabaseError.hint,
      code: supabaseError.code,
      error,
    }
  }

  return { error }
}

function withTimeout<T>(task: () => PromiseLike<T>, timeoutMs = 8000) {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`LinkPort request timeout after ${timeoutMs}ms`))
    }, timeoutMs)

    Promise.resolve(task())
      .then((value) => {
        window.clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        window.clearTimeout(timer)
        reject(error)
      })
  })
}

export default function LinkPortSheet({
  open,
  onClose,
  userId,
  isOwner,
}: Props) {
  const [links, setLinks] = useState<LinkItem[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<FormMode>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formType, setFormType] = useState<LinkType>(DEFAULT_TYPE)
  const [formTitle, setFormTitle] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const isMaxLinks = links.length >= MAX_LINKS
  const isFormOpen = formMode === 'add' || formMode === 'edit'
  const isSaveDisabled = saving || formTitle.length > 32 || formUrl.length > 300

  const formTitleText = useMemo(() => {
    if (formMode === 'edit') return '編輯連結'
    return '新增連結'
  }, [formMode])

  const loadLinks = useCallback(
    async (targetUserId?: string | null, silent = false) => {
      const linkUserId = targetUserId ?? (isOwner ? currentUserId : userId)

      if (!isValidUuid(linkUserId)) {
        setLinks([])
        if (isOwner && !silent) {
          setErrorMessage('登入狀態逾時，請重新登入後再試')
        }
        return
      }

      setLoading(true)
      setErrorMessage('')

      try {
        const { data, error } = await withTimeout(() =>
          supabase
            .from('linkports')
            .select('id,title,url,type')
            .eq('user_id', linkUserId)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true })
          ,
          LINKPORT_READ_TIMEOUT_MS
        )

        if (error) throw error

        setLinks(formatLinkRows((data ?? []) as LinkPortRow[]))
      } catch (error) {
        console.warn('[LinkPortSheet] load failed', formatSupabaseError(error))
        if (!silent) {
          setErrorMessage('儲存失敗，請稍後再試')
        }
      } finally {
        setLoading(false)
      }
    },
    [currentUserId, isOwner, userId]
  )

  const resolveCurrentUserId = useCallback(async () => {
    if (!isOwner) return null

    const { data, error } = await withTimeout(
      () => supabase.auth.getUser(),
      6000
    )

    if (error) throw error

    return data.user?.id ?? null
  }, [isOwner])

  const getInitialLinkUserId = useCallback(() => {
    if (isValidUuid(userId)) return userId
    return null
  }, [userId])

  useEffect(() => {
    let cancelled = false

    async function openSheet() {
      if (!open) {
        resetForm()
        setCurrentUserId(null)
        setErrorMessage('')
        return
      }

      if (!isOwner) {
        await loadLinks(userId)
        return
      }

      const propUserId = getInitialLinkUserId()

      if (propUserId) {
        setCurrentUserId(propUserId)
        await loadLinks(propUserId)
        return
      }

      setLoading(true)
      setErrorMessage('')

      try {
        const id = await resolveCurrentUserId()

        if (cancelled) return

        if (!isValidUuid(id)) {
          setCurrentUserId(null)
          setLinks([])
          setErrorMessage('登入狀態逾時，請重新登入後再試')
          return
        }

        setCurrentUserId(id)
        await loadLinks(id)
      } catch (error) {
        if (!cancelled) {
          console.warn(
            '[LinkPortSheet] resolve user failed',
            formatSupabaseError(error)
          )
          setCurrentUserId(null)
          setLinks([])
          setErrorMessage('登入狀態逾時，請重新登入後再試')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    openSheet()

    return () => {
      cancelled = true
    }
  }, [
    getInitialLinkUserId,
    isOwner,
    loadLinks,
    open,
    resolveCurrentUserId,
    userId,
  ])

  function resetForm() {
    setFormMode('list')
    setEditingId(null)
    setFormType(DEFAULT_TYPE)
    setFormTitle('')
    setFormUrl('')
  }

  function startAdd() {
    if (!isOwner || isMaxLinks) return
    setErrorMessage('')
    setEditingId(null)
    setFormType(DEFAULT_TYPE)
    setFormTitle('')
    setFormUrl('')
    setFormMode('add')
  }

  function startEdit(link: LinkItem) {
    if (!isOwner) return
    setErrorMessage('')
    setEditingId(link.id)
    setFormType(link.type)
    setFormTitle(link.title)
    setFormUrl(link.url)
    setFormMode('edit')
  }

  function validateForm() {
    if (!formTitle.trim()) {
      setErrorMessage('請輸入標題')
      return false
    }

    if (!formUrl.trim()) {
      setErrorMessage('請輸入連結')
      return false
    }

    if (formTitle.length > 32 || formUrl.length > 300) {
      setErrorMessage('連結內容太長')
      return false
    }

    return true
  }

  async function saveLink() {
    if (saving) return
    if (!isOwner) return

    const linkUserId = currentUserId ?? (isValidUuid(userId) ? userId : null)

    if (!isValidUuid(linkUserId)) {
      setErrorMessage('登入狀態逾時，請重新登入後再試')
      return
    }

    if (formMode === 'add' && isMaxLinks) {
      setErrorMessage(`最多只能新增 ${MAX_LINKS} 個連結`)
      return
    }

    if (!validateForm()) return

    const nextLink = {
      type: formType,
      title: formTitle.trim().slice(0, 32),
      url: normalizeUrl(formUrl).slice(0, 300),
    }

    setSaving(true)
    setErrorMessage('')

    try {
      if (formMode === 'add') {
        const { error } = await withTimeout(
          () =>
            supabase.from('linkports').insert({
              user_id: linkUserId,
              type: nextLink.type,
              title: nextLink.title,
              url: nextLink.url,
            }),
          LINKPORT_WRITE_TIMEOUT_MS
        )

        if (error) throw error
      }

      if (formMode === 'edit' && editingId) {
        const { error } = await withTimeout(
          () =>
            supabase
              .from('linkports')
              .update({
                type: nextLink.type,
                title: nextLink.title,
                url: nextLink.url,
              })
              .eq('id', editingId)
              .eq('user_id', linkUserId),
          LINKPORT_WRITE_TIMEOUT_MS
        )

        if (error) throw error
      }

      void loadLinks(linkUserId, true)
      resetForm()
      setErrorMessage('')
    } catch (error) {
      console.warn('[LinkPortSheet] save failed', formatSupabaseError(error))
      setErrorMessage('儲存失敗，請稍後再試')
    } finally {
      setSaving(false)
    }
  }

  async function deleteLink(id: string) {
    if (!isOwner || saving) return

    const linkUserId = currentUserId ?? (isValidUuid(userId) ? userId : null)

    if (!isValidUuid(linkUserId)) {
      setErrorMessage('登入狀態逾時，請重新登入後再試')
      return
    }

    if (!window.confirm('確定要刪除此連結嗎？')) return

    setSaving(true)
    setErrorMessage('')

    try {
      const { error } = await withTimeout(() =>
        supabase
          .from('linkports')
          .delete()
          .eq('id', id)
          .eq('user_id', linkUserId)
      )

      if (error) throw error

      await loadLinks(linkUserId)
      resetForm()
      setErrorMessage('')
    } catch (error) {
      console.warn('[LinkPortSheet] delete failed', formatSupabaseError(error))
      setErrorMessage('儲存失敗，請稍後再試')
    } finally {
      setSaving(false)
    }
  }

  function openExternalLink(url: string) {
    window.open(normalizeUrl(url), '_blank', 'noopener,noreferrer')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-end justify-center bg-black/45 backdrop-blur-[8px]"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            onClick={(event) => event.stopPropagation()}
            className="max-h-[86vh] w-full max-w-[430px] overflow-hidden rounded-t-[28px] border border-white/10 bg-[#101014] text-white shadow-[0_-18px_60px_rgba(0,0,0,0.36)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="text-[18px] font-semibold tracking-[0.08em] text-white">
                LINKPORT
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 active:scale-95"
              >
                <X size={22} />
              </button>
            </div>

            <div className="max-h-[calc(86vh-69px)] overflow-y-auto px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {errorMessage && (
                <div className="mb-4 rounded-[16px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-100">
                  {errorMessage}
                </div>
              )}

              {isFormOpen ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-[16px] font-medium text-white">
                      {formTitleText}
                    </div>
                    <div className="mt-1 text-[13px] text-white/45">
                      最多可新增 {MAX_LINKS} 個個人連結
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-[13px] text-white/55">
                      平台類型
                    </span>
                    <select
                      value={formType}
                      onChange={(event) =>
                        setFormType(getLinkType(event.target.value))
                      }
                      className="h-[50px] w-full rounded-[16px] border border-white/10 bg-white/[0.04] px-4 text-[15px] text-white outline-none focus:border-[#a855f7]/60"
                    >
                      {LINK_TYPES.map((type) => (
                        <option key={type} value={type} className="bg-[#101014]">
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] text-white/55">
                      標題
                    </span>
                    <input
                      value={formTitle}
                      maxLength={32}
                      onChange={(event) => setFormTitle(event.target.value)}
                      placeholder="連結名稱，例如 Instagram"
                      className="h-[50px] w-full rounded-[16px] border border-white/10 bg-white/[0.04] px-4 text-[15px] text-white outline-none placeholder:text-white/28 focus:border-[#a855f7]/60"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] text-white/55">
                      連結
                    </span>
                    <input
                      value={formUrl}
                      maxLength={300}
                      onChange={(event) => setFormUrl(event.target.value)}
                      placeholder="https://example.com"
                      className="h-[50px] w-full rounded-[16px] border border-white/10 bg-white/[0.04] px-4 text-[15px] text-white outline-none placeholder:text-white/28 focus:border-[#a855f7]/60"
                    />
                  </label>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={resetForm}
                      className="flex h-[46px] flex-1 items-center justify-center rounded-[16px] border border-white/10 text-[15px] text-white/75 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      取消
                    </button>

                    <button
                      type="button"
                      disabled={isSaveDisabled}
                      onClick={saveLink}
                      className="flex h-[46px] flex-1 items-center justify-center rounded-[16px] bg-[#8B5CF6] text-[15px] font-medium text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {saving ? '儲存中...' : '儲存'}
                    </button>
                  </div>

                  {formMode === 'edit' && editingId && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => deleteLink(editingId)}
                      className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[16px] text-[14px] text-red-200/80 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={16} />
                      刪除連結
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  {loading ? (
                    <div className="py-12 text-center text-[14px] text-white/45">
                      載入中...
                    </div>
                  ) : links.length > 0 ? (
                    <div className="space-y-[10px]">
                      {links.map((link) => (
                        <div
                          key={link.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => openExternalLink(link.url)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              openExternalLink(link.url)
                            }
                          }}
                          className="flex w-full items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition hover:bg-white/[0.07] active:scale-[0.99]"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#a855f7]/12 text-[11px] font-semibold text-[#a855f7]">
                            {link.type === 'Custom' ? (
                              <LinkIcon size={18} />
                            ) : (
                              link.type.slice(0, 2).toUpperCase()
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[15px] font-medium text-white">
                              {link.title}
                            </div>
                            <div className="mt-1 truncate text-[12px] text-white/40">
                              {getShortUrl(link.url)}
                            </div>
                          </div>

                          {isOwner && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                startEdit(link)
                              }}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 active:scale-95"
                            >
                              <Pencil size={16} />
                            </button>
                          )}

                          {isOwner ? (
                            <ExternalLink
                              size={17}
                              className="shrink-0 text-white/35"
                            />
                          ) : (
                            <ChevronRight
                              size={19}
                              className="shrink-0 text-white/35"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-[14px] text-white/45">
                        尚未新增任何連結
                      </div>
                    </div>
                  )}

                  {isOwner && (
                    <div className="mt-6 text-center">
                      {isMaxLinks ? (
                        <div className="text-[14px] text-white/45">
                          最多只能新增 {MAX_LINKS} 個連結
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={startAdd}
                          className="inline-flex h-[40px] items-center justify-center gap-1 rounded-full px-4 text-[15px] text-white/90 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus size={17} />
                          新增
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
