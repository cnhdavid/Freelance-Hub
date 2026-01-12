'use client'

import { useState } from 'react'
import { Database, Zap, TrendingUp } from 'lucide-react'
import { seedDemoData, hasDemoData } from '@/app/actions/demo-data'

interface DemoDataBannerProps {
  onDataSeeded?: () => void
}

export function DemoDataBanner({ onDataSeeded }: DemoDataBannerProps) {
  const [isSeeding, setIsSeeding] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message: string } | null>(null)

  const handleSeedData = async () => {
    setIsSeeding(true)
    setResult(null)
    
    try {
      const response = await seedDemoData()
      
      if (response.success) {
        setResult({
          success: true,
          message: `Successfully created ${response.data?.clients} clients and ${response.data?.projects} projects!`
        })
        setTimeout(() => {
          onDataSeeded?.()
          window.location.reload()
        }, 1500)
      } else {
        setResult({
          success: false,
          message: response.error || 'Failed to seed demo data'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An unexpected error occurred'
      })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-violet-900/20 to-indigo-900/20 border border-violet-500/30 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="p-3 bg-violet-500/20 border border-violet-500/30 rounded-xl">
            <Database className="w-6 h-6 text-violet-400" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            Start with Demo Data
          </h3>
          <p className="text-zinc-300 text-sm mb-4">
            Get a feel for your dashboard with realistic sample projects and clients. 
            Perfect for showcasing your portfolio to recruiters!
          </p>
          
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Zap className="w-3 h-3 text-violet-400" />
              <span>8 Sample Projects</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>$116,500 Total Revenue</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Database className="w-3 h-3 text-blue-400" />
              <span>5 Sample Clients</span>
            </div>
          </div>
          
          {result && (
            <div className={`p-3 rounded-lg text-sm mb-4 ${
              result.success 
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {result.message}
            </div>
          )}
          
          <button
            onClick={handleSeedData}
            disabled={isSeeding || result?.success === true}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-zinc-600 disabled:to-zinc-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-violet-500/50 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isSeeding ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Demo Data...</span>
              </>
            ) : result?.success === true ? (
              <>
                <span className="text-lg">✨</span>
                <span>Data Created!</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Seed Demo Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
