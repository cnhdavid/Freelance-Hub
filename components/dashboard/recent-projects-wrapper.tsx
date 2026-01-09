'use client'

import { Suspense } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { Briefcase } from 'lucide-react'

interface RecentProjectsWrapperProps {
  projects: any[]
  getStatusColor: (status: string) => string
  onCreateProject: () => void
}

export function RecentProjectsWrapper({ projects, getStatusColor, onCreateProject }: RecentProjectsWrapperProps) {
  return (
    <Suspense 
      fallback={
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl"
            >
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          ))}
        </div>
      }
    >
      {projects && projects.length > 0 ? (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">{project.title}</h3>
                <p className="text-sm text-zinc-400">
                  {project.client?.name && <span className="text-violet-400">{project.client.name}</span>}
                  {project.client?.name && ' • '}
                  Budget: ${project.budget.toLocaleString('en-US')}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                  project.status
                )}`}
              >
                {project.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
            <Briefcase className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
          <p className="text-zinc-400 mb-6">
            Get started by creating your first project and tracking your progress.
          </p>
          <button
            onClick={onCreateProject}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-violet-500/50"
          >
            Create Your First Project
          </button>
        </div>
      )}
    </Suspense>
  )
}
