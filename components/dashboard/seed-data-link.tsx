'use client'

import Link from 'next/link'
import { Database } from 'lucide-react'

export function SeedDataLink() {
  return (
    <Link
      href="/seed-demo"
      className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg font-medium transition-colors shadow-lg hover:shadow-violet-500/50"
    >
      <Database className="w-4 h-4" />
      <span>Seed Demo Data</span>
    </Link>
  )
}
