/**
 * Layout principal de la aplicación
 */

import { type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { sidebarState } = useUIStore()

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      {/* Sidebar */}
      {sidebarState !== 'hidden' && <Sidebar />}

      {/* Contenido principal */}
      <main
        className={cn(
          'flex-1 overflow-hidden transition-all duration-300',
          sidebarState === 'collapsed' && 'ml-0'
        )}
      >
        {children}
      </main>
    </div>
  )
}


