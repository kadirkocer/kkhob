'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Eye,
  Heart,
  Edit3,
  ExternalLink,
  Share,
  FileText,
  Tag,
  Clock,
  User
} from 'lucide-react'

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
  hobby_name?: string
  hobby_icon?: string
  hobby_color?: string
  type_key?: string
  content_markdown?: string
}

interface EntryModalProps {
  entry: Entry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EntryModal({ entry, open, onOpenChange }: EntryModalProps) {
  if (!entry) return null

  const handleEdit = () => {
    alert(`Makale düzenleme özelliği yakında eklenecek! (Makale ID: ${entry.id})`)
  }

  const handleOpenNewTab = () => {
    alert(`Yeni sekmede açma özelliği yakında eklenecek! (Makale ID: ${entry.id})`)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: entry.title,
        text: entry.description,
        url: window.location.href
      }).catch(() => {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href)
        alert('Link panoya kopyalandı!')
      })
    } else {
      // Fallback for browsers without native sharing
      navigator.clipboard.writeText(window.location.href)
      alert('Link panoya kopyalandı!')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {entry && (
          <div className="space-y-6">
            {/* Header */}
            <DialogHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <DialogTitle className="text-2xl pr-8">{entry.title}</DialogTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {entry.view_count} views
                    </div>
                    {entry.is_favorite && (
                      <div className="flex items-center">
                        <Heart className="h-3 w-3 mr-1 fill-red-500 text-red-500" />
                        Favori
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags and Hobby */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {entry.hobby_name && (
                    <Badge 
                      variant="secondary" 
                      style={{ color: entry.hobby_color }}
                    >
                      {entry.hobby_icon} {entry.hobby_name}
                    </Badge>
                  )}
                  <Badge variant="outline">{entry.type_key || 'makale'}</Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share className="h-4 w-4 mr-2" />
                    Paylaş
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <Separator />

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-4">
                {entry.description && (
                  <div>
                    <h3 className="font-medium mb-2">Açıklama</h3>
                    <p className="text-muted-foreground">{entry.description}</p>
                  </div>
                )}

                {entry.content_markdown && (
                  <div>
                    <h3 className="font-medium mb-2">İçerik</h3>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap bg-muted p-4 rounded text-sm">
                        {entry.content_markdown}
                      </pre>
                    </div>
                  </div>
                )}

                {!entry.description && !entry.content_markdown && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">İçerik bulunamadı</h3>
                    <p className="text-muted-foreground mb-4">Bu makale henüz içerik eklenmemiş.</p>
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      İçerik Ekle
                    </Button>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Entry Info */}
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Makale Bilgileri
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID</span>
                      <span>#{entry.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tür</span>
                      <Badge variant="outline" className="text-xs">
                        {entry.type_key || 'makale'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Oluşturulma</span>
                      <span>{new Date(entry.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Güncellenme</span>
                      <span>{new Date(entry.updated_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Görüntülenme</span>
                      <span>{entry.view_count}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center">
                      <Tag className="h-4 w-4 mr-2" />
                      Etiketler
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="space-y-2">
                  <h3 className="font-medium">Hızlı İşlemler</h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleEdit}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Makaleyi Düzenle
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleOpenNewTab}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Yeni Sekmede Aç
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleShare}>
                      <Share className="h-4 w-4 mr-2" />
                      Paylaş
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}