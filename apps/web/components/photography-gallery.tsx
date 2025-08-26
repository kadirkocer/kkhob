'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { 
  Camera,
  Grid3x3,
  Image as ImageIcon,
  Download,
  Heart,
  Share2,
  ZoomIn,
  Calendar,
  MapPin,
  Aperture,
  Clock,
  Eye,
  Star,
  Filter,
  Search,
  Plus,
  Upload
} from 'lucide-react'

interface PhotoGalleryProps {
  hobbyId?: number
  className?: string
}

interface Photo {
  id: number
  title: string
  description?: string
  filename: string
  thumbnail_path?: string
  width?: number
  height?: number
  size_bytes?: number
  created_at: string
  metadata?: {
    camera?: string
    lens?: string
    focal_length?: string
    aperture?: string
    shutter_speed?: string
    iso?: string
    location?: string
    date_taken?: string
  }
  is_favorite?: boolean
  view_count?: number
  tags?: string[]
}

export function PhotographyGallery({ hobbyId, className }: PhotoGalleryProps) {
  const [mounted, setMounted] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid')
  const [filter, setFilter] = useState<'all' | 'favorites'>('all')
  const { t, ready } = useTranslation()

  // Mock data for now - in real app would come from API
  const mockPhotos: Photo[] = [
    {
      id: 1,
      title: "Mountain Landscape",
      description: "Beautiful sunrise over the mountains",
      filename: "mountain-landscape.jpg",
      thumbnail_path: "/api/media/thumb-1.jpg",
      width: 3840,
      height: 2160,
      size_bytes: 2450000,
      created_at: "2025-08-20T08:30:00Z",
      metadata: {
        camera: "Canon EOS R5",
        lens: "RF 24-70mm f/2.8L IS USM",
        focal_length: "35mm",
        aperture: "f/8",
        shutter_speed: "1/125s",
        iso: "ISO 100",
        location: "Swiss Alps",
        date_taken: "2025-08-20T06:15:00Z"
      },
      is_favorite: true,
      view_count: 45,
      tags: ["landscape", "mountains", "sunrise", "nature"]
    },
    {
      id: 2,
      title: "Urban Architecture",
      description: "Modern building design",
      filename: "urban-architecture.jpg",
      thumbnail_path: "/api/media/thumb-2.jpg", 
      width: 2880,
      height: 4320,
      size_bytes: 1800000,
      created_at: "2025-08-19T14:22:00Z",
      metadata: {
        camera: "Sony α7R IV",
        lens: "FE 16-35mm f/2.8 GM",
        focal_length: "24mm",
        aperture: "f/5.6",
        shutter_speed: "1/250s",
        iso: "ISO 200",
        location: "New York City"
      },
      is_favorite: false,
      view_count: 23,
      tags: ["architecture", "urban", "building", "modern"]
    }
  ]

  const photos = mockPhotos.filter(photo => 
    filter === 'all' || (filter === 'favorites' && photo.is_favorite)
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })
  }

  if (!mounted) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Gallery Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Camera className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Photography Gallery</h2>
            <p className="text-muted-foreground">{photos.length} photos</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Filter buttons */}
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'favorites' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('favorites')}
          >
            <Star className="h-4 w-4 mr-1" />
            Favorites
          </Button>
          
          {/* View mode toggle */}
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          
          {/* Upload button */}
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No photos yet</p>
          <p className="text-muted-foreground mb-4">
            Upload your first photo to get started
          </p>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Photos
          </Button>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
            : 'masonry-grid'
        }`}>
          {photos.map((photo) => (
            <Dialog key={photo.id}>
              <DialogTrigger asChild>
                <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-200">
                  <div className="relative aspect-square bg-muted">
                    {/* Placeholder for photo thumbnail */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900" />
                    <ImageIcon className="absolute inset-0 m-auto h-8 w-8 text-muted-foreground" />
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <ZoomIn className="h-8 w-8 text-white" />
                    </div>
                    
                    {/* Photo info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex items-center justify-between text-white text-sm">
                        <div className="flex items-center space-x-2">
                          {photo.is_favorite && <Heart className="h-3 w-3 fill-red-500 text-red-500" />}
                          <Eye className="h-3 w-3" />
                          <span>{photo.view_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-white">
                            <Heart className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-white">
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-3">
                    <h3 className="font-medium truncate">{photo.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(photo.created_at)}
                    </p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              
              {/* Photo Detail Modal */}
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{photo.title}</DialogTitle>
                </DialogHeader>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Photo */}
                  <div className="lg:col-span-2">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </div>
                  
                  {/* Photo Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Size:</span>
                          <span>{photo.width}×{photo.height}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">File size:</span>
                          <span>{formatFileSize(photo.size_bytes || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Views:</span>
                          <span>{photo.view_count}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* EXIF Data */}
                    {photo.metadata && (
                      <div>
                        <h4 className="font-medium mb-2">Camera Settings</h4>
                        <div className="space-y-2 text-sm">
                          {photo.metadata.camera && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Camera:</span>
                              <span className="text-right">{photo.metadata.camera}</span>
                            </div>
                          )}
                          {photo.metadata.lens && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Lens:</span>
                              <span className="text-right">{photo.metadata.lens}</span>
                            </div>
                          )}
                          {photo.metadata.focal_length && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Focal length:</span>
                              <span>{photo.metadata.focal_length}</span>
                            </div>
                          )}
                          {photo.metadata.aperture && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Aperture:</span>
                              <span>{photo.metadata.aperture}</span>
                            </div>
                          )}
                          {photo.metadata.shutter_speed && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Shutter:</span>
                              <span>{photo.metadata.shutter_speed}</span>
                            </div>
                          )}
                          {photo.metadata.iso && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ISO:</span>
                              <span>{photo.metadata.iso}</span>
                            </div>
                          )}
                          {photo.metadata.location && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Location:</span>
                              <span className="text-right">{photo.metadata.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Tags */}
                    {photo.tags && photo.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-1">
                          {photo.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="pt-4 border-t space-y-2">
                      <Button className="w-full" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Heart className="h-4 w-4 mr-2" />
                        {photo.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  )
}