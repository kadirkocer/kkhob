"use client"

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function VersionBadge() {
  const { data: version } = useQuery({
    queryKey: ['version'],
    queryFn: () => api.getVersion(),
    staleTime: Infinity, // Version doesn't change often
  })

  return (
    <div className="fixed top-4 left-4 z-50">
      <span className="text-xs font-mono text-gray-500 bg-white dark:bg-gray-900 px-2 py-1 rounded shadow-sm border">
        v{version?.version || '1.0.0'}
      </span>
    </div>
  )
}