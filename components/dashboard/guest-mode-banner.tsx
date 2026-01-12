'use client'

import { useState } from 'react'
import { Info, LogIn, Sparkles, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { seedDemoData } from '@/app/actions/demo-data'

export function GuestModeBanner() {
  const router = useRouter()
  const [isSeeding, setIsSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleViewDemoData = async () => {
    setIsSeeding(true)
    setError(null)
    
    try {
      console.log('Guest: Starting demo data seeding...')
      const response = await seedDemoData(true) // Pass true for guest mode
      console.log('Guest: Seed response:', response)
      
      if (response.success && response.data?.guestUserId) {
        console.log('Guest: Demo data created successfully! Guest User ID:', response.data.guestUserId)
        // Store the guest user ID in localStorage so we can retrieve the data
        localStorage.setItem('guestUserId', response.data.guestUserId)
        // Refresh the page to show the new data
        window.location.reload()
      } else {
        console.error('Guest: Seeding failed:', response.error)
        setError(response.error || 'Failed to load demo data')
        setIsSeeding(false)
      }
    } catch (err) {
      console.error('Guest: Exception during seeding:', err)
      setError('An unexpected error occurred')
      setIsSeeding(false)
    }
  }

  return (
    <div className="mb-6 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-violet-500/20 rounded-lg">
          <Info className="w-5 h-5 text-violet-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white mb-1">
            Guest Mode Active
          </h3>
          <p className="text-xs text-zinc-400 mb-3">
            You're using the app as a guest. Your data is stored temporarily in your browser and won't be saved permanently.
          </p>
          
          {error && (
            <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/login')}
              disabled={isSeeding}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-zinc-700 disabled:to-zinc-800 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 disabled:shadow-none disabled:cursor-not-allowed"
            >
              <LogIn className="w-4 h-4" />
              Sign in to save your progress
            </button>
            
            <button
              onClick={handleViewDemoData}
              disabled={isSeeding}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading Demo...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  View with Demo Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
