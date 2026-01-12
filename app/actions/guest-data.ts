'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function getGuestProjects(guestUserId: string) {
  try {
    console.log('[getGuestProjects] Fetching projects for guest user:', guestUserId)
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[getGuestProjects] Missing Supabase configuration')
      return { error: 'Configuration error' }
    }
    
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        status,
        budget,
        created_at,
        deadline,
        client_id,
        clients (
          name,
          email,
          company
        )
      `)
      .eq('user_id', guestUserId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('[getGuestProjects] Error:', error)
      return { error: error.message }
    }
    
    console.log('[getGuestProjects] Found', projects?.length, 'projects')
    return { success: true, data: projects }
  } catch (error) {
    console.error('[getGuestProjects] Exception:', error)
    return { error: 'Failed to fetch guest projects' }
  }
}

export async function getGuestClients(guestUserId: string) {
  try {
    console.log('[getGuestClients] Fetching clients for guest user:', guestUserId)
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[getGuestClients] Missing Supabase configuration')
      return { error: 'Configuration error' }
    }
    
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', guestUserId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('[getGuestClients] Error:', error)
      return { error: error.message }
    }
    
    console.log('[getGuestClients] Found', clients?.length, 'clients')
    return { success: true, data: clients }
  } catch (error) {
    console.error('[getGuestClients] Exception:', error)
    return { error: 'Failed to fetch guest clients' }
  }
}

export async function getGuestData(guestUserId: string) {
  try {
    console.log('[getGuestData] Fetching data for guest user:', guestUserId)
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[getGuestData] Missing Supabase configuration')
      return { error: 'Configuration error' }
    }
    
    // Use service role to bypass RLS and fetch guest data
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Fetch all data for this guest user
    const [clientsResult, projectsResult, recentProjectsResult] = await Promise.all([
      supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', guestUserId),
      
      supabase
        .from('projects')
        .select('id, budget, status, created_at', { count: 'exact' })
        .eq('user_id', guestUserId),
      
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
        .eq('user_id', guestUserId)
        .order('created_at', { ascending: false })
        .limit(5)
    ])
    
    const totalClients = clientsResult.count || 0
    const totalProjects = projectsResult.count || 0
    const recentProjects = recentProjectsResult.data || []
    const allProjects = projectsResult.data || []
    
    // Get completed projects for revenue
    const { data: completedProjectsData } = await supabase
      .from('projects')
      .select('id, title, status, budget, created_at, client:clients(name)')
      .eq('user_id', guestUserId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
    
    const completedProjects = completedProjectsData || []
    const totalRevenue = completedProjects.reduce((sum, project) => sum + (project.budget || 0), 0)
    
    const activeProjects = allProjects.filter(p => p.status === 'in_progress' || p.status === 'planning').length
    
    const completionRate = totalProjects > 0 
      ? Math.round((completedProjects.length / totalProjects) * 100) 
      : 0
    
    const averageProjectValue = completedProjects.length > 0
      ? Math.round(totalRevenue / completedProjects.length)
      : 0
    
    console.log('[getGuestData] Successfully fetched guest data:', {
      totalClients,
      totalProjects,
      totalRevenue
    })
    
    return {
      success: true,
      data: {
        totalClients,
        totalProjects,
        activeProjects,
        totalRevenue,
        completionRate,
        averageProjectValue,
        recentProjects,
        completedProjects
      }
    }
  } catch (error) {
    console.error('[getGuestData] Error fetching guest data:', error)
    return { error: 'Failed to fetch guest data' }
  }
}
