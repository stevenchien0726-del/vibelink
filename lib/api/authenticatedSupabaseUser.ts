import type { User } from '@supabase/supabase-js'

import { supabaseAdmin } from '@/lib/supabase-admin'

type AuthenticatedUserResult =
  | {
      ok: true
      accessToken: string
      user: User
    }
  | {
      ok: false
      error: 'MISSING_AUTHORIZATION' | 'INVALID_TOKEN'
    }

export async function getAuthenticatedSupabaseUser(
  req: Request
): Promise<AuthenticatedUserResult> {
  const authorization = req.headers.get('authorization')?.trim() ?? ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  const accessToken = match?.[1]?.trim()

  if (!accessToken) {
    return {
      ok: false,
      error: 'MISSING_AUTHORIZATION',
    }
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(accessToken)

  if (error || !user) {
    return {
      ok: false,
      error: 'INVALID_TOKEN',
    }
  }

  return {
    ok: true,
    accessToken,
    user,
  }
}
