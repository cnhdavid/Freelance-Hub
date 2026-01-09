'use client'

import { Suspense } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { RevenueChart } from './revenue-chart'

interface RevenueChartWrapperProps {
  projects: any[]
}

export function RevenueChartWrapper({ projects }: RevenueChartWrapperProps) {
  return (
    <Suspense 
      fallback={
        <div className="w-full h-[300px] flex items-center justify-center">
          <Skeleton className="w-full h-[300px]" />
        </div>
      }
    >
      <RevenueChart projects={projects} />
    </Suspense>
  )
}
