'use client'

import { useState, useEffect } from 'react'
import { Users, Mail, Building2, Phone, Trash2, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { ClientFormModal } from '@/components/clients/client-form-modal'
import { deleteClient, type Client } from '@/app/actions/clients'
import { getGuestClients } from '@/app/actions/guest-data'

interface ClientsPageClientProps {
  initialClients: Client[]
  error: string | null | undefined
}

export function ClientsPageClient({ initialClients, error }: ClientsPageClientProps) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadGuestClients = async () => {
      const guestUserId = localStorage.getItem('guestUserId')
      
      if (guestUserId && initialClients.length === 0) {
        console.log('[ClientsPageClient] Loading guest clients for:', guestUserId)
        setLoading(true)
        
        const result = await getGuestClients(guestUserId)
        
        if (result.success && result.data) {
          console.log('[ClientsPageClient] Loaded', result.data.length, 'guest clients')
          setClients(result.data as Client[])
        } else {
          console.error('[ClientsPageClient] Failed to load guest clients:', result.error)
        }
        
        setLoading(false)
      }
    }
    
    loadGuestClients()
  }, [initialClients])

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (clientId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete ${clientName}?`)) {
      return
    }

    setDeletingId(clientId)

    try {
      const result = await deleteClient(clientId)

      if (result.error) {
        toast.error('Failed to delete client', {
          description: result.error,
        })
        return
      }

      setClients(clients.filter((c) => c.id !== clientId))
      toast.success('Client deleted successfully', {
        description: `${clientName} has been removed from your client list.`,
      })
    } catch (error) {
      toast.error('Failed to delete client', {
        description: 'An unexpected error occurred.',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleSuccess = (newClient?: Client) => {
    if (newClient) {
      setClients([newClient, ...clients])
    } else {
      window.location.reload()
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-400 mb-2">Failed to load clients</p>
          <p className="text-zinc-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent mb-2">
              Clients
            </h1>
            <p className="text-sm md:text-base text-zinc-400">Manage your client relationships</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-violet-500/50"
          >
            <Plus className="w-5 h-5" />
            <span>Add Client</span>
          </button>
        </div>

        {clients.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search clients by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>
        )}
      </div>

      {clients.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
            <Users className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No clients yet</h3>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            Start building your client base by adding your first client. Track their information and manage
            your relationships all in one place.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-violet-500/50"
          >
            Add Your First Client
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-300">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-300">Email</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-300">Company</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-300">Phone</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-300">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                        No clients match your search criteria
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => (
                      <tr
                        key={client.id}
                        className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                              <Users className="w-5 h-5 text-violet-400" />
                            </div>
                            <span className="font-medium text-white">{client.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-zinc-400">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{client.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {client.company ? (
                            <div className="flex items-center gap-2 text-zinc-400">
                              <Building2 className="w-4 h-4" />
                              <span className="text-sm">{client.company}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-600 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {client.phone ? (
                            <div className="flex items-center gap-2 text-zinc-400">
                              <Phone className="w-4 h-4" />
                              <span className="text-sm">{client.phone}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-600 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${
                              client.status === 'active'
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                            }`}
                          >
                            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(client.id, client.name)}
                            disabled={deletingId === client.id}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            {deletingId === client.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredClients.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
                <p className="text-zinc-400">No clients match your search criteria</p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{client.name}</h3>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border mt-1 ${
                            client.status === 'active'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                          }`}
                        >
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm break-all">{client.email}</span>
                    </div>
                    {client.company && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{client.company}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{client.phone}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(client.id, client.name)}
                    disabled={deletingId === client.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deletingId === client.id ? 'Deleting...' : 'Delete Client'}
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <ClientFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}
