'use server'

import { createClient as createSupabaseClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Project {
  id: string
  title: string
  description: string | null
  budget: number
  deadline: string | null
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  client_id: string | null
  user_id: string
  created_at: string
  updated_at: string
}

export async function getProjects() {
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: null, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(name, company)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return { data, error: error?.message }
}

export async function createProject(formData: {
  title: string
  description?: string
  budget: number
  deadline?: string
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  client_id?: string
}) {
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('Project creation failed: User not authenticated')
    return { data: null, error: 'Unauthorized' }
  }

  console.log('Creating project for user:', user.id)
  console.log('Project data:', formData)

  const projectData = {
    ...formData,
    client_id: formData.client_id || null,
    user_id: user.id,
  }

  console.log('Inserting project with data:', projectData)

  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select()
    .single()

  if (error) {
    console.error('DB Insert Error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
  } else {
    console.log('Project created successfully:', data)
  }

  revalidatePath('/projects')
  revalidatePath('/')
  
  return { data, error: error?.message }
}

export async function deleteProject(projectId: string) {
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  revalidatePath('/projects')
  revalidatePath('/')
  
  return { error: error?.message }
}

export async function updateProject(projectId: string, formData: {
  title?: string
  description?: string
  budget?: number
  deadline?: string
  status?: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  client_id?: string
}) {
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: null, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('projects')
    .update(formData)
    .eq('id', projectId)
    .eq('user_id', user.id)
    .select()
    .single()

  revalidatePath('/projects')
  revalidatePath('/')
  
  return { data, error: error?.message }
}
