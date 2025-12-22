/**
 * Header de tabla con búsqueda y filtros
 */

import { Search, Filter, Download } from 'lucide-react'
import { Input, IconButton } from '@/components/common'

interface TableHeaderProps {
  title: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  onFilterClick?: () => void
  onExportClick?: () => void
  totalCount?: number
}

export function TableHeader({
  title,
  searchValue = '',
  onSearchChange,
  onFilterClick,
  onExportClick,
  totalCount,
}: TableHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {totalCount !== undefined && (
          <p className="text-sm text-surface-400">
            {totalCount} registro{totalCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onSearchChange && (
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar..."
            leftIcon={<Search className="w-4 h-4" />}
            className="w-64"
          />
        )}
        
        {onFilterClick && (
          <IconButton
            icon={<Filter className="w-5 h-5" />}
            label="Filtrar"
            onClick={onFilterClick}
          />
        )}
        
        {onExportClick && (
          <IconButton
            icon={<Download className="w-5 h-5" />}
            label="Exportar"
            onClick={onExportClick}
          />
        )}
      </div>
    </div>
  )
}

