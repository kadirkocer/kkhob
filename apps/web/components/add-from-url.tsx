'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Link,
  Globe,
  BookOpen,
  Video,
  Image as ImageIcon,
  FileText,
  Download,
  Loader2,
  Check,
  AlertCircle,
  Plus,
  Tag,
  X
} from 'lucide-react'

interface AddFromUrlProps {
  onSuccess?: (data: any) => void
  className?: string
}

interface PreviewData {
  title: string
  description?: string
  image?: string
  favicon?: string
  siteName?: string
  url: string
  type: 'webpage' | 'image' | 'video' | 'article' | 'unknown'
}

export function AddFromUrl({ onSuccess, className }: AddFromUrlProps) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [error, setError] = useState('')
  const [selectedHobby, setSelectedHobby] = useState('')
  const [selectedShelf, setSelectedShelf] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const { t, ready } = useTranslation()

  // Mock hobbies data - in real app would come from API
  const hobbies = [
    { id: 1, name: 'Technology', slug: 'technology' },
    { id: 2, name: 'Photography', slug: 'photography' },
    { id: 3, name: 'Books & Cinema', slug: 'books-cinema' },
    { id: 4, name: 'Music', slug: 'music' }
  ]

  // Mock shelves data - in real app would come from API based on selected hobby
  const shelves = [
    { id: 1, name: 'Reading List', hobby_id: 3 },
    { id: 2, name: 'Tech Articles', hobby_id: 1 },
    { id: 3, name: 'Inspiration', hobby_id: 2 },
    { id: 4, name: 'Tutorials', hobby_id: 1 }
  ]

  const detectUrlType = (url: string): PreviewData['type'] => {
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const videoExts = ['.mp4', '.webm', '.ogg', '.mov']
    
    if (imageExts.some(ext => url.toLowerCase().includes(ext))) return 'image'
    if (videoExts.some(ext => url.toLowerCase().includes(ext))) return 'video'
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) return 'video'
    if (url.includes('medium.com') || url.includes('dev.to') || url.includes('hashnode.com')) return 'article'
    return 'webpage'
  }

  const fetchUrlPreview = async () => {
    if (!url.trim()) return

    setIsLoading(true)
    setError('')
    setPreview(null)

    try {
      // Simulate API call to fetch URL metadata
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock preview data based on URL
      const mockPreview: PreviewData = {
        title: url.includes('github.com') ? 'GitHub Repository' :
               url.includes('youtube.com') ? 'YouTube Video' :
               url.includes('medium.com') ? 'Medium Article' :
               'Web Page',
        description: 'This is a mock description of the content from the URL. In a real implementation, this would be fetched from the page metadata.',
        image: '/api/placeholder/400/200',
        favicon: '/api/placeholder/16/16',
        siteName: new URL(url).hostname,
        url: url,
        type: detectUrlType(url)
      }

      setPreview(mockPreview)
      setTitle(mockPreview.title)
      setDescription(mockPreview.description || '')

      // Auto-suggest tags based on URL
      if (url.includes('github.com')) setTags(['code', 'github', 'development'])
      else if (url.includes('youtube.com')) setTags(['video', 'tutorial'])
      else if (url.includes('medium.com')) setTags(['article', 'reading'])

    } catch (err) {
      setError('Failed to fetch URL preview. Please check the URL and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!preview || !selectedHobby) return

    setIsLoading(true)
    try {
      // Simulate API call to save the item
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const savedItem = {
        id: Date.now(),
        title: title || preview.title,
        description: description,
        url: preview.url,
        image: preview.image,
        hobby_id: selectedHobby,
        shelf_id: selectedShelf,
        tags: tags,
        type: preview.type,
        created_at: new Date().toISOString()
      }

      onSuccess?.(savedItem)
      
      // Reset form
      setUrl('')
      setPreview(null)
      setTitle('')
      setDescription('')
      setTags([])
      setSelectedHobby('')
      setSelectedShelf('')
      
    } catch (err) {
      setError('Failed to save item. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = (type: PreviewData['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'article': return <FileText className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Link className="h-4 w-4 mr-2" />
          Add from URL
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Content from URL</DialogTitle>
          <DialogDescription>
            Add web pages, articles, images, videos, and other content to your hobbies
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">From URL</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="space-y-4">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUrlPreview()}
                />
                <Button 
                  onClick={fetchUrlPreview}
                  disabled={isLoading || !url.trim()}
                  variant="outline"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </p>
              )}
            </div>

            {/* URL Preview */}
            {preview && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(preview.type)}
                    <CardTitle className="text-lg">{preview.type.charAt(0).toUpperCase() + preview.type.slice(1)}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {preview.siteName}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Preview Image */}
                    {preview.image && (
                      <div className="md:col-span-1">
                        <div className="aspect-video bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </div>
                    )}
                    
                    {/* Preview Content */}
                    <div className={preview.image ? "md:col-span-2" : "md:col-span-3"}>
                      <h3 className="font-medium mb-2">{preview.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {preview.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 truncate">
                        {preview.url}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Form Fields */}
            {preview && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hobby">Hobby *</Label>
                    <Select value={selectedHobby} onValueChange={setSelectedHobby}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hobby" />
                      </SelectTrigger>
                      <SelectContent>
                        {hobbies.map((hobby) => (
                          <SelectItem key={hobby.id} value={hobby.id.toString()}>
                            {hobby.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shelf">Shelf (Optional)</Label>
                    <Select value={selectedShelf} onValueChange={setSelectedShelf}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shelf" />
                      </SelectTrigger>
                      <SelectContent>
                        {shelves
                          .filter(shelf => !selectedHobby || shelf.hobby_id.toString() === selectedHobby)
                          .map((shelf) => (
                            <SelectItem key={shelf.id} value={shelf.id.toString()}>
                              {shelf.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Tags Input */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-3 w-3 ml-1 p-0"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      id="tags"
                      placeholder="Add tags..."
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddTag}
                      disabled={!currentTag.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setPreview(null)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isLoading || !selectedHobby}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                    Save to {hobbies.find(h => h.id.toString() === selectedHobby)?.name || 'Hobby'}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Bulk Import</h3>
              <p className="text-muted-foreground mb-4">
                Import multiple URLs at once from a text file or paste a list
              </p>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}