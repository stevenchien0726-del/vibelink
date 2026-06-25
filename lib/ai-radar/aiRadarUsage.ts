import type { User } from '@supabase/supabase-js'

import { supabaseAdmin } from '@/lib/supabase-admin'

const AI_RADAR_COLD_START_LIMIT = 25
const AI_RADAR_COLD_START_WINDOW_MS = 12 * 60 * 60 * 1000
const AI_RADAR_COLDOWN_MS = 12 * 60 * 60 * 1000
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

type CooldownRow = {
  cooldown_until: string
}

export type AIRadarCooldownStatus = {
  coolingDown: boolean
  cooldownUntil: string | null
}

function addMs(date: Date, ms: number) {
  return new Date(date.getTime() + ms)
}

function getUsageWindowStart(now: Date, cooldownUntil?: string | null) {
  const rollingWindowStart = addMs(now, -AI_RADAR_COLD_START_WINDOW_MS)

  if (!cooldownUntil) {
    return rollingWindowStart
  }

  const cooldownUntilTime = Date.parse(cooldownUntil)

  if (!Number.isFinite(cooldownUntilTime) || cooldownUntilTime > now.getTime()) {
    return rollingWindowStart
  }

  return new Date(Math.max(rollingWindowStart.getTime(), cooldownUntilTime))
}

export async function getAIRadarCooldownStatus(
  userId: string,
  now = new Date()
): Promise<AIRadarCooldownStatus> {
  const { data, error } = await supabaseAdmin
    .from('ai_radar_cooldowns')
    .select('cooldown_until')
    .eq('user_id', userId)
    .maybeSingle<CooldownRow>()

  if (error) {
    console.error('AI Radar cooldown check failed:', error)
    return {
      coolingDown: false,
      cooldownUntil: null,
    }
  }

  const cooldownUntil = data?.cooldown_until ?? null

  return {
    coolingDown: Boolean(
      cooldownUntil && Date.parse(cooldownUntil) > now.getTime()
    ),
    cooldownUntil,
  }
}

export function getAIRadarRetryAfterSeconds(
  cooldownUntil: string | null,
  now = new Date()
) {
  if (!cooldownUntil) return 0

  const retryAfterMs = Date.parse(cooldownUntil) - now.getTime()

  return Math.max(0, Math.ceil(retryAfterMs / 1000))
}

export async function recordSuccessfulAIRadarUsage(userId: string) {
  const now = new Date()

  const cooldownStatus = await getAIRadarCooldownStatus(userId, now)

  if (cooldownStatus.coolingDown) {
    return cooldownStatus
  }

  const { error: insertError } = await supabaseAdmin
    .from('ai_radar_usage_events')
    .insert({
      user_id: userId,
      success: true,
      source: 'ai-radar',
      metadata: {},
    })

  if (insertError) {
    console.error('AI Radar usage insert failed:', insertError)
    return cooldownStatus
  }

  const windowStart = getUsageWindowStart(now, cooldownStatus.cooldownUntil)

  const { count, error: countError } = await supabaseAdmin
    .from('ai_radar_usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('success', true)
    .gte('created_at', windowStart.toISOString())

  if (countError) {
    console.error('AI Radar usage count failed:', countError)
    return cooldownStatus
  }

  if ((count ?? 0) < AI_RADAR_COLD_START_LIMIT) {
    return {
      coolingDown: false,
      cooldownUntil: cooldownStatus.cooldownUntil,
    }
  }

  const cooldownUntil = addMs(now, AI_RADAR_COLDOWN_MS).toISOString()

  const { error: cooldownError } = await supabaseAdmin
    .from('ai_radar_cooldowns')
    .upsert(
      {
        user_id: userId,
        cooldown_until: cooldownUntil,
        updated_at: now.toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (cooldownError) {
    console.error('AI Radar cooldown upsert failed:', cooldownError)
    return cooldownStatus
  }

  return {
    coolingDown: true,
    cooldownUntil,
  }
}

async function getFirstLoginAt(user: User) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('created_at')
    .eq('id', user.id)
    .maybeSingle<{ created_at?: string | null }>()

  if (error) {
    console.warn(
      'AI Radar profile created_at lookup failed, falling back to auth user:',
      error
    )
  }

  return data?.created_at ?? user.created_at ?? new Date().toISOString()
}

export async function getAIRadarUsageSummary(user: User) {
  const firstLoginAt = new Date(await getFirstLoginAt(user))
  const now = new Date()
  const elapsedWeeks = Math.max(
    0,
    Math.floor((now.getTime() - firstLoginAt.getTime()) / WEEK_MS)
  )
  const weekStart = addMs(firstLoginAt, elapsedWeeks * WEEK_MS)
  const weekEnd = addMs(weekStart, WEEK_MS)

  const [{ count, error }, cooldownStatus] = await Promise.all([
    supabaseAdmin
      .from('ai_radar_usage_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('success', true)
      .gte('created_at', weekStart.toISOString())
      .lt('created_at', weekEnd.toISOString()),
    getAIRadarCooldownStatus(user.id, now),
  ])

  if (error) {
    console.error('AI Radar weekly usage count failed:', error)
  }

  return {
    planName: '\u5c1a\u672a\u555f\u52d5\u6703\u54e1',
    weeklyLimitLabel: '\u5c1a\u672a\u555f\u52d5\u8a08\u7b97',
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    weeklyUsedCount: count ?? 0,
    cooldownUntil: cooldownStatus.cooldownUntil,
  }
}
