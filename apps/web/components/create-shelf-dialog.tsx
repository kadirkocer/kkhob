'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus,
  Folder,
  Grid3X3,
  List,
  Calendar,
  Star,
  Save,
  Loader2,
  BookOpen,
  Image as ImageIcon,
  Music,
  Video
} from 'lucide-react'

interface CreateShelfDialogProps {
  hobbyId?: number
  className?: string
}

export function CreateShelfDialog({ hobbyId, className }: CreateShelfDialogProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hobby_id: hobbyId || 1,
    type: 'general',
    view_mode: 'grid',
    sort_by: 'created_at',
    sort_order: 'DESC'
  })

  const { data: hobbies = [] } = useQuery({
    queryKey: ['hobbies'],
    queryFn: () => api.getHobbies(),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createShelf(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelves'] })
      setOpen(false)
      setFormData({
        name: '',
        description: '',
        hobby_id: hobbyId || 1,
        type: 'general',
        view_mode: 'grid',
        sort_by: 'created_at',
        sort_order: 'DESC'
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    createMutation.mutate(formData)
  }

  const shelfTypes = [
    { value: 'general', label: 'General', icon: Folder, description: 'Mixed content shelf' },
    { value: 'reading', label: 'Reading List', icon: BookOpen, description: 'Books and articles' },
    { value: 'gallery', label: 'Photo Gallery', icon: ImageIcon, description: 'Image collections' },
    { value: 'playlist', label: 'Playlist', icon: Music, description: 'Music and audio' },
    { value: 'watchlist', label: 'Watch Later', icon: Video, description: 'Videos and movies' },
    { value: 'favorites', label: 'Favorites', icon: Star, description: 'Starred content' }
  ]

  const viewModes = [
    { value: 'grid', label: 'Grid View', icon: Grid3X3 },
    { value: 'list', label: 'List View', icon: List }
  ]

  const sortOptions = [
    { value: 'created_at', label: 'Date Added' },
    { value: 'title', label: 'Title' },
    { value: 'updated_at', label: 'Last Updated' }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Plus className="h-4 w-4 mr-2" />
          New Shelf
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Shelf</DialogTitle>
          <DialogDescription>
            Create a new shelf to organize your entries
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hobby">Hobby *</Label>
            <Select 
              value={formData.hobby_id.toString()} 
              onValueChange={(value) => setFormData({...formData, hobby_id: parseInt(value)})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hobbies
                  .sort((a, b) => {
                    // Sort parent hobbies first, then sub-hobbies under their parents
                    if (!a.parent_id && !b.parent_id) return a.name.localeCompare(b.name)
                    if (!a.parent_id) return -1
                    if (!b.parent_id) return 1
                    if (a.parent_id !== b.parent_id) return a.parent_id - b.parent_id
                    return a.name.localeCompare(b.name)
                  })
                  .map((hobby) => (
                  <SelectItem key={hobby.id} value={hobby.id.toString()}>
                    <div className="flex items-center">
                      <span className="mr-2">{hobby.icon}</span>
                      <span className={hobby.parent_id ? "ml-4 text-sm" : "font-medium"}>{hobby.name}</span>
                      {hobby.parent_id && <span className="ml-1 text-xs text-muted-foreground opacity-70">(sub)</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Shelf Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter shelf name..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe what this shelf contains..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Shelf Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({...formData, type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {shelfTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-start space-x-2">
                        <Icon className="h-4 w-4 mt-0.5" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default View</Label>
              <Select 
                value={formData.view_mode} 
                onValueChange={(value) => setFormData({...formData, view_mode: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {viewModes.map((mode) => {
                    const Icon = mode.icon
                    return (
                      <SelectItem key={mode.value} value={mode.value}>
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 mr-2" />
                          {mode.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select 
                value={formData.sort_by} 
                onValueChange={(value) => setFormData({...formData, sort_by: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.name.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Shelf
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}