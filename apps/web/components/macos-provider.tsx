'use client'

import { useEffect } from 'react'
import { initMacOSOptimizations, isMacOS } from '@/lib/macos-optimizations'

interface MacOSProviderProps {
  children: React.ReactNode
}

export function MacOSProvider({ children }: MacOSProviderProps) {
  useEffect(() => {
    // Initialize macOS optimizations on client-side only
    if (isMacOS) {
      initMacOSOptimizations()
    }
  }, [])

  return <>{children}</>
}