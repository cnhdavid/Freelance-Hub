'use client'

import { useState } from 'react'
import { Plus, Users, Briefcase, X } from 'lucide-react'

interface QuickActionsProps {
  onAddClient: () => void
  onAddProject: () => void
}

export function QuickActions({ onAddClient, onAddProject }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen && (
        <div className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2">
          <button
            onClick={() => {
              onAddClient()
              setIsOpen(false)
            }}
            className="group flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-3 rounded-full shadow-lg border border-zinc-800 transition-all duration-200 hover:scale-105 hover:shadow-violet-500/20"
          >
            <Users className="w-5 h-5 text-violet-400" />
            <span className="text-sm font-medium whitespace-nowrap">Add Client</span>
          </button>
          
          <button
            onClick={() => {
              onAddProject()
              setIsOpen(false)
            }}
            className="group flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-3 rounded-full shadow-lg border border-zinc-800 transition-all duration-200 hover:scale-105 hover:shadow-violet-500/20"
          >
            <Briefcase className="w-5 h-5 text-violet-400" />
            <span className="text-sm font-medium whitespace-nowrap">New Project</span>
          </button>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg hover:shadow-violet-500/50 transition-all duration-200 flex items-center justify-center ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  )
}
