import { createClient } from '@/utils/supabase/server'
import { DashboardClient } from './dashboard-client'
import { DemoDataBanner } from '@/components/dashboard/demo-data-banner'
import { SeedDataLink } from '@/components/dashboard/seed-data-link'
import { GuestDataLoader } from '@/components/dashboard/guest-data-loader'
import { hasDemoData } from '@/app/actions/demo-data'

export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Guest Mode: Use client-side loader to fetch guest data if available
  if (!user) {
    return <GuestDataLoader />
  }

  // Check if user has any data
  const { hasData } = await hasDemoData()

  const [clientsResult, projectsResult, recentProjectsResult] = await Promise.all([
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    
    supabase
      .from('projects')
      .select('id, budget, status, created_at', { count: 'exact' })
      .eq('user_id', user.id),
    
    supabase
      .from('projects')
      .select(`
        id,
        title,
        status,
        budget,
        created_at,
        client:clients(name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  const totalClients = clientsResult.count || 0
  const totalProjects = projectsResult.count || 0
  const recentProjects = recentProjectsResult.data || []

  const allProjects = projectsResult.data || []
  
  // For revenue chart, we need all completed projects with full details
  const { data: completedProjectsData, error: completedError } = await supabase
    .from('projects')
    .select('id, title, status, budget, created_at, client:clients(name)')
    .eq('user_id', user.id)
    .ilike('status', 'completed') // Case-insensitive match
    .order('created_at', { ascending: false })
  
  if (completedError) {
    console.error('[Dashboard] Error fetching completed projects:', completedError)
  }
  
  const completedProjects = completedProjectsData || []
  console.log('[Dashboard] Completed projects count:', completedProjects.length)
  console.log('[Dashboard] Completed projects:', completedProjects.map(p => ({ 
    title: p.title, 
    status: p.status, 
    budget: p.budget,
    created_at: p.created_at 
  })))
  
  const totalRevenue = completedProjects.reduce((sum, project) => {
    const budget = Number(project.budget) || 0
    console.log(`[Dashboard] Adding ${project.title}: $${budget}`)
    return sum + budget
  }, 0)
  
  console.log('[Dashboard] Total revenue calculated:', totalRevenue)
  
  const activeProjects = allProjects.filter(p => p.status === 'in_progress' || p.status === 'planning').length
  
  const completionRate = totalProjects > 0 
    ? Math.round((completedProjects.length / totalProjects) * 100) 
    : 0
  
  const averageProjectValue = completedProjects.length > 0
    ? Math.round(totalRevenue / completedProjects.length)
    : 0

  return (
    <>
      {/* Always show seed link for testing - remove after verification */}
      <div className="mb-4 flex justify-end">
        <SeedDataLink />
      </div>
      
      {!hasData && <DemoDataBanner onDataSeeded={() => {}} />}
      <DashboardClient
        totalClients={totalClients}
        totalProjects={totalProjects}
        activeProjects={activeProjects}
        totalRevenue={totalRevenue}
        completionRate={completionRate}
        averageProjectValue={averageProjectValue}
        projects={recentProjects}
        allProjects={completedProjects}
        isGuest={false}
      />
    </>
  )
}
