/**
 * Sidebar de navegación
 * Diseño premium con efectos visuales modernos
 */

import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'

// Solo Chat visible - las tablas de datos permanecen ocultas
const navItems = [
  { icon: MessageSquare, label: 'Chat', path: 'chat' },
]

interface SidebarProps {
  currentView: string
  onNavigate: (view: string) => void
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { sidebarState, toggleSidebar, theme, toggleTheme } = useUIStore()
  const isCollapsed = sidebarState === 'collapsed'
  const isBanregio = theme === 'banregio'
  const isHey = theme === 'hey'

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full border-r transition-all duration-300 ease-out',
        isHey 
          ? 'bg-[#1a1f2e] border-white/10' 
          : 'bg-white border-orange-100',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header del sidebar */}
      <div 
        className={cn(
          "flex items-center justify-between px-4 py-5 border-b",
          isHey ? "border-white/10" : "border-orange-100"
        )}
      >
        {!isCollapsed && (
          <span 
            className={cn(
              "text-xl font-bold",
              isHey 
                ? "text-white" 
                : "text-orange-500"
            )}
          >
            {isBanregio ? 'Banregio' : 'Hey'}
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-xl transition-all duration-200",
            isHey 
              ? "text-white/60 hover:text-white hover:bg-white/10" 
              : "text-gray-400 hover:text-gray-600 hover:bg-orange-50"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full',
              'transition-all duration-200',
              currentView === item.path
                ? isHey
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 border border-orange-200'
                : isHey
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-orange-50',
              isCollapsed && 'justify-center px-2'
            )}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Toggle de tema - Botones de marca */}
      <div 
        className={cn(
          "px-3 py-4 border-t",
          isHey ? "border-white/10" : "border-orange-100"
        )}
      >
        <button
          onClick={toggleTheme}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl w-full',
            'transition-all duration-300 transform hover:scale-[1.02]',
            'font-bold text-white shadow-lg',
            isCollapsed ? 'px-2 py-3' : 'px-4 py-3',
            // El botón muestra la opción contraria (a qué cambiar)
            isBanregio
              ? 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 shadow-gray-800/30'
              : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 shadow-orange-500/30'
          )}
          title={isCollapsed ? (isBanregio ? 'Cambiar a Hey' : 'Cambiar a Banregio') : undefined}
        >
          {isCollapsed ? (
            <span className="text-base font-bold">
              {isBanregio ? 'H' : 'B'}
            </span>
          ) : (
            <span className="text-sm font-semibold">
              {isBanregio ? 'Hey' : 'Banregio'}
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}
