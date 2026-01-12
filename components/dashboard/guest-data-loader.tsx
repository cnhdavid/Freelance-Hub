'use client'

import { useEffect, useState } from 'react'
import { getGuestData } from '@/app/actions/guest-data'
import { DashboardClient } from '@/app/(dashboard)/dashboard-client'
import { Loader2 } from 'lucide-react'

export function GuestDataLoader() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    const loadGuestData = async () => {
      const guestUserId = localStorage.getItem('guestUserId')
      
      if (!guestUserId) {
        console.log('[GuestDataLoader] No guest user ID found')
        setLoading(false)
        return
      }

      console.log('[GuestDataLoader] Loading data for guest:', guestUserId)
      const response = await getGuestData(guestUserId)
      
      if (response.success && response.data) {
        console.log('[GuestDataLoader] Guest data loaded successfully:', response.data)
        console.log('[GuestDataLoader] Completed projects for chart:', response.data.completedProjects)
        setDashboardData(response.data)
      } else {
        console.error('[GuestDataLoader] Failed to load guest data:', response.error)
      }
      
      setLoading(false)
    }

    loadGuestData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-2" />
          <p className="text-zinc-400">Loading demo data...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <DashboardClient
        totalClients={0}
        totalProjects={0}
        activeProjects={0}
        totalRevenue={0}
        completionRate={0}
        averageProjectValue={0}
        projects={[]}
        allProjects={[]}
        isGuest={true}
      />
    )
  }

  return (
    <DashboardClient
      totalClients={dashboardData.totalClients}
      totalProjects={dashboardData.totalProjects}
      activeProjects={dashboardData.activeProjects}
      totalRevenue={dashboardData.totalRevenue}
      completionRate={dashboardData.completionRate}
      averageProjectValue={dashboardData.averageProjectValue}
      projects={dashboardData.recentProjects}
      allProjects={dashboardData.completedProjects}
      isGuest={true}
    />
  )
}
