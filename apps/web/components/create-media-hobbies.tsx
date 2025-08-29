'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Video } from 'lucide-react'

export function CreateMediaHobbies() {
  const queryClient = useQueryClient()
  
  const createHobbyMutation = useMutation({
    mutationFn: api.createHobby,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hobbies'] })
    }
  })

  const createPhotographyHobby = () => {
    createHobbyMutation.mutate({
      name: 'Photography',
      slug: 'photography',
      icon: '📸',
      color: '#8B5CF6',
      position: 1
    })
  }

  const createVideographyHobby = () => {
    createHobbyMutation.mutate({
      name: 'Videography', 
      slug: 'videography',
      icon: '🎥',
      color: '#EF4444',
      position: 2
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Media Hobbies</CardTitle>
        <CardDescription>
          Add Photography and Videography hobbies with gallery functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={createPhotographyHobby}
            disabled={createHobbyMutation.isPending}
            className="h-20 flex-col space-y-2"
            variant="outline"
          >
            <Camera className="h-6 w-6" />
            <span>Create Photography Hobby</span>
          </Button>
          
          <Button
            onClick={createVideographyHobby}
            disabled={createHobbyMutation.isPending}
            className="h-20 flex-col space-y-2"
            variant="outline"
          >
            <Video className="h-6 w-6" />
            <span>Create Videography Hobby</span>
          </Button>
        </div>
        
        {createHobbyMutation.error && (
          <p className="text-sm text-destructive mt-2">
            Error: {createHobbyMutation.error.message}
          </p>
        )}
        
        {createHobbyMutation.isSuccess && (
          <p className="text-sm text-green-600 mt-2">
            Hobby created successfully!
          </p>
        )}
      </CardContent>
    </Card>
  )
}