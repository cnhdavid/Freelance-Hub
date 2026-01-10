import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayoutClient from '@/components/dashboard/layout-client'
import { PageTransition } from '@/components/dashboard/page-transition'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get user data (may be null for guest users)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Guest Mode: Allow access without authentication
  // Pass null user to indicate guest mode
  return (
    <DashboardLayoutClient user={user}>
      <PageTransition>{children}</PageTransition>
    </DashboardLayoutClient>
  )
}
