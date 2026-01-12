'use server'

import { createClient } from '@/utils/supabase/server'

export async function debugProjects() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Get all projects with their status
    const { data: allProjects, error } = await supabase
      .from('projects')
      .select('id, title, status, budget, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('[debugProjects] Error:', error)
      return { error: error.message }
    }

    console.log('[debugProjects] Total projects:', allProjects?.length)
    console.log('[debugProjects] Projects:', JSON.stringify(allProjects, null, 2))
    
    // Group by status
    const statusCounts: { [key: string]: number } = {}
    allProjects?.forEach(p => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1
    })
    
    console.log('[debugProjects] Status counts:', statusCounts)
    
    // Check for completed projects specifically
    const completedProjects = allProjects?.filter(p => p.status === 'completed')
    console.log('[debugProjects] Completed projects (lowercase):', completedProjects?.length)
    
    const completedUpperProjects = allProjects?.filter(p => p.status === 'COMPLETED')
    console.log('[debugProjects] COMPLETED projects (uppercase):', completedUpperProjects?.length)
    
    const completedCaseInsensitive = allProjects?.filter(p => 
      p.status?.toLowerCase() === 'completed'
    )
    console.log('[debugProjects] Completed projects (case-insensitive):', completedCaseInsensitive?.length)
    
    return {
      success: true,
      data: {
        totalProjects: allProjects?.length || 0,
        statusCounts,
        completedCount: completedProjects?.length || 0,
        completedUpperCount: completedUpperProjects?.length || 0,
        completedCaseInsensitiveCount: completedCaseInsensitive?.length || 0,
        sampleProjects: allProjects?.slice(0, 3)
      }
    }
  } catch (error) {
    console.error('[debugProjects] Exception:', error)
    return { error: 'Failed to debug projects' }
  }
}
