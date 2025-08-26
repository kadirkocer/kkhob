"use client"

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, FileText, Folder, TrendingUp } from 'lucide-react'

export function HobbyStats() {
  const [mounted, setMounted] = useState(false)
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.getSystemStats(),
    enabled: mounted,
  })

  const { data: hobbies = [] } = useQuery({
    queryKey: ['hobbies'],
    queryFn: () => api.getHobbies(),
    enabled: mounted,
  })

  const { data: recentEntries = [] } = useQuery({
    queryKey: ['entries', { recent: true, limit: 1 }],
    queryFn: () => api.getEntries({ limit: 1 }),
    enabled: mounted,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Entries",
      value: stats?.total_entries || 0,
      description: "Across all hobbies",
      icon: FileText,
      trend: recentEntries.length > 0 ? "+1 this session" : undefined,
    },
    {
      title: "Active Hobbies",
      value: stats?.total_hobbies || hobbies.length,
      description: "Categories configured",
      icon: Folder,
      trend: undefined,
    },
    {
      title: "Database Size",
      value: stats?.database_size || "< 1MB",
      description: "Storage used",
      icon: Database,
      trend: undefined,
    },
    {
      title: "Version",
      value: stats?.version || "1.0.0",
      description: "Current release",
      icon: TrendingUp,
      trend: undefined,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
            {stat.trend && (
              <p className="text-xs text-green-600 mt-1">
                {stat.trend}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}