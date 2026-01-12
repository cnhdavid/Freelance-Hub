'use client'

import { useState } from 'react'
import { seedDemoData, hasDemoData } from '@/app/actions/demo-data'
import { Database, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SeedDemoPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message: string; data?: any } | null>(null)
  const [dataStatus, setDataStatus] = useState<{ hasData: boolean; clientCount: number; projectCount: number } | null>(null)

  const checkDataStatus = async () => {
    const status = await hasDemoData()
    setDataStatus({
      hasData: status.hasData,
      clientCount: status.clientCount || 0,
      projectCount: status.projectCount || 0
    })
  }

  const handleSeedData = async () => {
    setIsSeeding(true)
    setResult(null)
    
    try {
      console.log('Starting seed process...')
      const response = await seedDemoData()
      console.log('Seed response:', response)
      
      if (response.success) {
        setResult({
          success: true,
          message: `✅ Successfully created ${response.data?.clients} clients and ${response.data?.projects} projects!`,
          data: response.data
        })
        
        // Check data status after seeding
        setTimeout(() => {
          checkDataStatus()
        }, 1000)
      } else {
        setResult({
          success: false,
          message: `❌ Error: ${response.error || 'Failed to seed demo data'}`
        })
      }
    } catch (error) {
      console.error('Exception during seeding:', error)
      setResult({
        success: false,
        message: `❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-violet-500/20 border border-violet-500/30 rounded-xl">
              <Database className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Demo Data Seeding</h1>
              <p className="text-zinc-400 text-sm">Force populate your database with sample data</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-2">What will be created:</h3>
              <ul className="space-y-1 text-sm text-zinc-400">
                <li>• 5 Sample Clients (TechCorp, DMA, Startup Ventures, etc.)</li>
                <li>• 8 Sample Projects (E-commerce, Mobile App, API Integration, etc.)</li>
                <li>• Total Revenue: $116,500</li>
                <li>• 5 Completed Projects + 2 In Progress + 1 Planning</li>
              </ul>
            </div>

            {dataStatus && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-400 mb-2">Current Database Status:</h3>
                <ul className="space-y-1 text-sm text-blue-300">
                  <li>• Clients: {dataStatus.clientCount}</li>
                  <li>• Projects: {dataStatus.projectCount}</li>
                  <li>• Has Data: {dataStatus.hasData ? 'Yes' : 'No'}</li>
                </ul>
              </div>
            )}

            {result && (
              <div className={`rounded-lg p-4 border ${
                result.success 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.message}
                    </p>
                    {result.data && (
                      <div className="mt-2 text-xs text-emerald-300">
                        <p>Clients created: {result.data.clients}</p>
                        <p>Projects created: {result.data.projects}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSeedData}
              disabled={isSeeding}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-zinc-700 disabled:to-zinc-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-violet-500/50 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Seeding Data...</span>
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  <span>Seed Demo Data Now</span>
                </>
              )}
            </button>

            <button
              onClick={checkDataStatus}
              disabled={isSeeding}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              Check Status
            </button>
          </div>

          {result?.success && (
            <div className="mt-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
              <p className="text-sm text-violet-300 mb-3">
                ✨ Demo data has been created! You can now:
              </p>
              <Link 
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-2">Troubleshooting:</h3>
          <ul className="space-y-1 text-xs text-zinc-400">
            <li>• Check browser console (F12) for detailed logs</li>
            <li>• Verify you're logged in to your Supabase account</li>
            <li>• Ensure RLS policies allow INSERT operations</li>
            <li>• If "already exists" error, data was previously seeded</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
