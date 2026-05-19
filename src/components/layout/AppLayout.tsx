/**
 * Layout principal de la aplicación
 */

import { type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'

interface AppLayoutProps {
  children: ReactNode
  currentView: string
  onNavigate: (view: string) => void
}

export function AppLayout({ children, currentView, onNavigate }: AppLayoutProps) {
  const { sidebarState } = useUIStore()

  return (
    <div className="flex h-screen bg-theme-primary overflow-hidden">
      {/* Sidebar */}
      {sidebarState !== 'hidden' && (
        <Sidebar currentView={currentView} onNavigate={onNavigate} />
      )}

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


