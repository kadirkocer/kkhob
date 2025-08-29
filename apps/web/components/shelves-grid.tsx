'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  FolderOpen,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react'

interface ShelvesGridProps {
  hobbyId?: number
  className?: string
}

export function ShelvesGrid({ hobbyId, className }: ShelvesGridProps) {
  const [mounted, setMounted] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [shelfName, setShelfName] = useState('')
  const [shelfDescription, setShelfDescription] = useState('')
  const [shelfType, setShelfType] = useState('general')
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const { t, ready } = useTranslation()
  const queryClient = useQueryClient()

  const createShelfMutation = useMutation({
    mutationFn: async (data: any) => {
      const shelf = await api.createShelf(data)
      
      // If there are images to upload, upload them after shelf creation
      if (uploadedImages.length > 0 && shelf.id) {
        for (const image of uploadedImages) {
          try {
            const uploadResult = await api.uploadFile(image)
            // Add the uploaded image as a shelf item
            await api.addShelfItem(shelf.id, {
              external_url: uploadResult.url,
              title: image.name.replace(/\.[^/.]+$/, ""),
              cover_url: uploadResult.url
            })
          } catch (error) {
            console.error('Failed to upload image:', error)
          }
        }
      }
      
      return shelf
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelves'] })
      setCreateDialogOpen(false)
      setShelfName('')
      setShelfDescription('')
      setShelfType('general')
      setUploadedImages([])
    },
    onError: (error) => {
      alert(`Raf oluşturulamadı: ${error.message}`)
    }
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length !== files.length) {
      alert('Lütfen sadece resim dosyaları seçin!')
    }
    
    setUploadedImages(prev => [...prev, ...imageFiles])
    
    // Reset input
    if (event.target) {
      event.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateShelf = () => {
    if (!shelfName.trim()) {
      alert('Raf adı gerekli!')
      return
    }
    
    createShelfMutation.mutate({
      hobby_id: hobbyId,
      name: shelfName.trim(),
      description: shelfDescription.trim(),
      type: shelfType
    })
  }

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
        <p className="text-red-500">Raflar yüklenirken hata oluştu</p>
      </div>
    )
  }

  if (shelves.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">Henüz raf yok</p>
        <p className="text-muted-foreground mb-4">
          İçeriklerinizi organize etmek için ilk rafınızı oluşturun
        </p>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Raf Oluştur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Raf Oluştur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="shelf-name">Raf Adı *</Label>
                <Input
                  id="shelf-name"
                  value={shelfName}
                  onChange={(e) => setShelfName(e.target.value)}
                  placeholder="Raf adını girin..."
                />
              </div>
              <div>
                <Label htmlFor="shelf-description">Açıklama</Label>
                <Textarea
                  id="shelf-description"
                  value={shelfDescription}
                  onChange={(e) => setShelfDescription(e.target.value)}
                  placeholder="Raf açıklamasını girin..."
                />
              </div>
              <div>
                <Label htmlFor="shelf-type">Raf Türü</Label>
                <Select value={shelfType} onValueChange={setShelfType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Genel</SelectItem>
                    <SelectItem value="gallery">Galeri</SelectItem>
                    <SelectItem value="library">Kütüphane</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fotoğraflar (İsteğe bağlı)</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-muted-foreground/50 transition-colors">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Kitap kapakları, fotoğraflar veya görseller yükleyin
                      </p>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Fotoğraf Seç
                        </Button>
                      </Label>
                    </div>
                  </div>
                  
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                      {uploadedImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-muted rounded border-2 border-background flex items-center justify-center text-xs text-center p-1">
                            <span className="truncate">{file.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleCreateShelf} disabled={createShelfMutation.isPending}>
                  {createShelfMutation.isPending ? 'Oluşturuluyor...' : 'Raf Oluştur'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                    {shelf.type === 'gallery' ? 'Galeri' : 
                     shelf.type === 'library' ? 'Kütüphane' : 'Genel'}
                  </Badge>
                  {shelf.view_mode === 'grid' ? (
                    <Grid3x3 className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <List className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {shelf.item_count} {shelf.item_count === 1 ? 'öğe' : 'öğe'}
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
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center h-48 space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium">Yeni Raf Oluştur</p>
                <p className="text-sm text-muted-foreground">
                  İçeriklerinizi düzenleyin
                </p>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Raf Oluştur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="shelf-name-2">Raf Adı *</Label>
              <Input
                id="shelf-name-2"
                value={shelfName}
                onChange={(e) => setShelfName(e.target.value)}
                placeholder="Raf adını girin..."
              />
            </div>
            <div>
              <Label htmlFor="shelf-description-2">Açıklama</Label>
              <Textarea
                id="shelf-description-2"
                value={shelfDescription}
                onChange={(e) => setShelfDescription(e.target.value)}
                placeholder="Raf açıklamasını girin..."
              />
            </div>
            <div>
              <Label htmlFor="shelf-type-2">Raf Türü</Label>
              <Select value={shelfType} onValueChange={setShelfType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Genel</SelectItem>
                  <SelectItem value="gallery">Galeri</SelectItem>
                  <SelectItem value="library">Kütüphane</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fotoğraflar (İsteğe bağlı)</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-muted-foreground/50 transition-colors">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Kitap kapakları, fotoğraflar veya görseller yükleyin
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload-2"
                    />
                    <Label htmlFor="image-upload-2" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Fotoğraf Seç
                      </Button>
                    </Label>
                  </div>
                </div>
                
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-muted rounded border-2 border-background flex items-center justify-center text-xs text-center p-1">
                          <span className="truncate">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleCreateShelf} disabled={createShelfMutation.isPending}>
                {createShelfMutation.isPending ? 'Oluşturuluyor...' : 'Raf Oluştur'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}