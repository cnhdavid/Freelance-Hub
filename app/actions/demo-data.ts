'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const demoClients = [
  { name: 'TechCorp Solutions', email: 'contact@techcorp.com', company: 'TechCorp Solutions Inc.', status: 'active' },
  { name: 'Digital Marketing Agency', email: 'hello@dma.co', company: 'DMA Digital', status: 'active' },
  { name: 'Startup Ventures', email: 'projects@startup.io', company: 'Startup Ventures LLC', status: 'active' },
  { name: 'E-commerce Plus', email: 'info@ecommerceplus.com', company: 'E-commerce Plus', status: 'prospect' },
  { name: 'Financial Services Co', email: 'tech@finserv.net', company: 'Financial Services Co', status: 'active' },
]

const demoProjects = [
  {
    title: 'E-commerce Website Redesign',
    description: 'Complete redesign of the company e-commerce platform with modern UI/UX',
    budget: 15000,
    status: 'completed',
    deadline: '2025-10-15',
    start_date: '2025-08-01',
    actual_end_date: '2025-10-12'
  },
  {
    title: 'Mobile App Development',
    description: 'Native iOS and Android app for customer engagement',
    budget: 25000,
    status: 'completed',
    deadline: '2025-09-30',
    start_date: '2025-06-15',
    actual_end_date: '2025-09-28'
  },
  {
    title: 'API Integration Project',
    description: 'Third-party payment gateway and CRM integration',
    budget: 8500,
    status: 'completed',
    deadline: '2025-11-20',
    start_date: '2025-10-01',
    actual_end_date: '2025-11-18'
  },
  {
    title: 'Content Management System',
    description: 'Custom CMS for blog and content management',
    budget: 12000,
    status: 'completed',
    deadline: '2025-12-28',
    start_date: '2025-10-20',
    actual_end_date: '2025-12-28'
  },
  {
    title: 'SEO Optimization Campaign',
    description: 'Comprehensive SEO audit and implementation',
    budget: 6500,
    status: 'completed',
    deadline: '2026-01-08',
    start_date: '2025-11-01',
    actual_end_date: '2026-01-08'
  },
  {
    title: 'Database Migration Service',
    description: 'Legacy database migration to cloud infrastructure',
    budget: 18000,
    status: 'completed',
    deadline: '2025-08-30',
    start_date: '2025-07-01',
    actual_end_date: '2025-08-25'
  },
  {
    title: 'Social Media Dashboard',
    description: 'Analytics dashboard for social media management',
    budget: 9500,
    status: 'in_progress',
    deadline: '2026-03-15',
    start_date: '2025-12-01'
  },
  {
    title: 'Cloud Infrastructure Setup',
    description: 'AWS deployment and infrastructure configuration',
    budget: 22000,
    status: 'completed',
    deadline: '2025-12-15',
    start_date: '2025-11-01',
    actual_end_date: '2025-12-15'
  },
  {
    title: 'Payment Gateway Integration',
    description: 'Stripe and PayPal payment processing integration',
    budget: 7500,
    status: 'completed',
    deadline: '2026-01-05',
    start_date: '2025-12-10',
    actual_end_date: '2026-01-05'
  },
  {
    title: 'Security Audit & Compliance',
    description: 'Comprehensive security review and GDPR compliance implementation',
    budget: 11000,
    status: 'completed',
    deadline: '2025-12-20',
    start_date: '2025-11-15',
    actual_end_date: '2025-12-20'
  }
]

export async function seedDemoData(guestMode = false) {
  try {
    console.log('[seedDemoData] Starting demo data seeding... Guest mode:', guestMode)
    
    // Use service role key to bypass RLS if available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl) {
      console.error('[seedDemoData] Missing NEXT_PUBLIC_SUPABASE_URL')
      return { error: 'Supabase URL not configured' }
    }
    
    if (!supabaseServiceKey) {
      console.error('[seedDemoData] Service role key required for demo data seeding')
      return { error: 'Service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.' }
    }
    
    // Create service role client to bypass RLS
    console.log('[seedDemoData] Using service role key to bypass RLS')
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    let userId: string
    
    if (guestMode) {
      // For guest mode, generate a valid UUID v4
      // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
      console.log('[seedDemoData] Guest mode - Generated guest UUID:', userId)
      
      // Create a guest user in auth.users table to satisfy foreign key constraint
      try {
        const { data: guestUser, error: createUserError } = await supabase.auth.admin.createUser({
          email: `guest-${userId}@demo.local`,
          email_confirm: true,
          user_metadata: {
            full_name: 'Demo Guest User',
            is_guest: true
          }
        })
        
        if (createUserError) {
          console.error('[seedDemoData] Error creating guest user:', createUserError)
          return { error: 'Failed to create guest user: ' + createUserError.message }
        }
        
        if (guestUser?.user?.id) {
          userId = guestUser.user.id
          console.log('[seedDemoData] Created guest user with ID:', userId)
        }
      } catch (error) {
        console.error('[seedDemoData] Exception creating guest user:', error)
        return { error: 'Failed to create guest user account' }
      }
    } else {
      // Try to get authenticated user
      const standardSupabase = await createClient()
      const { data: { user }, error: authError } = await standardSupabase.auth.getUser()
      
      console.log('[seedDemoData] Auth check - User:', user?.id, 'Error:', authError?.message)
      
      if (!user) {
        console.error('[seedDemoData] No authenticated user found')
        return { error: 'Please log in first or use guest mode' }
      }
      
      userId = user.id
      console.log('[seedDemoData] Using authenticated user ID:', userId)
    }

    console.log('[seedDemoData] User ID:', userId)

    // Check if user already has data
    const { count: existingClients, error: clientCheckError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    const { count: existingProjects, error: projectCheckError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    console.log('[seedDemoData] Existing clients:', existingClients, 'Existing projects:', existingProjects)
    
    if (clientCheckError) console.error('[seedDemoData] Client check error:', clientCheckError)
    if (projectCheckError) console.error('[seedDemoData] Project check error:', projectCheckError)

    if (existingClients && existingClients > 0) {
      console.log('[seedDemoData] Demo data already exists')
      return { error: 'Demo data already exists. You have ' + existingClients + ' clients.' }
    }

    // Insert demo clients
    console.log('[seedDemoData] Inserting', demoClients.length, 'demo clients...')
    const clientsToInsert = demoClients.map(client => ({
      ...client,
      user_id: userId,
      notes: 'Demo client data for portfolio showcase'
    }))
    
    console.log('[seedDemoData] Clients to insert:', JSON.stringify(clientsToInsert, null, 2))
    
    const { data: insertedClients, error: clientError } = await supabase
      .from('clients')
      .insert(clientsToInsert)
      .select()

    if (clientError) {
      console.error('[seedDemoData] Error inserting demo clients:', clientError)
      return { error: 'Failed to insert demo clients: ' + clientError.message }
    }

    console.log('[seedDemoData] Successfully inserted', insertedClients?.length, 'clients')

    // Insert demo projects with random client assignments
    const projectsWithClients = demoProjects.map((project, index) => {
      const clientIndex = index % insertedClients!.length
      // For completed projects, use actual_end_date as created_at so revenue chart shows them
      // For other projects, use start_date
      const dateToUse = project.status === 'completed' && project.actual_end_date 
        ? project.actual_end_date 
        : project.start_date
      
      return {
        ...project,
        user_id: userId,
        client_id: insertedClients![clientIndex].id,
        created_at: new Date(dateToUse!).toISOString()
      }
    })

    console.log('[seedDemoData] Inserting', projectsWithClients.length, 'demo projects...')
    
    const { data: insertedProjects, error: projectError } = await supabase
      .from('projects')
      .insert(projectsWithClients)
      .select()

    if (projectError) {
      console.error('[seedDemoData] Error inserting demo projects:', projectError)
      return { error: 'Failed to insert demo projects: ' + projectError.message }
    }

    console.log('[seedDemoData] Successfully inserted', insertedProjects?.length, 'projects')
    console.log('[seedDemoData] ✅ Demo data seeding completed successfully!')

    return { 
      success: true, 
      data: {
        clients: insertedClients?.length || 0,
        projects: insertedProjects?.length || 0,
        guestUserId: guestMode ? userId : undefined
      }
    }
  } catch (error) {
    console.error('[seedDemoData] Exception:', error)
    return { error: 'Failed to seed demo data: ' + (error instanceof Error ? error.message : 'Unknown error') }
  }
}

export async function hasDemoData() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('[hasDemoData] No user authenticated')
      return { hasData: false }
    }

    const { count: clientCount, error: clientError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    const { count: projectCount, error: projectError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    console.log('[hasDemoData] Client count:', clientCount, 'Project count:', projectCount)
    
    if (clientError) console.error('[hasDemoData] Client error:', clientError)
    if (projectError) console.error('[hasDemoData] Project error:', projectError)

    const hasData = (clientCount !== null && clientCount > 0) || (projectCount !== null && projectCount > 0)
    
    console.log('[hasDemoData] Has data:', hasData)

    return { 
      hasData,
      clientCount: clientCount || 0,
      projectCount: projectCount || 0
    }
  } catch (error) {
    console.error('[hasDemoData] Error checking demo data:', error)
    return { hasData: false, clientCount: 0, projectCount: 0 }
  }
}
