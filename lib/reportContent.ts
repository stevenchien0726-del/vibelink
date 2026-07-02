import { supabase } from '@/lib/supabase'
import { getCachedSession } from '@/lib/authSessionCache'

export type ReportTargetType = 'post' | 'video'

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'violence'
  | 'hate_or_abuse'
  | 'scam_or_fraud'
  | 'self_harm'
  | 'other'

type ReportContentParams = {
  targetType: ReportTargetType
  targetPostId: string
  reason?: ReportReason
  note?: string
}

type ReportContentResult = {
  ok: boolean
  duplicate?: boolean
  message?: string
}

type ReportInsertResponse = {
  error: unknown | null
}

const REPORT_TIMEOUT_MS = 5000

function isDuplicateReportError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const maybeError = error as { code?: string; message?: string }

  return (
    maybeError.code === '23505' ||
    maybeError.message?.toLowerCase().includes('duplicate') === true
  )
}

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('report_content timeout'))
    }, ms)

    Promise.resolve(promise)
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

export async function reportContent({
  targetType,
  targetPostId,
  reason = 'other',
  note,
}: ReportContentParams): Promise<ReportContentResult> {
  try {
    const session = await getCachedSession()

    if (!session?.user?.id) {
      return {
        ok: false,
        message: '請先登入後再檢舉',
      }
    }

    const { error } = await withTimeout<ReportInsertResponse>(
      supabase.from('content_reports').insert({
        reporter_id: session.user.id,
        target_type: targetType,
        target_post_id: targetPostId,
        reason,
        note: note?.trim() || null,
      }) as PromiseLike<ReportInsertResponse>,
      REPORT_TIMEOUT_MS
    )

    if (error) {
      if (isDuplicateReportError(error)) {
        return {
          ok: false,
          duplicate: true,
          message: '你已經檢舉過這則內容',
        }
      }

      console.warn('report_content_error', error)

      return {
        ok: false,
        message: '檢舉送出失敗，請稍後再試',
      }
    }

    return {
      ok: true,
      message: '已收到檢舉，我們會盡快審核',
    }
  } catch (error) {
    console.warn('report_content_error', error)

    return {
      ok: false,
      message: '檢舉送出失敗，請稍後再試',
    }
  }
}
