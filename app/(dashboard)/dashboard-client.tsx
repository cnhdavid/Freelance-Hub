'use client'

import { useState } from 'react'
import { Users, Briefcase, DollarSign, TrendingUp } from 'lucide-react'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { AddClientModal } from '@/components/modals/add-client-modal'
import { AddProjectModal } from '@/components/modals/add-project-modal'

interface DashboardClientProps {
  totalClients: number
  totalProjects: number
  activeProjects: number
  totalRevenue: number
  completionRate: number
  averageProjectValue: number
  projects: any[]
  allProjects: any[]
}

export function DashboardClient({
  totalClients,
  totalProjects,
  activeProjects,
  totalRevenue,
  completionRate,
  averageProjectValue,
  projects,
  allProjects,
}: DashboardClientProps) {
  const [showClientModal, setShowClientModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)

  const stats = [
    {
      title: 'Total Clients',
      value: totalClients || 0,
      icon: Users,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/20',
      glowColor: 'group-hover:shadow-violet-500/20',
    },
    {
      title: 'Total Projects',
      value: totalProjects || 0,
      icon: Briefcase,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      glowColor: 'group-hover:shadow-emerald-500/20',
    },
    {
      title: 'Active Projects',
      value: activeProjects,
      icon: TrendingUp,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      glowColor: 'group-hover:shadow-amber-500/20',
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString('en-US')}`,
      icon: DollarSign,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      glowColor: 'group-hover:shadow-indigo-500/20',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'on_hold':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  return (
    <>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-zinc-400">Welcome back! Here's what's happening with your business today.</p>
        </div>

        {/* Stats Grid with Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`group relative bg-zinc-900 border ${stat.borderColor} rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${stat.glowColor} cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-400 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-xl ${stat.bgColor} border ${stat.borderColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300">
            <h2 className="text-xl font-bold text-white mb-6">Revenue Overview</h2>
            <RevenueChart projects={allProjects} />
          </div>

          {/* Quick Stats */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300">
            <h2 className="text-xl font-bold text-white mb-6">Quick Insights</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                <span className="text-zinc-400">Average Project Value</span>
                <span className="text-xl font-bold text-white">
                  ${averageProjectValue.toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                <span className="text-zinc-400">Completion Rate</span>
                <span className="text-xl font-bold text-emerald-400">
                  {completionRate}%
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                <span className="text-zinc-400">Active Clients</span>
                <span className="text-xl font-bold text-violet-400">{totalClients}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300">
          <h2 className="text-xl font-bold text-white mb-6">Recent Projects</h2>
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
                onClick={() => setShowProjectModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-violet-500/50"
              >
                Create Your First Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions FAB */}
      <QuickActions
        onAddClient={() => setShowClientModal(true)}
        onAddProject={() => setShowProjectModal(true)}
      />

      {/* Modals */}
      <AddClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSuccess={() => {
          window.location.reload()
        }}
      />

      <AddProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSuccess={() => {
          window.location.reload()
        }}
      />
    </>
  )
}
