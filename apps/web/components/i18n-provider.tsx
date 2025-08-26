'use client'

import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'

interface I18nProviderProps {
  children: React.ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [i18n, setI18n] = useState<any>(null)

  useEffect(() => {
    // Dynamically import and initialize i18n only on client side
    import('@/lib/i18n').then((i18nModule) => {
      setI18n(i18nModule.default)
    })
  }, [])

  if (!i18n) {
    // Return children without i18n provider during loading
    return <>{children}</>
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  )
}