'use client'

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import { useState } from 'react'

export function LanguageSwitcher() {
  const { i18n, ready } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  
  if (!ready) {
    return (
      <Button variant="ghost" size="sm" className="flex items-center gap-2 text-xs" disabled>
        <Globe className="h-3 w-3" />
        EN
      </Button>
    )
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'tr' : 'en'
    i18n.changeLanguage(newLang)
  }

  const currentLang = i18n.language === 'tr' ? 'TR' : 'EN'

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 text-xs"
      title={`Switch to ${i18n.language === 'en' ? 'Turkish' : 'English'}`}
    >
      <Globe className="h-3 w-3" />
      {currentLang}
    </Button>
  )
}