'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Calendar, DollarSign, X, Download } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Database } from '@/types/database'
import { getClients } from '@/app/actions/clients'
import { getProjects, createProject, updateProject, deleteProject } from '@/app/actions/projects'
import { InvoiceDownloadLink } from '@/components/pdf/invoice-document'
import { getStatusBadge } from '@/components/ui/status-badge'

type Project = Database['public']['Tables']['projects']['Row']
type Client = Database['public']['Tables']['clients']['Row']

const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required'),
  description: z.string().optional(),
  budget: z.number().min(0, 'Budget must be positive'),
  client_id: z.string().uuid('Please select a valid client').optional().or(z.literal('')),
  status: z.enum(['planning', 'in_progress', 'completed', 'on_hold', 'cancelled']),
  deadline: z.string().optional(),
})

type ProjectFormData = z.infer<typeof projectSchema>

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const supabase = createClient()

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      budget: 0,
      client_id: '',
      status: 'planning',
      deadline: '',
    },
  })

  useEffect(() => {
    fetchProjects()
    fetchClients()
  }, [])

  const fetchProjects = async () => {
    try {
      console.log('[ProjectsPage] Fetching projects...')
      
      // Check if we're in guest mode
      const guestUserId = localStorage.getItem('guestUserId')
      
      if (guestUserId) {
        console.log('[ProjectsPage] Guest mode detected, fetching guest projects...')
        const { getGuestProjects } = await import('@/app/actions/guest-data')
        const result = await getGuestProjects(guestUserId)
        
        if (result.success && result.data) {
          setProjects(result.data as any)
          console.log('[ProjectsPage] ✅ Loaded', result.data.length, 'guest projects')
        } else {
          console.error('[ProjectsPage] ❌ Error fetching guest projects:', result.error)
          setProjects([])
        }
        setLoading(false)
        return
      }
      
      // Regular authenticated user flow
      const result = await getProjects()
      console.log('[ProjectsPage] Projects result:', result)
      
      if (result.data) {
        // Fetch client information for each project
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const projectsWithClients = await Promise.all(
            result.data.map(async (project: Project) => {
              if (project.client_id) {
                const { data: client } = await supabase
                  .from('clients')
                  .select('name, email, company')
                  .eq('id', project.client_id)
                  .single()
                
                return {
                  ...project,
                  client: client || undefined
                }
              }
              return project
            })
          )
          
          setProjects(projectsWithClients)
        } else {
          setProjects(result.data as Project[])
        }
        
        console.log('[ProjectsPage] ✅ Loaded', result.data.length, 'projects')
      } else if (result.error) {
        console.error('[ProjectsPage] ❌ Error:', result.error)
        setProjects([])
      }
      setLoading(false)
    } catch (error) {
      console.error('[ProjectsPage] Exception fetching projects:', error)
      setProjects([])
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      console.log('[ProjectsPage] Fetching clients...')
      
      // Check if we're in guest mode
      const guestUserId = localStorage.getItem('guestUserId')
      
      if (guestUserId) {
        console.log('[ProjectsPage] Guest mode detected, fetching guest clients...')
        const { getGuestClients } = await import('@/app/actions/guest-data')
        const result = await getGuestClients(guestUserId)
        
        if (result.success && result.data) {
          setClients(result.data as Client[])
          console.log('[ProjectsPage] ✅ Loaded', result.data.length, 'guest clients')
        } else {
          console.error('[ProjectsPage] ❌ Error fetching guest clients:', result.error)
          setClients([])
        }
        return
      }
      
      // Regular authenticated user flow
      const result = await getClients()
      console.log('[ProjectsPage] Clients result:', result)
      
      if (result.data) {
        setClients(result.data as Client[])
        console.log('[ProjectsPage] ✅ Loaded', result.data.length, 'clients')
      } else if (result.error) {
        console.error('[ProjectsPage] ❌ Error:', result.error)
        setClients([])
      }
    } catch (error) {
      console.error('[ProjectsPage] Exception fetching clients:', error)
      setClients([])
    }
  }

  const onSubmit = async (data: ProjectFormData) => {
    try {
      console.log('[ProjectsPage] Submitting project data:', data)
      
      let result
      if (editingProject) {
        console.log('[ProjectsPage] Updating project:', editingProject.id)
        result = await updateProject(editingProject.id, {
          title: data.title,
          description: data.description,
          budget: data.budget,
          client_id: data.client_id || undefined,
          status: data.status,
          deadline: data.deadline,
        })
      } else {
        console.log('[ProjectsPage] Creating new project')
        result = await createProject({
          title: data.title,
          description: data.description,
          budget: data.budget,
          client_id: data.client_id || undefined,
          status: data.status,
          deadline: data.deadline,
        })
      }
      
      console.log('[ProjectsPage] Result:', result)
      
      if (result.error) {
        console.error('[ProjectsPage] ❌ Error saving project:', result.error)
        alert(`Error: ${result.error}`)
        return
      }
      
      console.log('[ProjectsPage] ✅ Project saved successfully')
      setIsModalOpen(false)
      setEditingProject(null)
      form.reset()
      
      // Refresh the projects list
      await fetchProjects()
      
      alert('Project saved successfully!')
    } catch (error) {
      console.error('[ProjectsPage] Exception saving project:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    form.reset({
      title: project.title,
      description: project.description || '',
      budget: project.budget,
      client_id: project.client_id,
      status: project.status,
      deadline: project.deadline || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        console.log('[ProjectsPage] Deleting project:', id)
        const result = await deleteProject(id)
        
        if (result.error) {
          console.error('[ProjectsPage] ❌ Error deleting project:', result.error)
          alert(`Error: ${result.error}`)
          return
        }
        
        console.log('[ProjectsPage] ✅ Project deleted successfully')
        await fetchProjects()
      } catch (error) {
        console.error('[ProjectsPage] Exception deleting project:', error)
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-zinc-400">Loading...</div>
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent mb-2">
            Projects
          </h1>
          <p className="text-sm md:text-base text-zinc-400">Manage your project portfolio</p>
        </div>
        <button
          onClick={() => {
            setEditingProject(null)
            form.reset()
            setIsModalOpen(true)
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-violet-500/50"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                  Project
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                  Budget
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                  Deadline
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-white">{project.title}</div>
                      {project.description && (
                        <div className="text-sm text-zinc-400 mt-1">{project.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {(project as any).clients?.name || 'No Client'}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(project.status).element}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {project.budget.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {project.deadline ? (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(project.deadline).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-zinc-600">No deadline</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {project.status === 'completed' && (
                        <InvoiceDownloadLink
                          project={{
                            id: project.id,
                            title: project.title,
                            description: project.description || undefined,
                            budget: project.budget,
                            created_at: project.created_at,
                            deadline: project.deadline || undefined,
                            client: (project as any).client
                          }}
                          className="flex items-center gap-1 px-2 py-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors font-medium"
                        >
                          <Download className="w-3 h-3" />
                          Invoice
                        </InvoiceDownloadLink>
                      )}
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-2 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg mb-1">{project.title}</h3>
                {project.description && (
                  <p className="text-sm text-zinc-400 mb-2">{project.description}</p>
                )}
                {getStatusBadge(project.status).element}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Client</span>
                <span className="text-white font-medium">{(project as any).clients?.name || 'No Client'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Budget</span>
                <div className="flex items-center text-white font-medium">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {project.budget.toLocaleString()}
                </div>
              </div>
              {project.deadline && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Deadline</span>
                  <div className="flex items-center text-white">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(project.deadline).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {project.status === 'completed' && (
                <InvoiceDownloadLink
                  project={{
                    id: project.id,
                    title: project.title,
                    description: project.description || undefined,
                    budget: project.budget,
                    created_at: project.created_at,
                    deadline: project.deadline || undefined,
                    client: (project as any).client
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-sm text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  Invoice
                </InvoiceDownloadLink>
              )}
              <button
                onClick={() => handleEdit(project)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-sm text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 rounded-lg transition-colors font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border-t md:border border-zinc-800 rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-md max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-zinc-800 flex-shrink-0">
              <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingProject(null)
                  form.reset()
                }}
                className="text-zinc-400 hover:text-white transition-colors p-2 -mr-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Title *</label>
                <input
                  {...form.register('title')}
                  className="w-full px-4 py-3 text-base bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-zinc-500 transition-all"
                />
                {form.formState.errors.title && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                <textarea
                  {...form.register('description')}
                  rows={3}
                  className="w-full px-4 py-3 text-base bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-zinc-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Client</label>
                <select
                  {...form.register('client_id')}
                  className="w-full px-4 py-3 text-base bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white transition-all"
                >
                  <option value="">Select a client (optional)</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.client_id && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.client_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Budget ($)</label>
                <input
                  type="number"
                  step="0.01"
                  {...form.register('budget', { valueAsNumber: true })}
                  className="w-full px-4 py-3 text-base bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-zinc-500 transition-all"
                />
                {form.formState.errors.budget && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.budget.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Status</label>
                <select
                  {...form.register('status')}
                  className="w-full px-4 py-3 text-base bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white transition-all"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Deadline</label>
                <input
                  type="date"
                  {...form.register('deadline')}
                  className="w-full px-4 py-3 text-base bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-zinc-500 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingProject(null)
                    form.reset()
                  }}
                  className="flex-1 px-4 py-3 min-h-[44px] bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 min-h-[44px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-violet-500/50"
                >
                  {editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
