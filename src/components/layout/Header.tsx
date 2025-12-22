/**
 * Header de la aplicación (para páginas que no son el chat)
 */

import { Menu, Bell, Search } from 'lucide-react'
import { IconButton, Avatar, Input } from '@/components/common'
import { useUIStore } from '@/stores'

interface HeaderProps {
  title?: string
  showSearch?: boolean
}

export function Header({ title, showSearch = false }: HeaderProps) {
  const { setMobileMenuOpen } = useUIStore()

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-surface-900 border-b border-surface-700">
      <div className="flex items-center gap-4">
        {/* Menú móvil */}
        <IconButton
          icon={<Menu className="w-5 h-5" />}
          label="Abrir menú"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden"
        />

        {/* Título */}
        {title && (
          <h1 className="text-xl font-semibold text-white">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Búsqueda */}
        {showSearch && (
          <div className="hidden md:block">
            <Input
              placeholder="Buscar..."
              leftIcon={<Search className="w-4 h-4" />}
              className="w-64"
            />
          </div>
        )}

        {/* Notificaciones */}
        <IconButton
          icon={<Bell className="w-5 h-5" />}
          label="Notificaciones"
        />

        {/* Avatar del usuario */}
        <Avatar name="Usuario Demo" size="sm" />
      </div>
    </header>
  )
}

