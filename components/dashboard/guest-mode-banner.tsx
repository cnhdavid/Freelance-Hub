'use client'

import { Info, LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function GuestModeBanner() {
  const router = useRouter()

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
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
          >
            <LogIn className="w-4 h-4" />
            Sign in to save your progress
          </button>
        </div>
      </div>
    </div>
  )
}
