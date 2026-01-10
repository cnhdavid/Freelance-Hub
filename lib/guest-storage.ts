export interface GuestClient {
  id: string
  name: string
  email: string
  company: string | null
  phone: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface GuestProject {
  id: string
  title: string
  description: string | null
  budget: number
  deadline: string | null
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  client_id: string | null
  created_at: string
  updated_at: string
}

const GUEST_CLIENTS_KEY = 'freelancehub_guest_clients'
const GUEST_PROJECTS_KEY = 'freelancehub_guest_projects'

export const guestStorage = {
  clients: {
    getAll(): GuestClient[] {
      if (typeof window === 'undefined') return []
      const data = localStorage.getItem(GUEST_CLIENTS_KEY)
      return data ? JSON.parse(data) : []
    },

    save(clients: GuestClient[]): void {
      if (typeof window === 'undefined') return
      localStorage.setItem(GUEST_CLIENTS_KEY, JSON.stringify(clients))
    },

    add(client: Omit<GuestClient, 'id' | 'created_at' | 'updated_at'>): GuestClient {
      const clients = this.getAll()
      const newClient: GuestClient = {
        ...client,
        id: `guest_client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      clients.push(newClient)
      this.save(clients)
      return newClient
    },

    update(id: string, updates: Partial<GuestClient>): GuestClient | null {
      const clients = this.getAll()
      const index = clients.findIndex(c => c.id === id)
      if (index === -1) return null
      
      clients[index] = {
        ...clients[index],
        ...updates,
        updated_at: new Date().toISOString(),
      }
      this.save(clients)
      return clients[index]
    },

    delete(id: string): boolean {
      const clients = this.getAll()
      const filtered = clients.filter(c => c.id !== id)
      if (filtered.length === clients.length) return false
      this.save(filtered)
      return true
    },

    clear(): void {
      if (typeof window === 'undefined') return
      localStorage.removeItem(GUEST_CLIENTS_KEY)
    },
  },

  projects: {
    getAll(): GuestProject[] {
      if (typeof window === 'undefined') return []
      const data = localStorage.getItem(GUEST_PROJECTS_KEY)
      return data ? JSON.parse(data) : []
    },

    save(projects: GuestProject[]): void {
      if (typeof window === 'undefined') return
      localStorage.setItem(GUEST_PROJECTS_KEY, JSON.stringify(projects))
    },

    add(project: Omit<GuestProject, 'id' | 'created_at' | 'updated_at'>): GuestProject {
      const projects = this.getAll()
      const newProject: GuestProject = {
        ...project,
        id: `guest_project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      projects.push(newProject)
      this.save(projects)
      return newProject
    },

    update(id: string, updates: Partial<GuestProject>): GuestProject | null {
      const projects = this.getAll()
      const index = projects.findIndex(p => p.id === id)
      if (index === -1) return null
      
      projects[index] = {
        ...projects[index],
        ...updates,
        updated_at: new Date().toISOString(),
      }
      this.save(projects)
      return projects[index]
    },

    delete(id: string): boolean {
      const projects = this.getAll()
      const filtered = projects.filter(p => p.id !== id)
      if (filtered.length === projects.length) return false
      this.save(filtered)
      return true
    },

    clear(): void {
      if (typeof window === 'undefined') return
      localStorage.removeItem(GUEST_PROJECTS_KEY)
    },
  },

  clearAll(): void {
    this.clients.clear()
    this.projects.clear()
  },
}
