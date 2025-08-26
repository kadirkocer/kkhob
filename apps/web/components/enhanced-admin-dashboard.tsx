'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { AdminStats } from '@/components/admin/admin-stats'
import { DatabaseExplorer } from '@/components/admin/database-explorer'
import { 
  BarChart3,
  Activity,
  TrendingUp,
  Users,
  Database,
  FileText,
  FolderOpen,
  Clock,
  Eye,
  Heart,
  Tag,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalEntries: number
    totalHobbies: number
    totalShelves: number
    totalViews: number
    storageUsed: string
    activeUsers: number
  }
  trends: {
    entriesThisWeek: number
    entriesLastWeek: number
    viewsThisWeek: number
    viewsLastWeek: number
  }
  topContent: {
    mostViewedEntries: Array<{
      id: number
      title: string
      views: number
      hobby: string
    }>
    popularTags: Array<{
      name: string
      count: number
    }>
    activeHobbies: Array<{
      name: string
      entryCount: number
      lastActivity: string
    }>
  }
  performance: {
    averageLoadTime: number
    errorRate: number
    uptime: number
    databaseQueries: number
  }
  activity: Array<{
    id: number
    action: string
    entity: string
    timestamp: string
    details: string
  }>
}

export function EnhancedAdminDashboard() {
  const [mounted, setMounted] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { t, ready } = useTranslation()

  // Mock analytics data - in real app would come from API
  const mockAnalytics: AnalyticsData = {
    overview: {
      totalEntries: 247,
      totalHobbies: 8,
      totalShelves: 23,
      totalViews: 1542,
      storageUsed: "45.3MB",
      activeUsers: 1
    },
    trends: {
      entriesThisWeek: 12,
      entriesLastWeek: 8,
      viewsThisWeek: 89,
      viewsLastWeek: 76
    },
    topContent: {
      mostViewedEntries: [
        { id: 1, title: "FastAPI Authentication Tutorial", views: 156, hobby: "Technology" },
        { id: 2, title: "Mountain Photography Tips", views: 134, hobby: "Photography" },
        { id: 3, title: "React Server Components Guide", views: 98, hobby: "Technology" },
        { id: 4, title: "Jazz Album Collection", views: 87, hobby: "Music" },
        { id: 5, title: "Skateboard Trick Analysis", views: 76, hobby: "Skateboarding" }
      ],
      popularTags: [
        { name: "tutorial", count: 45 },
        { name: "javascript", count: 32 },
        { name: "photography", count: 28 },
        { name: "music", count: 23 },
        { name: "react", count: 19 }
      ],
      activeHobbies: [
        { name: "Technology", entryCount: 89, lastActivity: "2 hours ago" },
        { name: "Photography", entryCount: 67, lastActivity: "5 hours ago" },
        { name: "Music", entryCount: 45, lastActivity: "1 day ago" },
        { name: "Books & Cinema", entryCount: 23, lastActivity: "2 days ago" }
      ]
    },
    performance: {
      averageLoadTime: 245,
      errorRate: 0.02,
      uptime: 99.8,
      databaseQueries: 1247
    },
    activity: [
      { id: 1, action: "CREATE", entity: "Entry", timestamp: "2025-08-26T14:30:00Z", details: "Created 'React Hooks Best Practices'" },
      { id: 2, action: "VIEW", entity: "Entry", timestamp: "2025-08-26T14:25:00Z", details: "Viewed 'Photography Composition Guide'" },
      { id: 3, action: "UPDATE", entity: "Shelf", timestamp: "2025-08-26T14:20:00Z", details: "Updated 'Learning Resources' shelf" },
      { id: 4, action: "CREATE", entity: "Shelf", timestamp: "2025-08-26T13:45:00Z", details: "Created 'Web Development' shelf" },
      { id: 5, action: "DELETE", entity: "Entry", timestamp: "2025-08-26T13:30:00Z", details: "Deleted outdated tutorial entry" }
    ]
  }

  const { data: systemStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.getSystemStats(),
    enabled: mounted,
  })

  const { data: tables } = useQuery({
    queryKey: ['admin-tables'],
    queryFn: () => api.getTables(),
    enabled: mounted,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'UPDATE': return <RefreshCw className="h-4 w-4 text-blue-500" />
      case 'DELETE': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'VIEW': return <Eye className="h-4 w-4 text-gray-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous * 100).toFixed(1)
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and system insights
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{mockAnalytics.overview.totalEntries}</p>
                    <p className="text-xs text-muted-foreground">Entries</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{mockAnalytics.overview.totalHobbies}</p>
                    <p className="text-xs text-muted-foreground">Hobbies</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{mockAnalytics.overview.totalShelves}</p>
                    <p className="text-xs text-muted-foreground">Shelves</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{mockAnalytics.overview.totalViews}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-indigo-500" />
                  <div>
                    <p className="text-2xl font-bold">{mockAnalytics.overview.storageUsed}</p>
                    <p className="text-xs text-muted-foreground">Storage</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{mockAnalytics.performance.uptime}%</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Entries This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{mockAnalytics.trends.entriesThisWeek}</span>
                  <Badge variant={mockAnalytics.trends.entriesThisWeek > mockAnalytics.trends.entriesLastWeek ? "default" : "secondary"}>
                    {calculateTrend(mockAnalytics.trends.entriesThisWeek, mockAnalytics.trends.entriesLastWeek)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">vs {mockAnalytics.trends.entriesLastWeek} last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Views This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{mockAnalytics.trends.viewsThisWeek}</span>
                  <Badge variant={mockAnalytics.trends.viewsThisWeek > mockAnalytics.trends.viewsLastWeek ? "default" : "secondary"}>
                    {calculateTrend(mockAnalytics.trends.viewsThisWeek, mockAnalytics.trends.viewsLastWeek)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">vs {mockAnalytics.trends.viewsLastWeek} last week</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest system activities and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAnalytics.activity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 text-sm">
                    {getActivityIcon(activity.action)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{activity.details}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.action}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Top Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Most Viewed Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalytics.topContent.mostViewedEntries.map((entry, index) => (
                    <div key={entry.id} className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{entry.title}</p>
                        <p className="text-xs text-muted-foreground">{entry.hobby}</p>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Eye className="h-3 w-3 mr-1" />
                        {entry.views}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalytics.topContent.popularTags.map((tag) => (
                    <div key={tag.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{tag.name}</span>
                      </div>
                      <Badge variant="secondary">{tag.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Hobbies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalytics.topContent.activeHobbies.map((hobby) => (
                    <div key={hobby.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{hobby.name}</span>
                        <Badge variant="outline">{hobby.entryCount}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last activity: {hobby.lastActivity}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{mockAnalytics.performance.averageLoadTime}ms</p>
                  <p className="text-sm text-muted-foreground">Avg Load Time</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{(mockAnalytics.performance.errorRate * 100).toFixed(2)}%</p>
                  <p className="text-sm text-muted-foreground">Error Rate</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{mockAnalytics.performance.uptime}%</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{mockAnalytics.performance.databaseQueries}</p>
                  <p className="text-sm text-muted-foreground">DB Queries</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminStats />
            <DatabaseExplorer />
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Export</CardTitle>
              <CardDescription>Export your data for backup or migration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Analytics
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Use the command line tool: <code className="bg-muted px-2 py-1 rounded">python scripts/backup.py export</code>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}