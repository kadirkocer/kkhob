'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Calendar,
  Edit3,
  Eye,
  ExternalLink,
  Heart,
  MoreVertical,
  Save,
  Share,
  Star,
  Tag,
  Trash2,
  User
} from 'lucide-react'

interface EntryPageProps {
  params: { id: string }
}

export default function EntryPage({ params }: EntryPageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [mounted, setMounted] = useState(false)

  const entryId = params.id === 'new' ? null : parseInt(params.id)

  // Fetch entry data
  const { data: entry, isLoading, error } = useQuery({
    queryKey: ['entry', entryId],
    queryFn: () => entryId ? api.getEntry(entryId) : null,
    enabled: !!entryId && mounted
  })

  // Fetch hobbies for new entry creation
  const { data: hobbies = [] } = useQuery({
    queryKey: ['hobbies'],
    queryFn: () => api.getHobbies(),
    enabled: mounted
  })

  // Update entry mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      if (entryId) {
        return api.updateEntry(entryId, data)
      } else {
        return api.createEntry(data)
      }
    },
    onSuccess: (result) => {
      if (!entryId && result?.id) {
        router.push(`/entries/${result.id}`)
      } else {
        queryClient.invalidateQueries({ queryKey: ['entry', entryId] })
        setIsEditing(false)
      }
    }
  })

  // Delete entry mutation
  const deleteMutation = useMutation({
    mutationFn: () => api.deleteEntry(entryId!),
    onSuccess: () => {
      router.push('/')
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (entry) {
      setEditData({
        title: entry.title,
        description: entry.description || '',
        content_markdown: entry.content_markdown || '',
        tags: entry.tags || '',
        is_favorite: entry.is_favorite,
        hobby_id: entry.hobby_id,
        type_key: entry.type_key
      })
    } else if (params.id === 'new') {
      setEditData({
        title: '',
        description: '',
        content_markdown: '',
        tags: '',
        is_favorite: false,
        hobby_id: hobbies[0]?.id || 1,
        type_key: 'note'
      })
      setIsEditing(true)
    }
  }, [entry, hobbies, params.id])

  const handleSave = () => {
    updateMutation.mutate(editData)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteMutation.mutate()
    }
  }

  if (!mounted) {
    return <div className="container mx-auto p-6">Loading...</div>
  }

  if (isLoading && entryId) {
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

  if (error && entryId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Entry Not Found</h2>
              <p className="text-muted-foreground mb-4">The entry you're looking for doesn't exist or has been deleted.</p>
              <Button onClick={() => router.push('/')}>Go to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isNewEntry = params.id === 'new'
  const currentEntry = entry || editData

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isNewEntry ? 'Create New Entry' : (isEditing ? 'Edit Entry' : currentEntry?.title || 'Entry Details')}
            </h1>
            {!isNewEntry && entry && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                <span>Entry #{entry.id}</span>
                <span>•</span>
                <div className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  <span>{entry.view_count} views</span>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isNewEntry && !isEditing && (
            <>
              <Button variant="outline" size="icon">
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {isEditing && (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false)
                  if (isNewEntry) router.push('/')
                }}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!editData.title || updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        value={editData.title}
                        onChange={(e) => setEditData({...editData, title: e.target.value})}
                        placeholder="Enter entry title..."
                        className="text-lg font-semibold"
                      />
                    </div>
                  ) : (
                    <CardTitle className="text-2xl">{currentEntry?.title}</CardTitle>
                  )}
                  
                  {!isEditing && entry && (
                    <div className="flex items-center space-x-2">
                      <Link href={`/hobbies/${entry.hobby_id}`}>
                        <Badge variant="secondary" className="hover:bg-secondary/80">
                          {entry.hobby_name || `Hobby ${entry.hobby_id}`}
                        </Badge>
                      </Link>
                      <Badge variant="outline">{entry.type_key}</Badge>
                      {entry.is_favorite && <Heart className="h-4 w-4 fill-red-500 text-red-500" />}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editData.description}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      placeholder="Brief description of this entry..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={editData.content_markdown}
                      onChange={(e) => setEditData({...editData, content_markdown: e.target.value})}
                      placeholder="Write your content here (Markdown supported)..."
                      rows={10}
                      className="font-mono"
                    />
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <Input
                      value={editData.tags}
                      onChange={(e) => setEditData({...editData, tags: e.target.value})}
                      placeholder="tag1, tag2, tag3"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Separate tags with commas</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentEntry?.description && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-muted-foreground">{currentEntry.description}</p>
                    </div>
                  )}
                  
                  {currentEntry?.content_markdown && (
                    <div>
                      <h4 className="font-medium mb-2">Content</h4>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap bg-muted p-4 rounded text-sm">
                          {currentEntry.content_markdown}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {(!currentEntry?.description && !currentEntry?.content_markdown) && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No content available.</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsEditing(true)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Add Content
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Entry Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Entry Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label>Hobby</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={editData.hobby_id}
                      onChange={(e) => setEditData({...editData, hobby_id: parseInt(e.target.value)})}
                    >
                      {hobbies.map(hobby => (
                        <option key={hobby.id} value={hobby.id}>
                          {hobby.parent_id ? '  ' : ''}{hobby.icon} {hobby.name}{hobby.parent_id ? ' (sub)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={editData.type_key}
                      onChange={(e) => setEditData({...editData, type_key: e.target.value})}
                    >
                      <option value="note">Note</option>
                      <option value="article">Article</option>
                      <option value="link">Link</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Favorite</Label>
                    <Switch
                      checked={editData.is_favorite}
                      onCheckedChange={(checked) => setEditData({...editData, is_favorite: checked})}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <Badge variant="secondary">{currentEntry?.type_key}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Favorite</span>
                    {currentEntry?.is_favorite ? (
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    ) : (
                      <span className="text-sm text-muted-foreground">No</span>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {currentEntry?.tags && !isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {currentEntry.tags.split(',').map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {!isNewEntry && !isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Share className="h-4 w-4 mr-2" />
                  Share Entry
                </Button>
                <Separator />
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete Entry'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}