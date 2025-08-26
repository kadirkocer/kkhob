"use client"

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LanguageSwitcher } from '@/components/language-switcher'
import { 
  Home, 
  Search, 
  Plus, 
  Settings, 
  Database,
  Menu,
  Moon,
  Sun
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
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

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
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
                
                <div className="space-y-1">
                  {mainHobbies.map((hobby) => (
                    <SidebarLink
                      key={hobby.id}
                      href={`/hobbies/${hobby.id}`}
                      icon={<span className="text-sm">{hobby.icon}</span>}
                      label={hobby.name}
                      collapsed={false}
                      style={{ color: hobby.color }}
                    />
                  ))}
                </div>
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