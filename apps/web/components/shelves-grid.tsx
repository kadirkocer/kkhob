'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { 
  BookOpen,
  Grid3x3,
  List,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  FolderOpen
} from 'lucide-react'

interface ShelvesGridProps {
  hobbyId?: number
  className?: string
}

export function ShelvesGrid({ hobbyId, className }: ShelvesGridProps) {
  const [mounted, setMounted] = useState(false)
  const { t, ready } = useTranslation()

  const { data: shelves = [], isLoading, error } = useQuery({
    queryKey: ['shelves', hobbyId],
    queryFn: () => api.getShelves({ hobby_id: hobbyId }),
    enabled: mounted,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading shelves</p>
      </div>
    )
  }

  if (shelves.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">No shelves yet</p>
        <p className="text-muted-foreground mb-4">
          Create your first shelf to organize your content
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Shelf
        </Button>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {shelves.map((shelf) => (
        <Card key={shelf.id} className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{shelf.name}</CardTitle>
                {shelf.description && (
                  <CardDescription className="mt-1 line-clamp-2">
                    {shelf.description}
                  </CardDescription>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Shelf Type and View Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {shelf.type === 'gallery' ? 'Gallery' : 
                     shelf.type === 'library' ? 'Library' : 'General'}
                  </Badge>
                  {shelf.view_mode === 'grid' ? (
                    <Grid3x3 className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <List className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {shelf.item_count} {shelf.item_count === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Preview of items */}
              {shelf.item_count > 0 && (
                <div className="grid grid-cols-4 gap-1">
                  {Array.from({ length: Math.min(4, shelf.item_count) }).map((_, i) => (
                    <div 
                      key={i} 
                      className="aspect-square bg-muted rounded border-2 border-background"
                    />
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  {shelf.hobby_name}
                </span>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Create new shelf card */}
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="flex flex-col items-center justify-center h-48 space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium">Create New Shelf</p>
            <p className="text-sm text-muted-foreground">
              Organize your content
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}