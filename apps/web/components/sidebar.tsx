"use client"

import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LanguageSwitcher } from '@/components/language-switcher'
import { 
  Home, 
  Search, 
  Plus, 
  Settings, 
  Database,
  Menu,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Edit3,
  Check,
  X
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect, useRef } from 'react'
import { motion, Reorder } from 'framer-motion'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [editingHobbyId, setEditingHobbyId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const queryClient = useQueryClient()
  const { theme, setTheme } = useTheme()
  // Use try-catch for useTranslation to handle cases when i18n isn't ready
  let t: any = (key: string) => key
  let ready = false
  
  try {
    const translation = useTranslation()
    t = translation.t
    ready = translation.ready
  } catch (error) {
    // Fallback when i18n isn't initialized
    t = (key: string) => {
      const fallbacks: Record<string, string> = {
        dashboard: 'Dashboard',
        search: 'Search', 
        admin: 'Admin',
        settings: 'Settings'
      }
      return fallbacks[key] || key
    }
  }
  
  const { data: hobbies = [] } = useQuery({
    queryKey: ['hobbies'],
    queryFn: () => api.getHobbies(),
    enabled: mounted, // Only fetch after mounting
  })

  // Mutation for updating hobby order/position
  const updateHobbyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updateHobby(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hobbies'] })
    },
    onError: (error) => {
      alert(`Hobby güncellenirken hata oluştu: ${error.message}`)
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Handle hobby reordering
  const handleReorder = async (newOrder: any[]) => {
    // Update positions based on new order
    for (let i = 0; i < newOrder.length; i++) {
      const hobby = newOrder[i]
      if (hobby.position !== i) {
        await updateHobbyMutation.mutateAsync({
          id: hobby.id,
          data: { 
            name: hobby.name,
            slug: hobby.slug,
            icon: hobby.icon,
            color: hobby.color,
            position: i 
          }
        })
      }
    }
  }

  // Handle hobby rename
  const startRenaming = (hobby: any) => {
    setEditingHobbyId(hobby.id)
    setEditingName(hobby.name)
  }

  const cancelRenaming = () => {
    setEditingHobbyId(null)
    setEditingName('')
  }

  const saveRename = async () => {
    if (!editingHobbyId) return
    
    const hobby = hobbies.find(h => h.id === editingHobbyId)
    if (!hobby) return

    await updateHobbyMutation.mutateAsync({
      id: editingHobbyId,
      data: {
        name: editingName,
        slug: editingName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        icon: hobby.icon,
        color: hobby.color,
        position: hobby.position
      }
    })
    
    setEditingHobbyId(null)
    setEditingName('')
  }

  const mainHobbies = hobbies.filter(h => !h.parent_id)
  
  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-gray-900 border-r transition-all duration-200",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <h2 className="font-semibold text-lg">Hobby Manager</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {/* Main navigation */}
          <div className="space-y-1">
            <SidebarLink 
              href="/" 
              icon={<Home className="h-4 w-4" />}
              label={ready ? t('dashboard') : 'Dashboard'}
              collapsed={collapsed}
            />
            <SidebarLink 
              href="/search" 
              icon={<Search className="h-4 w-4" />}
              label={ready ? t('search') : 'Search'}
              collapsed={collapsed}
            />
            <SidebarLink 
              href="/admin" 
              icon={<Database className="h-4 w-4" />}
              label={ready ? t('admin') : 'Admin'}
              collapsed={collapsed}
            />
          </div>

          {/* Hobbies section */}
          {!collapsed && (
            <>
              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Hobbies
                  </h3>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <Reorder.Group
                  axis="y"
                  values={mainHobbies.sort((a, b) => a.position - b.position)}
                  onReorder={handleReorder}
                  className="space-y-1"
                >
                  {mainHobbies.sort((a, b) => a.position - b.position).map((hobby) => (
                    <Reorder.Item key={hobby.id} value={hobby} className="cursor-grab">
                      <EditableHobbyTreeNode
                        hobby={hobby}
                        subHobbies={hobbies.filter(h => h.parent_id === hobby.id)}
                        collapsed={false}
                        isEditing={editingHobbyId === hobby.id}
                        editingName={editingName}
                        setEditingName={setEditingName}
                        startRenaming={() => startRenaming(hobby)}
                        cancelRenaming={cancelRenaming}
                        saveRename={saveRename}
                        updateMutation={updateHobbyMutation}
                      />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            </>
          )}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={toggleTheme}
            className="w-full justify-start"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {!collapsed && <span className="ml-2">Toggle theme</span>}
          </Button>
          
          <LanguageSwitcher />
          
          <SidebarLink 
            href="/settings" 
            icon={<Settings className="h-4 w-4" />}
            label={ready ? t('settings') : 'Settings'}
            collapsed={collapsed}
          />
        </div>
      </div>
    </div>
  )
}

interface SidebarLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  collapsed: boolean
  style?: React.CSSProperties
}

function SidebarLink({ href, icon, label, collapsed, style }: SidebarLinkProps) {
  return (
    <Link href={href}>
      <Button 
        variant="ghost" 
        size={collapsed ? "icon" : "sm"}
        className="w-full justify-start"
        style={style}
      >
        {icon}
        {!collapsed && <span className="ml-2 truncate">{label}</span>}
      </Button>
    </Link>
  )
}

interface EditableHobbyTreeNodeProps {
  hobby: any
  subHobbies: any[]
  collapsed: boolean
  isEditing: boolean
  editingName: string
  setEditingName: (name: string) => void
  startRenaming: () => void
  cancelRenaming: () => void
  saveRename: () => void
  updateMutation: any
}

function EditableHobbyTreeNode({ 
  hobby, 
  subHobbies, 
  collapsed, 
  isEditing, 
  editingName, 
  setEditingName, 
  startRenaming, 
  cancelRenaming, 
  saveRename,
  updateMutation 
}: EditableHobbyTreeNodeProps) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div className="space-y-1">
      <div className="flex items-center group">
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-3 w-3 text-muted-foreground mr-1" />
        </div>
        
        {isEditing ? (
          <div className="flex-1 flex items-center space-x-2">
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="h-8 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRename()
                if (e.key === 'Escape') cancelRenaming()
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={saveRename}
              disabled={updateMutation.isPending}
            >
              <Check className="h-3 w-3 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={cancelRenaming}
            >
              <X className="h-3 w-3 text-red-600" />
            </Button>
          </div>
        ) : (
          <>
            <Link href={`/hobbies/${hobby.id}`} className="flex-1">
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-start pr-1"
                style={{ color: hobby.color }}
              >
                <span className="text-sm">{hobby.icon}</span>
                <span className="ml-2 truncate">{hobby.name}</span>
              </Button>
            </Link>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={startRenaming}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              {subHobbies.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      
      {expanded && subHobbies.length > 0 && (
        <div className="ml-4 space-y-1">
          {subHobbies.map((subHobby) => (
            <SidebarLink
              key={subHobby.id}
              href={`/hobbies/${subHobby.id}`}
              icon={<span className="text-xs">{subHobby.icon}</span>}
              label={subHobby.name}
              collapsed={false}
              style={{ color: subHobby.color, fontSize: '0.875rem' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}