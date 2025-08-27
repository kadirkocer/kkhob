'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Palette, 
  Database, 
  Bell, 
  Shield, 
  Download, 
  Upload,
  Monitor,
  Moon,
  Sun,
  Smartphone,
  Save,
  RotateCcw,
  Trash2,
  Settings as SettingsIcon
} from 'lucide-react'

interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  defaultView: 'grid' | 'list' | 'masonry'
  itemsPerPage: number
  autoSave: boolean
  notifications: {
    newEntries: boolean
    systemUpdates: boolean
    weeklyDigest: boolean
  }
  privacy: {
    analyticsEnabled: boolean
    shareUsageData: boolean
  }
  backup: {
    autoBackup: boolean
    backupFrequency: 'daily' | 'weekly' | 'monthly'
    includeImages: boolean
  }
}

const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'en',
  defaultView: 'grid',
  itemsPerPage: 20,
  autoSave: true,
  notifications: {
    newEntries: true,
    systemUpdates: true,
    weeklyDigest: false
  },
  privacy: {
    analyticsEnabled: true,
    shareUsageData: false
  },
  backup: {
    autoBackup: false,
    backupFrequency: 'weekly',
    includeImages: true
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation()

  const { data: hobbies = [] } = useQuery({
    queryKey: ['hobbies'],
    queryFn: () => api.getHobbies(),
  })

  useEffect(() => {
    setMounted(true)
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('hobby-manager-settings')
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) })
    }
  }, [])

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.')
      const newSettings = { ...prev }
      let current = newSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i] as keyof typeof current] = { ...current[keys[i] as keyof typeof current] }
      }
      
      current[keys[keys.length - 1] as keyof typeof current] = value
      return newSettings
    })
    setHasChanges(true)
  }

  const saveSettings = () => {
    localStorage.setItem('hobby-manager-settings', JSON.stringify(settings))
    if (settings.theme !== theme) {
      setTheme(settings.theme)
    }
    if (settings.language !== i18n.language) {
      i18n.changeLanguage(settings.language)
    }
    setHasChanges(false)
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('hobby-manager-settings')
    setHasChanges(true)
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'hobby-manager-settings.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!mounted) return <div className="container mx-auto p-6">Loading...</div>

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your hobby management preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="secondary">Unsaved changes</Badge>
          )}
          <Button onClick={saveSettings} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Theme & Display
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value) => updateSetting('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center">
                        <Monitor className="h-4 w-4 mr-2" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select 
                  value={settings.language} 
                  onValueChange={(value) => updateSetting('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="tr">Türkçe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default View</Label>
                <Select 
                  value={settings.defaultView} 
                  onValueChange={(value) => updateSetting('defaultView', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid View</SelectItem>
                    <SelectItem value="list">List View</SelectItem>
                    <SelectItem value="masonry">Masonry View</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Items per page</Label>
                <Select 
                  value={settings.itemsPerPage.toString()} 
                  onValueChange={(value) => updateSetting('itemsPerPage', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 items</SelectItem>
                    <SelectItem value="20">20 items</SelectItem>
                    <SelectItem value="50">50 items</SelectItem>
                    <SelectItem value="100">100 items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2" />
                Application Preferences
              </CardTitle>
              <CardDescription>
                Configure how the application behaves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save entries</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save changes as you type
                  </p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Hobby Management</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Active Hobbies ({hobbies.filter(h => !h.parent_id).length})</Label>
                    <div className="flex flex-wrap gap-1">
                      {hobbies.filter(h => !h.parent_id).map(hobby => (
                        <Badge key={hobby.id} variant="outline" style={{ color: hobby.color }}>
                          {hobby.icon} {hobby.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Sub-hobbies ({hobbies.filter(h => h.parent_id).length})</Label>
                    <div className="flex flex-wrap gap-1">
                      {hobbies.filter(h => h.parent_id).slice(0, 6).map(hobby => (
                        <Badge key={hobby.id} variant="secondary" style={{ color: hobby.color }}>
                          {hobby.icon} {hobby.name}
                        </Badge>
                      ))}
                      {hobbies.filter(h => h.parent_id).length > 6 && (
                        <Badge variant="secondary">+{hobbies.filter(h => h.parent_id).length - 6} more</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you'd like to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New entries added</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new content is added to your hobbies
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.newEntries}
                  onCheckedChange={(checked) => updateSetting('notifications.newEntries', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about app updates and new features
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.systemUpdates}
                  onCheckedChange={(checked) => updateSetting('notifications.systemUpdates', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Get a weekly summary of your hobby activity
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyDigest}
                  onCheckedChange={(checked) => updateSetting('notifications.weeklyDigest', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy & Analytics
              </CardTitle>
              <CardDescription>
                Control your data and privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve the app by sharing anonymous usage data
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.analyticsEnabled}
                  onCheckedChange={(checked) => updateSetting('privacy.analyticsEnabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Share usage statistics</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow sharing of aggregated usage patterns for research
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.shareUsageData}
                  onCheckedChange={(checked) => updateSetting('privacy.shareUsageData', checked)}
                />
              </div>

              <div className="pt-4">
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This will permanently delete all your hobby data. This action cannot be undone.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Backup & Export
              </CardTitle>
              <CardDescription>
                Manage your data backups and export options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup your data to local storage
                  </p>
                </div>
                <Switch
                  checked={settings.backup.autoBackup}
                  onCheckedChange={(checked) => updateSetting('backup.autoBackup', checked)}
                />
              </div>

              {settings.backup.autoBackup && (
                <>
                  <div className="space-y-2">
                    <Label>Backup frequency</Label>
                    <Select 
                      value={settings.backup.backupFrequency} 
                      onValueChange={(value) => updateSetting('backup.backupFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Include images</Label>
                      <p className="text-sm text-muted-foreground">
                        Include image files in backups (may increase size)
                      </p>
                    </div>
                    <Switch
                      checked={settings.backup.includeImages}
                      onCheckedChange={(checked) => updateSetting('backup.includeImages', checked)}
                    />
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-4">
                <Label>Manual Actions</Label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportSettings}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Danger Zone</p>
              <p className="text-xs text-muted-foreground">
                Reset all settings to their default values
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={resetSettings}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}