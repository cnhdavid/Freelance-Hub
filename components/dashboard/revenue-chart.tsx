'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface RevenueChartProps {
  projects?: Array<{
    created_at: string
    budget: number
  }>
}

export function RevenueChart({ projects = [] }: RevenueChartProps) {
  const generateChartData = () => {
    const validProjects = projects.filter(p => 
      p.created_at && 
      p.budget && 
      !isNaN(p.budget) && 
      !isNaN(new Date(p.created_at).getTime())
    )

    if (!validProjects || validProjects.length === 0) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      return months.map(month => ({ month, revenue: 0 }))
    }

    const monthlyRevenue: { [key: string]: number } = {}
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    validProjects.forEach(project => {
      const date = new Date(project.created_at)
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + project.budget
    })

    const sortedEntries = Object.entries(monthlyRevenue)
      .sort((a, b) => {
        const dateA = new Date(a[0])
        const dateB = new Date(b[0])
        return dateA.getTime() - dateB.getTime()
      })
      .slice(-6)

    return sortedEntries.map(([month, revenue]) => ({
      month: month.split(' ')[0],
      revenue
    }))
  }

  const data = generateChartData()
  const hasData = projects && projects.length > 0

  if (!hasData) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
            <TrendingUp className="w-8 h-8 text-violet-400" />
          </div>
          <p className="text-zinc-400">No revenue data yet</p>
          <p className="text-sm text-zinc-500 mt-1">Create projects to see revenue trends</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis 
            dataKey="month" 
            stroke="#71717a"
            style={{ fontSize: '12px' }}
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
  )
}
