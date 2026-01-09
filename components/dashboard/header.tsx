'use client'

import { useState } from 'react'
import { User, ChevronDown, Bell, Menu, Sparkles } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface DashboardHeaderProps {
  user: {
    email?: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
  }
  onMenuClick?: () => void
}

export default function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40 backdrop-blur-xl bg-zinc-950/80">
      <div className="px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
        {/* Mobile: Logo + Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Freelance Hub
            </h1>
          </div>
        </div>

        {/* Desktop: Welcome Message */}
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-white">
            Welcome back, <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">{displayName}</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Let's make today productive</p>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 md:gap-3 text-sm rounded-xl hover:bg-zinc-900 p-2 transition-all"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-violet-500/20">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                )}
              </div>
              <span className="hidden md:inline font-medium text-white">{displayName}</span>
              <ChevronDown className="w-4 h-4 text-zinc-400 hidden md:block" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="py-2">
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <p className="text-sm font-medium text-white">{displayName}</p>
                    <p className="text-xs text-zinc-400 mt-1">{user.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
