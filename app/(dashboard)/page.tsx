import { createClient } from '@/utils/supabase/server'
import { DashboardClient } from './dashboard-client'

export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

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
  
  const completedProjects = allProjects.filter(p => p.status === 'completed')
  const totalRevenue = completedProjects.reduce((sum, project) => sum + (project.budget || 0), 0)
  
  const activeProjects = allProjects.filter(p => p.status === 'in_progress' || p.status === 'planning').length
  
  const completionRate = totalProjects > 0 
    ? Math.round((completedProjects.length / totalProjects) * 100) 
    : 0
  
  const averageProjectValue = completedProjects.length > 0
    ? Math.round(totalRevenue / completedProjects.length)
    : 0

  return (
    <DashboardClient
      totalClients={totalClients}
      totalProjects={totalProjects}
      activeProjects={activeProjects}
      totalRevenue={totalRevenue}
      completionRate={completionRate}
      averageProjectValue={averageProjectValue}
      projects={recentProjects}
      allProjects={completedProjects}
    />
  )
}
