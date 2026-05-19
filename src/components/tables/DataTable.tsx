/**
 * Componente de tabla de datos
 * Renderiza tablas dinámicas basadas en los datos del CRM
 */

import { cn } from '@/utils'
import type { TableData as TableDataType } from '@/types'

interface DataTableProps {
  data: TableDataType
  className?: string
  onRowClick?: (row: Record<string, unknown>) => void
}

export function DataTable({ data, className, onRowClick }: DataTableProps) {
  const { headers, rows } = data

  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-surface-400">
        No hay datos para mostrar
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-surface-700', className)}>
      <table className="w-full">
        <thead className="bg-surface-800">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-sm font-medium text-surface-300 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-700">
          {rows.map((row, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'bg-surface-900 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-surface-800'
              )}
            >
              {headers.map((header) => (
                <td
                  key={header}
                  className="px-4 py-3 text-sm text-surface-200 whitespace-nowrap"
                >
                  {formatCellValue(row[header])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Formatea el valor de una celda para mostrar */
function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (value instanceof Date) return value.toLocaleDateString('es-ES')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}


