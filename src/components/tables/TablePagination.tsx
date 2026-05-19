/**
 * Componente de paginación para tablas
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/common'

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}

export function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: TablePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 px-2">
      {/* Info de registros */}
      <p className="text-sm text-surface-400">
        Mostrando {startItem}-{endItem} de {totalItems}
      </p>

      <div className="flex items-center gap-4">
        {/* Selector de tamaño de página */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-400">Mostrar:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-surface-800 border border-surface-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Controles de paginación */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Anterior
          </Button>

          {/* Números de página */}
          <div className="flex items-center gap-1 mx-2">
            {generatePageNumbers(currentPage, totalPages).map((page, index) =>
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-surface-400">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'text-surface-300 hover:bg-surface-700'
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Genera los números de página a mostrar */
function generatePageNumbers(
  current: number,
  total: number
): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total]
  }

  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
}


