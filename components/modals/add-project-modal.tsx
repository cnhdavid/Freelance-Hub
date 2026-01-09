'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { getClients, type Client } from '@/app/actions/clients'
import { createProject } from '@/app/actions/projects'
import { Spinner } from '@/components/ui/spinner'

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (project?: any) => void
}

export function AddProjectModal({ isOpen, onClose, onSuccess }: AddProjectModalProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    status: 'planning',
    client_id: '',
  })

  console.log('[AddProjectModal] Component render - isOpen:', isOpen, 'clients.length:', clients.length)

  useEffect(() => {
    console.log('[AddProjectModal] useEffect triggered - isOpen:', isOpen)
    if (isOpen) {
      console.log('[AddProjectModal] Modal is open, calling fetchClients...')
      fetchClients()
    }
  }, [isOpen])

  const fetchClients = async () => {
    setLoadingClients(true)
    console.log('[AddProjectModal] Starting fetchClients...')
    try {
      console.log('[AddProjectModal] Calling getClients() server action...')
      const result = await getClients()
      console.log('[AddProjectModal] Raw result from getClients:', JSON.stringify(result, null, 2))
      console.log('[AddProjectModal] Result.data type:', typeof result.data)
      console.log('[AddProjectModal] Result.data is array?', Array.isArray(result.data))
      console.log('[AddProjectModal] Result.error:', result.error)
      
      if (result.error) {
        console.error('[AddProjectModal] ❌ Error fetching clients:', result.error)
        toast.error('Failed to load clients', {
          description: result.error,
        })
        setClients([])
      } else if (result.data && Array.isArray(result.data)) {
        console.log('[AddProjectModal] ✅ Clients loaded successfully!')
        console.log('[AddProjectModal] Number of clients:', result.data.length)
        console.log('[AddProjectModal] Client data:', result.data)
        setClients(result.data)
      } else {
        console.log('[AddProjectModal] ⚠️ No clients data returned or data is not an array')
        console.log('[AddProjectModal] Setting clients to empty array')
        setClients([])
      }
    } catch (error) {
      console.error('[AddProjectModal] ❌ Exception fetching clients:', error)
      toast.error('Failed to load clients', {
        description: 'An unexpected error occurred.',
      })
      setClients([])
    } finally {
      console.log('[AddProjectModal] Fetch complete. LoadingClients set to false')
      setLoadingClients(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const projectPayload = {
      title: formData.title,
      description: formData.description,
      budget: parseFloat(formData.budget) || 0,
      deadline: formData.deadline,
      status: formData.status as any,
      client_id: formData.client_id || undefined,
    }

    console.log('[AddProjectModal] ========== SUBMITTING PROJECT ==========')
    console.log('[AddProjectModal] Form Data:', formData)
    console.log('[AddProjectModal] Project Payload:', projectPayload)
    console.log('[AddProjectModal] Client ID:', formData.client_id)
    console.log('[AddProjectModal] Client ID is empty?', !formData.client_id)

    const optimisticProject = {
      id: `temp-${Date.now()}`,
      title: formData.title,
      description: formData.description || null,
      budget: parseFloat(formData.budget) || 0,
      deadline: formData.deadline || null,
      status: formData.status,
      client_id: formData.client_id,
      user_id: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onSuccess(optimisticProject)
    onClose()
    setFormData({ title: '', description: '', budget: '', deadline: '', status: 'planning', client_id: '' })

    console.log('[AddProjectModal] Calling createProject server action...')

    toast.promise(
      createProject(projectPayload).then(result => {
        console.log('[AddProjectModal] createProject response:', result)
        if (result.error) {
          console.error('[AddProjectModal] ❌ Error from createProject:', result.error)
        } else {
          console.log('[AddProjectModal] ✅ Project created successfully:', result.data)
        }
        return result
      }),
      {
        loading: 'Creating project...',
        success: (result) => {
          if (result.error) {
            throw new Error(result.error)
          }
          setLoading(false)
          return `${formData.title} has been created successfully!`
        },
        error: (err) => {
          setLoading(false)
          console.error('[AddProjectModal] Toast error handler:', err)
          return err.message || 'Failed to create project'
        },
      }
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border-t md:border border-zinc-800 rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-md max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-zinc-800 flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Create New Project
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-2 -mr-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">
              Project Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 text-base bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-zinc-500 transition-all"
              placeholder="Website Redesign"
            />
          </div>

          <div>
            <label htmlFor="client_id" className="block text-sm font-medium text-zinc-300 mb-2">
              Client
            </label>
            {(() => {
              console.log('[AddProjectModal] Rendering dropdown. State:', {
                loadingClients,
                clientsCount: clients.length,
                clients: clients
              })
              return null
            })()}
            {loadingClients ? (
              <div className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-500">
                Loading clients...
              </div>
            ) : clients.length === 0 ? (
              <div className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                <p className="text-zinc-400 text-sm mb-2">No clients found.</p>
                <a
                  href="/clients"
                  className="text-violet-400 hover:text-violet-300 text-sm font-medium underline"
                  onClick={onClose}
                >
                  Go to Clients page to add one →
                </a>
              </div>
            ) : (
              <select
                id="client_id"
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white transition-all"
              >
                <option value="">Select a client (optional)</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company ? `(${client.company})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-zinc-500 transition-all resize-none"
              placeholder="Brief description of the project..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-zinc-300 mb-2">
                Budget ($)
              </label>
              <input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-3 text-base bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-zinc-500 transition-all"
                placeholder="5000"
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-zinc-300 mb-2">
                Deadline
              </label>
              <input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 text-base bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-zinc-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-zinc-300 mb-2">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white transition-all"
            >
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 min-h-[44px] bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 min-h-[44px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Spinner size={16} />}
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
