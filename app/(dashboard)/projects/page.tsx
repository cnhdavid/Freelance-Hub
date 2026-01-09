'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Calendar, DollarSign } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Database } from '@/types/database'
import { getClients } from '@/app/actions/clients'
import { getProjects, createProject, updateProject, deleteProject } from '@/app/actions/projects'

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
      const result = await getProjects()
      console.log('[ProjectsPage] Projects result:', result)
      
      if (result.data) {
        setProjects(result.data as Project[])
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'on_hold': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={() => {
            setEditingProject(null)
            form.reset()
            setIsModalOpen(true)
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Project
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{project.title}</div>
                      {project.description && (
                        <div className="text-sm text-gray-500">{project.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(project as any).clients?.name || 'Unknown Client'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {project.budget.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.deadline ? (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(project.deadline).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">No deadline</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h3>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  {...form.register('title')}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  {...form.register('description')}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Client</label>
                <select
                  {...form.register('client_id')}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.client_id && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.client_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Budget</label>
                <input
                  type="number"
                  step="0.01"
                  {...form.register('budget', { valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {form.formState.errors.budget && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.budget.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  {...form.register('status')}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                <input
                  type="date"
                  {...form.register('deadline')}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingProject(null)
                    form.reset()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
