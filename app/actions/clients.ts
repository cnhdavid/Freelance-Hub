'use server'

import { createClient as createSupabaseClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Client {
  id: string
  name: string
  email: string
  company: string | null
  phone: string | null
  status: 'active' | 'inactive'
  user_id: string
  created_at: string
  updated_at: string
}

export async function getClients() {
  console.log('[Server] getClients action called')
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  console.log('[Server] User authenticated:', !!user, 'User ID:', user?.id)
  
  if (!user) {
    console.log('[Server] ❌ No user found - returning Unauthorized')
    return { data: null, error: 'Unauthorized' }
  }

  console.log('[Server] Querying clients table for user:', user.id)
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  console.log('[Server] Query complete')
  console.log('[Server] Data:', data)
  console.log('[Server] Data length:', data?.length)
  console.log('[Server] Error:', error)
  
  if (error) {
    console.error('[Server] ❌ Database error:', error.message)
  } else if (data) {
    console.log('[Server] ✅ Successfully fetched', data.length, 'clients')
  }

  return { data, error: error?.message }
}

export async function createClient(formData: {
  name: string
  email: string
  company?: string
  phone?: string
  status: 'active' | 'inactive'
}) {
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: null, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('clients')
    .insert([
      {
        ...formData,
        user_id: user.id,
      },
    ])
    .select()
    .single()

  revalidatePath('/clients')
  revalidatePath('/projects')
  revalidatePath('/')
  
  return { data, error: error?.message }
}

export async function deleteClient(clientId: string) {
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)
    .eq('user_id', user.id)

  revalidatePath('/clients')
  
  return { error: error?.message }
}

export async function updateClient(clientId: string, formData: {
  name?: string
  email?: string
  company?: string
  phone?: string
  status?: 'active' | 'inactive'
}) {
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: null, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('clients')
    .update(formData)
    .eq('id', clientId)
    .eq('user_id', user.id)
    .select()
    .single()

  revalidatePath('/clients')
  
  return { data, error: error?.message }
}
