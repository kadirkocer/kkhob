"use client"

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, FileText, Folder, Activity } from 'lucide-react'

export function AdminStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.getSystemStats(),
  })

  const { data: tables = [], isLoading: tablesLoading } = useQuery({
    queryKey: ['admin', 'tables'],
    queryFn: () => api.getTables(),
  })

  if (isLoading || tablesLoading) {
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

  const totalRows = tables.reduce((sum, table) => sum + table.row_count, 0)

  const adminStats = [
    {
      title: "Total Entries",
      value: stats?.total_entries || 0,
      description: "All hobby entries",
      icon: FileText,
    },
    {
      title: "Active Hobbies",
      value: stats?.total_hobbies || 0,
      description: "Configured categories",
      icon: Folder,
    },
    {
      title: "Database Tables",
      value: tables.length,
      description: `${totalRows} total rows`,
      icon: Database,
    },
    {
      title: "System Version",
      value: stats?.version || "1.0.0",
      description: "Current release",
      icon: Activity,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {adminStats.map((stat, index) => (
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}