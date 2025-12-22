/**
 * Sidebar de navegación
 */

import {
  MessageSquare,
  Users,
  Building2,
  TrendingUp,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'

const navItems = [
  { icon: MessageSquare, label: 'Chat', path: '/' },
  { icon: Users, label: 'Contactos', path: '/contacts' },
  { icon: Building2, label: 'Empresas', path: '/companies' },
  { icon: TrendingUp, label: 'Oportunidades', path: '/deals' },
  { icon: Calendar, label: 'Actividades', path: '/activities' },
]

export function Sidebar() {
  const { sidebarState, toggleSidebar } = useUIStore()
  const isCollapsed = sidebarState === 'collapsed'

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full bg-surface-900 border-r border-surface-700',
        'transition-all duration-300 ease-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header del sidebar */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-surface-700">
        {!isCollapsed && (
          <span className="text-xl font-bold text-white">AgentCRM</span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'text-surface-300 hover:text-white hover:bg-surface-800',
              'transition-all duration-200',
              isCollapsed && 'justify-center'
            )}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </a>
        ))}
      </nav>

      {/* Footer del sidebar */}
      <div className="px-2 py-4 border-t border-surface-700">
        <a
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg',
            'text-surface-300 hover:text-white hover:bg-surface-800',
            'transition-all duration-200',
            isCollapsed && 'justify-center'
          )}
          title={isCollapsed ? 'Configuración' : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium">Configuración</span>
          )}
        </a>
      </div>
    </aside>
  )
}

