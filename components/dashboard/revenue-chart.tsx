'use client'

import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'

interface RevenueChartProps {
  projects?: Array<{
    created_at: string
    budget: number
    status: string
  }>
}

type DateFilter = '30days' | '6months' | 'ytd'

export function RevenueChart({ projects = [] }: RevenueChartProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('6months')
  
  console.log('[RevenueChart] Component rendered with projects:', projects?.length)
  console.log('[RevenueChart] Projects data:', projects)
  
  const getDateRange = (filter: DateFilter) => {
    const now = new Date()
    const startDate = new Date()
    
    switch (filter) {
      case '30days':
        startDate.setDate(now.getDate() - 30)
        break
      case '6months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case 'ytd':
        startDate.setMonth(0, 1) // Start of current year
        break
    }
    
    return { startDate, endDate: now }
  }

  const generateChartData = () => {
    const { startDate, endDate } = getDateRange(dateFilter)
    
    console.log('[RevenueChart] Filtering projects for date range:', { startDate, endDate, dateFilter })
    console.log('[RevenueChart] Total projects received:', projects.length)
    
    const validProjects = projects.filter(p => {
      const isValidDate = p.created_at && !isNaN(new Date(p.created_at).getTime())
      const isValidBudget = p.budget && !isNaN(Number(p.budget))
      const isCompleted = p.status?.toLowerCase() === 'completed' // Case-insensitive
      const projectDate = new Date(p.created_at)
      const isInDateRange = projectDate >= startDate && projectDate <= endDate
      
      const isValid = isValidDate && isValidBudget && isCompleted && isInDateRange
      
      if (p.status?.toLowerCase() === 'completed') {
        console.log('[RevenueChart] Completed project:', {
          title: (p as any).title,
          status: p.status,
          budget: p.budget,
          created_at: p.created_at,
          isInDateRange,
          isValid
        })
      }
      
      return isValid
    })
    
    console.log('[RevenueChart] Valid projects after filtering:', validProjects.length)

    if (!validProjects || validProjects.length === 0) {
      // Return empty data points for the selected period
      if (dateFilter === '30days') {
        return Array.from({ length: 30 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (29 - i))
          return { 
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
            revenue: 0 
          }
        })
      } else {
        const months = []
        const current = new Date(startDate)
        while (current <= endDate) {
          months.push(current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }))
          current.setMonth(current.getMonth() + 1)
        }
        return months.map(month => ({ month, revenue: 0 }))
      }
    }

    if (dateFilter === '30days') {
      // Group by day for last 30 days
      const dailyRevenue: { [key: string]: number } = {}
      
      validProjects.forEach(project => {
        const date = new Date(project.created_at)
        const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const budget = Number(project.budget) || 0
        dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + budget
        console.log('[RevenueChart] Adding to daily revenue:', { dateKey, budget })
      })

      // Fill missing days with 0
      const result = []
      const current = new Date(startDate)
      while (current <= endDate) {
        const dateKey = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        result.push({
          date: dateKey,
          revenue: dailyRevenue[dateKey] || 0
        })
        current.setDate(current.getDate() + 1)
      }
      
      return result
    } else {
      // Group by month for 6 months and YTD
      const monthlyRevenue: { [key: string]: number } = {}
      
      validProjects.forEach(project => {
        const date = new Date(project.created_at)
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        const budget = Number(project.budget) || 0
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + budget
        console.log('[RevenueChart] Adding to monthly revenue:', { monthKey, budget })
      })

      const sortedEntries = Object.entries(monthlyRevenue)
        .sort((a, b) => {
          const dateA = new Date(a[0])
          const dateB = new Date(b[0])
          return dateA.getTime() - dateB.getTime()
        })

      return sortedEntries.map(([month, revenue]) => ({
        month,
        revenue
      }))
    }
  }

  const data = generateChartData()
  const hasCompletedProjects = projects && projects.some(p => p.status?.toLowerCase() === 'completed')
  
  console.log('[RevenueChart] Chart data generated:', data)
  console.log('[RevenueChart] Has completed projects:', hasCompletedProjects)

  if (!hasCompletedProjects) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
            <TrendingUp className="w-8 h-8 text-violet-400" />
          </div>
          <p className="text-zinc-400">No completed projects yet</p>
          <p className="text-sm text-zinc-500 mt-1">Complete projects to see revenue trends</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-[300px]">
      {/* Date Filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="text-sm bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="30days">Last 30 Days</option>
            <option value="6months">Last 6 Months</option>
            <option value="ytd">Year to Date</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis 
              dataKey={dateFilter === '30days' ? 'date' : 'month'} 
              stroke="#71717a"
              style={{ fontSize: '11px' }}
              angle={dateFilter === '30days' ? -45 : 0}
              textAnchor={dateFilter === '30days' ? 'end' : 'middle'}
              height={dateFilter === '30days' ? 60 : 40}
            />
            <YAxis 
              stroke="#71717a"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number | undefined) => [`$${(value || 0).toLocaleString('en-US')}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
