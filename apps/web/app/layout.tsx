import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../styles/macos.css'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryProvider } from '@/components/query-provider'
import { I18nProvider } from '@/components/i18n-provider'
import { Toaster } from '@/components/ui/toaster'
import { VersionBadge } from '@/components/version-badge'
import { Sidebar } from '@/components/sidebar'
import { MacOSProvider } from '@/components/macos-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hobby Manager',
  description: 'Personal hobby management application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <MacOSProvider>
          <I18nProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <QueryProvider>
                <VersionBadge />
                <div className="flex h-screen overflow-hidden">
                  <Sidebar />
                  <main className="flex-1 overflow-auto bg-gray-50/40 dark:bg-gray-900/40">
                    {children}
                  </main>
                </div>
                <Toaster />
              </QueryProvider>
            </ThemeProvider>
          </I18nProvider>
        </MacOSProvider>
      </body>
    </html>
  )
}