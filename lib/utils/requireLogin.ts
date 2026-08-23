'use client'

import { createClient } from '@/lib/supabase/client'

export async function requireLogin(next?: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) return true

  const path = next ?? `${window.location.pathname}${window.location.search}`
  const safe = path.startsWith('/') && !path.startsWith('//') ? path : '/'
  window.location.assign(`/login?next=${encodeURIComponent(safe)}`)
  return false
}
