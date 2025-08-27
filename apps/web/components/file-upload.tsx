'use client'

import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Upload,
  X,
  File,
  Image as ImageIcon,
  Video,
  FileText,
  Check
} from 'lucide-react'

interface FileUploadProps {
  onUploadComplete?: (file: UploadedFile) => void
  onUploadError?: (error: string) => void
  acceptedTypes?: string[]
  maxSizeMB?: number
  className?: string
}

interface UploadedFile {
  filename: string
  original_filename: string
  content_type: string
  size: number
  url: string
}

const getFileIcon = (contentType: string) => {
  if (contentType.startsWith('image/')) return ImageIcon
  if (contentType.startsWith('video/')) return Video
  if (contentType.includes('text/') || contentType.includes('json')) return FileText
  return File
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function FileUpload({ 
  onUploadComplete, 
  onUploadError,
  acceptedTypes = ['image/*', 'application/pdf', 'text/*'],
  maxSizeMB = 10,
  className 
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Validate file size (convert MB to bytes)
      const maxBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxBytes) {
        throw new Error(`File size exceeds ${maxSizeMB}MB limit`)
      }

      // Validate file type
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          const baseType = type.slice(0, -2)
          return file.type.startsWith(baseType)
        }
        return file.type === type
      })

      if (!isValidType) {
        throw new Error('File type not supported')
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 20
        })
      }, 200)

      try {
        const result = await api.uploadFile(file)
        clearInterval(progressInterval)
        setUploadProgress(100)
        
        // Reset progress after a short delay
        setTimeout(() => setUploadProgress(0), 1000)
        
        return result
      } catch (error) {
        clearInterval(progressInterval)
        setUploadProgress(0)
        throw error
      }
    },
    onSuccess: (result) => {
      setUploadedFiles(prev => [...prev, result])
      onUploadComplete?.(result)
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      onUploadError?.(errorMessage)
    }
  })

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const file = files[0] // Handle one file at a time for simplicity
    uploadMutation.mutate(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeUploadedFile = (filename: string) => {
    setUploadedFiles(prev => prev.filter(f => f.filename !== filename))
  }

  return (
    <div className={className}>
      {/* Compact Upload Area */}
      <Card 
        className={`cursor-pointer transition-colors ${
          isDragOver ? 'border-primary bg-primary/10' : 'border-dashed border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Upload className={`h-6 w-6 ${
              isDragOver ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <div className="flex-1">
              <h3 className="text-sm font-medium">
                {isDragOver ? 'Drop file here' : 'Upload files'}
              </h3>
              <p className="text-xs text-muted-foreground">
                Images, PDFs, text files • Max {maxSizeMB}MB
              </p>
            </div>
            <Button variant="outline" size="sm" type="button">
              Browse
            </Button>
          </div>
        </CardContent>
      </Card>

      <Input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploadMutation.isPending && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Error Display */}
      {uploadMutation.error && (
        <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
          {uploadMutation.error.message}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-3 space-y-2">
          {uploadedFiles.map((file, index) => {
            const FileIcon = getFileIcon(file.content_type)
            return (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{file.original_filename}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Check className="h-3 w-3 text-green-600" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => removeUploadedFile(file.filename)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}