'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
type FormMode = 'list' | 'add' | 'edit'

type LinkItem = {
  id: string
  type: LinkType
  title: string
  url: string
}

type LinkPortRow = {
  id: string
  type?: string | null
  title?: string | null
  url?: string | null
}

const MAX_LINKS = 8
const DEFAULT_TYPE: LinkType = 'Custom'
const REQUEST_TIMEOUT_MS = 8000

function isValidUuid(value?: string | null) {
  if (!value) return false

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

function getLinkType(type?: string | null): LinkType {
  const normalizedType = type?.trim().toLowerCase()

  return (
    LINK_TYPES.find((item) => item.toLowerCase() === normalizedType) ??
    DEFAULT_TYPE
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
  return rows
    .filter((row) => row.id && row.title && row.url)
    .map((row) => ({
      id: row.id,
      type: getLinkType(row.type),
      title: row.title ?? '',
      url: row.url ?? '',
    }))
}

function getReadableError(error: unknown) {
  if (error instanceof Error) return error.message

  if (error && typeof error === 'object') {
    const item = error as {
      message?: unknown
      details?: unknown
      hint?: unknown
      code?: unknown
    }

    return JSON.stringify({
      message: item.message,
      details: item.details,
      hint: item.hint,
      code: item.code,
    })
  }

  return String(error)
}

function logSupabaseError(label: string, error: unknown) {
  if (error && typeof error === 'object') {
    const item = error as {
      message?: unknown
      details?: unknown
      hint?: unknown
      code?: unknown
    }

    console.warn(label, {
      message: item.message,
      details: item.details,
      hint: item.hint,
      code: item.code,
      error,
    })
    return
  }

  console.warn(label, error)
}

async function withTimeout<T>(
  task: () => PromiseLike<T>,
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<T> {
  let timer: number | null = null

  try {
    return await new Promise<T>((resolve, reject) => {
      timer = window.setTimeout(() => {
        reject(new Error(`LinkPort request timeout after ${timeoutMs}ms`))
      }, timeoutMs)

      Promise.resolve(task())
        .then(resolve)
        .catch(reject)
    })
  } finally {
    if (timer) {
      window.clearTimeout(timer)
    }
  }
}

function getTypeBadge(type: LinkType) {
  if (type === 'Custom') return <LinkIcon size={18} />

  if (type === 'Instagram') return 'IG'
  if (type === 'Threads') return 'TH'
  if (type === 'TikTok') return 'TT'
  if (type === 'YouTube') return 'YT'
  if (type === 'Website') return 'WEB'

  return type.slice(0, 2).toUpperCase()
}

export default function LinkPortSheet({
  open,
  onClose,
  userId,
  isOwner,
}: Props) {
  const mountedRef = useRef(false)
  const requestSeqRef = useRef(0)

  const [links, setLinks] = useState<LinkItem[]>([])
  const [formMode, setFormMode] = useState<FormMode>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formType, setFormType] = useState<LinkType>(DEFAULT_TYPE)
  const [formTitle, setFormTitle] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const isFormOpen = formMode === 'add' || formMode === 'edit'
  const isMaxLinks = links.length >= MAX_LINKS
  const canUseLinkPort = isValidUuid(userId)

  const formTitleText = useMemo(() => {
    if (formMode === 'edit') return '編輯連結'
    return '新增連結'
  }, [formMode])

  const isSaveDisabled = useMemo(() => {
    return (
      saving ||
      !formTitle.trim() ||
      !formUrl.trim() ||
      formTitle.length > 32 ||
      formUrl.length > 300
    )
  }, [formTitle, formUrl, saving])

  const resetForm = useCallback(() => {
    setFormMode('list')
    setEditingId(null)
    setFormType(DEFAULT_TYPE)
    setFormTitle('')
    setFormUrl('')
  }, [])

  const loadLinks = useCallback(async () => {
    if (!isValidUuid(userId)) {
      setLinks([])
      if (isOwner) {
        setErrorMessage('登入狀態逾時，請重新登入後再試')
      }
      return
    }

    const seq = requestSeqRef.current + 1
    requestSeqRef.current = seq

    setLoading(true)
    setErrorMessage('')

    try {
      let query = supabase
        .from('linkports')
        .select('id,title,url,type')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(MAX_LINKS)

      if (!isOwner) {
        query = query.eq('is_visible', true)
      }

      const { data, error } = await withTimeout(() => query, REQUEST_TIMEOUT_MS)

      if (requestSeqRef.current !== seq) return
      if (error) throw error

      if (!mountedRef.current) return

      setLinks(formatLinkRows((data ?? []) as LinkPortRow[]))
    } catch (error) {
      logSupabaseError('[LinkPortSheet] load failed', error)

      if (!mountedRef.current) return

      setLinks([])
      setErrorMessage('讀取失敗，請稍後再試')
    } finally {
      if (mountedRef.current && requestSeqRef.current === seq) {
        setLoading(false)
      }
    }
  }, [isOwner, userId])

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!open) {
      resetForm()
      setErrorMessage('')
      setLoading(false)
      setSaving(false)
      return
    }

    loadLinks()
  }, [loadLinks, open, resetForm])

  function startAdd() {
    if (!isOwner) return

    if (!canUseLinkPort) {
      setErrorMessage('登入狀態逾時，請重新登入後再試')
      return
    }

    if (isMaxLinks) {
      setErrorMessage(`最多只能新增 ${MAX_LINKS} 個連結`)
      return
    }

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
    const nextTitle = formTitle.trim()
    const nextUrl = formUrl.trim()

    if (!nextTitle) {
      setErrorMessage('請輸入標題')
      return false
    }

    if (!nextUrl) {
      setErrorMessage('請輸入連結')
      return false
    }

    if (nextTitle.length > 32) {
      setErrorMessage('標題最多 32 字')
      return false
    }

    if (nextUrl.length > 300) {
      setErrorMessage('連結最多 300 字')
      return false
    }

    return true
  }

  async function saveLink() {
    if (saving) return
    if (!isOwner) return

    if (!isValidUuid(userId)) {
      setErrorMessage('登入狀態逾時，請重新登入後再試')
      return
    }

    if (formMode === 'add' && isMaxLinks) {
      setErrorMessage(`最多只能新增 ${MAX_LINKS} 個連結`)
      return
    }

    if (!validateForm()) return

    const nextLink = {
      user_id: userId,
      type: formType,
      title: formTitle.trim().slice(0, 32),
      url: normalizeUrl(formUrl).slice(0, 300),
      is_visible: true,
      sort_order: formMode === 'add' ? links.length : undefined,
    }

    setSaving(true)
    setErrorMessage('')

    try {
      if (formMode === 'add') {
        const tempId = crypto.randomUUID()
        const newLinkItem = {
          id: tempId,
          type: nextLink.type,
          title: nextLink.title,
          url: nextLink.url,
        }

        const { error } = await withTimeout(() =>
          supabase
            .from('linkports')
            .insert({
              id: tempId,
              user_id: nextLink.user_id,
              type: nextLink.type,
              title: nextLink.title,
              url: nextLink.url,
              is_visible: nextLink.is_visible,
              sort_order: nextLink.sort_order ?? 0,
            })
        )

        if (error) throw error

        if (mountedRef.current) {
          setLinks((prev) => {
            const next = [...prev, newLinkItem]
            return next.slice(0, MAX_LINKS)
          })
        }
      }

      if (formMode === 'edit' && editingId) {
        const { error } = await withTimeout(() =>
          supabase
            .from('linkports')
            .update({
              type: nextLink.type,
              title: nextLink.title,
              url: nextLink.url,
            })
            .eq('id', editingId)
            .eq('user_id', userId)
        )

        if (error) throw error

        if (mountedRef.current) {
          setLinks((prev) =>
            prev.map((item) =>
              item.id === editingId
                ? {
                    ...item,
                    type: nextLink.type,
                    title: nextLink.title,
                    url: nextLink.url,
                  }
                : item
            )
          )
        }
      }

      if (!mountedRef.current) return

      resetForm()
      setErrorMessage('')
    } catch (error) {
      logSupabaseError('[LinkPortSheet] save failed', error)

      if (!mountedRef.current) return

      const readableError = getReadableError(error)

      if (readableError.includes('row-level security')) {
        setErrorMessage('沒有儲存權限，請重新登入後再試')
      } else if (readableError.includes('timeout')) {
        setErrorMessage('連線逾時，請稍後再試')
      } else {
        setErrorMessage('儲存失敗，請稍後再試')
      }
    } finally {
      if (mountedRef.current) {
        setSaving(false)
      }
    }
  }

  async function deleteLink(id: string) {
    if (!isOwner || saving) return

    if (!isValidUuid(userId)) {
      setErrorMessage('登入狀態逾時，請重新登入後再試')
      return
    }

    if (!window.confirm('確定要刪除此連結嗎？')) return

    setSaving(true)
    setErrorMessage('')

    try {
      const { error } = await withTimeout(() =>
        supabase.from('linkports').delete().eq('id', id).eq('user_id', userId)
      )

      if (error) throw error

      if (!mountedRef.current) return

      setLinks((prev) => prev.filter((item) => item.id !== id))
      resetForm()
      setErrorMessage('')
    } catch (error) {
      logSupabaseError('[LinkPortSheet] delete failed', error)

      if (!mountedRef.current) return

      setErrorMessage('刪除失敗，請稍後再試')
    } finally {
      if (mountedRef.current) {
        setSaving(false)
      }
    }
  }

  function openExternalLink(url: string) {
    const normalizedUrl = normalizeUrl(url)

    if (!normalizedUrl) return

    window.open(normalizedUrl, '_blank', 'noopener,noreferrer')
  }

  function handleClose() {
    if (saving) return
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-end justify-center bg-black/45 backdrop-blur-[8px]"
          onClick={handleClose}
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
                onClick={handleClose}
                disabled={saving}
                aria-label="Close LINKPORT"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X size={22} />
              </button>
            </div>

            <div className="max-h-[calc(86vh-69px)] overflow-y-auto px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {errorMessage && (
                <div className="mb-4 rounded-[16px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-[13px] leading-[1.5] text-red-100">
                  {errorMessage}
                </div>
              )}

              {!canUseLinkPort && isOwner && (
                <div className="rounded-[16px] border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-[13px] leading-[1.5] text-yellow-100">
                  目前登入狀態尚未完成，請重新整理或重新登入後再試。
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
                      disabled={saving}
                      onChange={(event) =>
                        setFormType(getLinkType(event.target.value))
                      }
                      className="h-[50px] w-full rounded-[16px] border border-white/10 bg-white/[0.04] px-4 text-[15px] text-white outline-none focus:border-[#a855f7]/60 disabled:cursor-not-allowed disabled:opacity-50"
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
                      disabled={saving}
                      onChange={(event) => setFormTitle(event.target.value)}
                      placeholder="連結名稱，例如 Instagram"
                      className="h-[50px] w-full rounded-[16px] border border-white/10 bg-white/[0.04] px-4 text-[15px] text-white outline-none placeholder:text-white/28 focus:border-[#a855f7]/60 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    <div className="mt-1 text-right text-[11px] text-white/30">
                      {formTitle.length}/32
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] text-white/55">
                      連結
                    </span>

                    <input
                      value={formUrl}
                      maxLength={300}
                      disabled={saving}
                      onChange={(event) => setFormUrl(event.target.value)}
                      placeholder="https://example.com"
                      className="h-[50px] w-full rounded-[16px] border border-white/10 bg-white/[0.04] px-4 text-[15px] text-white outline-none placeholder:text-white/28 focus:border-[#a855f7]/60 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    <div className="mt-1 text-right text-[11px] text-white/30">
                      {formUrl.length}/300
                    </div>
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
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
                      <div className="mt-4 text-[14px] text-white/45">
                        載入中...
                      </div>
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
                            {getTypeBadge(link.type)}
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
                          disabled={saving || !canUseLinkPort}
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
