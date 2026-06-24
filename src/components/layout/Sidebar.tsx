/**
 * Sidebar de navegación
 * Diseño premium con efectos visuales modernos
 */

import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  RefreshCw,
  CheckSquare,
  Calculator,
  FileSignature,
  Building2,
  Cpu,
} from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'

// Opciones de navegación principal
const navItems = [
  { icon: MessageSquare, label: 'Chat', path: 'chat' },
  { icon: CheckSquare, label: 'Tareas', path: 'tareas' },
  { icon: Briefcase, label: 'Ofertas', path: 'ofertas' },
  { icon: RefreshCw, label: 'Ciclo de vida', path: 'ciclo' },
  { icon: FileSignature, label: 'Procesos de contratación', path: 'procesos' },
  { icon: Calculator, label: 'Cotizador', path: 'cotizador' },
]

interface SidebarProps {
  currentView: string
  onNavigate: (view: string) => void
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { sidebarState, toggleSidebar, theme, toggleTheme } = useUIStore()
  const isCollapsed = sidebarState === 'collapsed'
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
            CRM
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
              'flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left',
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
              <span className="text-sm font-medium leading-tight">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Selector de equipo / tema */}
      <div className={cn('px-3 py-4 border-t', isHey ? 'border-white/10' : 'border-orange-100')}>
        <button
          onClick={toggleTheme}
          className={cn(
            'flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left transition-all duration-200',
            isHey
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 hover:from-cyan-500/30'
              : 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 border border-orange-200 hover:from-orange-200',
            isCollapsed && 'justify-center px-2'
          )}
          title={isCollapsed ? (isHey ? 'Hey Tech' : 'Banregio') : undefined}
        >
          {isHey ? <Cpu className="w-5 h-5 flex-shrink-0" /> : <Building2 className="w-5 h-5 flex-shrink-0" />}
          {!isCollapsed && (
            <span className="text-sm font-medium leading-tight">{isHey ? 'Hey Tech' : 'Banregio'}</span>
          )}
        </button>
      </div>

    </aside>
  )
}


