'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { AddFromUrl } from '@/components/add-from-url'
import { ShelvesGrid } from '@/components/shelves-grid'
import { PhotographyGallery } from '@/components/photography-gallery'
import { EntryModal } from '@/components/entry-modal'
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  Edit3, 
  Eye, 
  FileText, 
  Filter,
  Grid3X3,
  Heart, 
  List, 
  MoreVertical, 
  Plus, 
  Search,
  Settings,
  Share,
  Star,
  Tag,
  TrendingUp,
  Users
} from 'lucide-react'

interface HobbyPageProps {
  params: { id: string }
  searchParams?: { tab?: string }
}

interface Entry {
  id: number
  title: string
  description?: string
  url?: string
  image?: string
  tags: string[]
  created_at: string
  updated_at: string
  view_count: number
  is_favorite: boolean
  rating?: number
}

interface HobbyStats {
  totalEntries: number
  totalViews: number
  avgRating: number
  recentActivity: number
  topTags: { tag: string, count: number }[]
  monthlyGrowth: number
}

export default function HobbyPage({ params, searchParams }: HobbyPageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const tab = searchParams?.tab || 'overview'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null)
  const [entryModalOpen, setEntryModalOpen] = useState(false)

  // Fetch hobby data
  const { data: hobby, isLoading: hobbyLoading } = useQuery({
    queryKey: ['hobby', params.id],
    queryFn: async () => {
      const hobbies = await api.getHobbies()
      return hobbies.find(h => h.id.toString() === params.id)
    }
  })

  // Fetch sub-hobbies
  const { data: subHobbies = [] } = useQuery({
    queryKey: ['subHobbies', params.id],
    queryFn: async () => {
      const hobbies = await api.getHobbies()
      return hobbies.filter(h => h.parent_id?.toString() === params.id)
    }
  })

  // Mock entries data - in real app would come from API
  const { data: entries = [] } = useQuery({
    queryKey: ['hobbyEntries', params.id],
    queryFn: async () => {
      // Mock data for demonstration
      const mockEntries: Entry[] = [
        {
          id: 1,
          title: `${hobby?.name || 'Hobby'} Project #1`,
          description: 'A fascinating exploration into the depths of this hobby',
          url: 'https://example.com/project1',
          image: '/api/placeholder/300/200',
          tags: ['beginner', 'tutorial', 'inspiration'],
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString(),
          view_count: 24,
          is_favorite: true,
          rating: 4.5
        },
        {
          id: 2,
          title: `Advanced ${hobby?.name || 'Hobby'} Techniques`,
          description: 'Deep dive into advanced concepts and methodologies',
          tags: ['advanced', 'technique', 'skill-building'],
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          view_count: 18,
          is_favorite: false,
          rating: 4.8
        },
        {
          id: 3,
          title: 'Quick Tips and Tricks',
          description: 'Collection of useful shortcuts and hacks',
          url: 'https://youtube.com/watch?v=example',
          tags: ['tips', 'quick', 'productivity'],
          created_at: new Date(Date.now() - 259200000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString(),
          view_count: 31,
          is_favorite: true,
          rating: 4.2
        }
      ]
      return mockEntries
    },
    enabled: !!hobby
  })

  // Mock statistics
  const { data: stats } = useQuery({
    queryKey: ['hobbyStats', params.id],
    queryFn: async (): Promise<HobbyStats> => ({
      totalEntries: entries.length,
      totalViews: entries.reduce((sum, entry) => sum + entry.view_count, 0),
      avgRating: entries.reduce((sum, entry) => sum + (entry.rating || 0), 0) / entries.length,
      recentActivity: 12,
      topTags: [
        { tag: 'tutorial', count: 8 },
        { tag: 'inspiration', count: 6 },
        { tag: 'beginner', count: 4 },
        { tag: 'advanced', count: 3 }
      ],
      monthlyGrowth: 23.5
    }),
    enabled: !!entries.length
  })

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => entry.tags.includes(tag))
    return matchesSearch && matchesTags
  })

  const allTags = Array.from(new Set(entries.flatMap(entry => entry.tags)))

  const handleEntryClick = (entryId: number) => {
    setSelectedEntryId(entryId)
    setEntryModalOpen(true)
  }

  if (hobbyLoading || !hobby) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{hobby.icon}</span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: hobby.color }}>
                {hobby.name}
              </h1>
              <p className="text-muted-foreground">
                {hobby.slug} • {stats?.totalEntries || 0} entries
              </p>
            </div>
          </div>
          
          {/* Sub-hobbies */}
          {subHobbies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Sub-categories:</span>
              {subHobbies.map(subHobby => (
                <Badge 
                  key={subHobby.id} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-secondary/80"
                  style={{ color: subHobby.color }}
                  onClick={() => router.push(`/hobbies/${subHobby.id}`)}
                >
                  {subHobby.icon} {subHobby.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <AddFromUrl className="shrink-0" />
          <Button variant="outline" size="icon">
            <Share className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistics Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalEntries}</p>
                  <p className="text-xs text-muted-foreground">Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stats.recentActivity}</p>
                  <p className="text-xs text-muted-foreground">Recent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">+{stats.monthlyGrowth}%</p>
                  <p className="text-xs text-muted-foreground">Growth</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={tab} onValueChange={(value) => router.push(`/hobbies/${params.id}?tab=${value}`)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="entries">Entries ({entries.length})</TabsTrigger>
          <TabsTrigger value="shelves">Shelves</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Entries */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Entries
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/hobbies/${params.id}?tab=entries`)}>
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entries.slice(0, 3).map(entry => (
                    <div key={entry.id} className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer" onClick={() => handleEntryClick(entry.id)}>
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium">{entry.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {entry.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                          <span>{entry.view_count} views</span>
                          {entry.is_favorite && <Heart className="h-3 w-3 fill-red-500 text-red-500" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.topTags.map(({ tag, count }) => (
                    <div key={tag} className="flex items-center justify-between">
                      <Badge variant="outline">{tag}</Badge>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks for managing this hobby
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col" onClick={() => router.push('/entries/new')}>
                  <Plus className="h-6 w-6 mb-2" />
                  Add Entry
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => router.push(`/hobbies/${params.id}?tab=entries`)}>
                  <Search className="h-6 w-6 mb-2" />
                  Search
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => router.push(`/hobbies/${params.id}?tab=analytics`)}>
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Analytics
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => router.push('/settings')}>
                  <Settings className="h-6 w-6 mb-2" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entries Tab */}
        <TabsContent value="entries" className="space-y-4">
          {/* Filters and Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Filter by tags:</span>
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag))
                    } else {
                      setSelectedTags([...selectedTags, tag])
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Entries Grid/List */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
            {filteredEntries.map(entry => (
              <Card key={entry.id} className={`hover:shadow-md transition-shadow cursor-pointer ${
                viewMode === 'list' ? 'flex' : ''
              }`} onClick={() => handleEntryClick(entry.id)}>
                {entry.image && (
                  <div className={`bg-muted rounded ${
                    viewMode === 'list' ? 'w-24 h-24 shrink-0' : 'h-48'
                  } flex items-center justify-center`}>
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{entry.title}</h3>
                    {entry.is_favorite && <Heart className="h-4 w-4 fill-red-500 text-red-500 shrink-0" />}
                  </div>
                  {entry.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {entry.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-2">
                      <span>{entry.view_count} views</span>
                      {entry.rating && (
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1">{entry.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {filteredEntries.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No entries found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </TabsContent>

        {/* Shelves Tab */}
        <TabsContent value="shelves">
          <ShelvesGrid hobbyId={parseInt(params.id)} />
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery">
          <PhotographyGallery hobbyId={parseInt(params.id)} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>
                Comprehensive insights into your {hobby.name.toLowerCase()} activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Advanced Analytics Coming Soon</h3>
                <p className="text-muted-foreground">Detailed charts, trends, and insights will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Entry Modal */}
      <EntryModal
        entryId={selectedEntryId}
        open={entryModalOpen}
        onOpenChange={setEntryModalOpen}
      />
    </div>
  )
}