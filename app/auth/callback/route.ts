import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  console.log('[Auth Callback] Received code:', !!code)
  console.log('[Auth Callback] Origin:', origin)
  console.log('[Auth Callback] Next path:', next)

  if (code) {
    const supabase = await createClient()
    
    console.log('[Auth Callback] Exchanging code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Auth Callback] Exchange failed:', error.message)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    console.log('[Auth Callback] Exchange successful!')
    console.log('[Auth Callback] User ID:', data.user?.id)
    console.log('[Auth Callback] Session expires at:', data.session?.expires_at)

    // Verify session was created
    const { data: { session } } = await supabase.auth.getSession()
    console.log('[Auth Callback] Session verification:', !!session)

    if (!session) {
      console.error('[Auth Callback] Session not found after exchange!')
      return NextResponse.redirect(`${origin}/login?error=session_not_created`)
    }

    console.log('[Auth Callback] Redirecting to:', next)
    return NextResponse.redirect(`${origin}${next}`)
  }

  console.error('[Auth Callback] No code provided')
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
