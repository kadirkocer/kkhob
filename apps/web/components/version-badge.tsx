"use client"

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState, useEffect } from 'react'

export function VersionBadge() {
  const [mounted, setMounted] = useState(false)
  
  const { data: version } = useQuery({
    queryKey: ['version'],
    queryFn: () => api.getVersion(),
    staleTime: Infinity, // Version doesn't change often
    enabled: mounted, // Only fetch after mounting
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Show static version during SSR to avoid hydration mismatch
    return (
      <div className="fixed top-4 left-4 z-50">
        <span className="text-xs font-mono text-gray-500 bg-white dark:bg-gray-900 px-2 py-1 rounded shadow-sm border">
          v1.3.0
        </span>
      </div>
    )
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <span className="text-xs font-mono text-gray-500 bg-white dark:bg-gray-900 px-2 py-1 rounded shadow-sm border">
        v{version?.version || '1.3.0'}
      </span>
    </div>
  )
}