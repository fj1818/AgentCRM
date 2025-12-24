/**
 * Componente de tabla de datos
 * Renderiza tablas dinámicas basadas en los datos del CRM
 * - Formatea montos como moneda
 * - Muestra totales al final de columnas numéricas
 */

import { cn } from '@/utils'
import type { TableData as TableDataType } from '@/types'

interface DataTableProps {
  data: TableDataType
  className?: string
  onRowClick?: (row: Record<string, unknown>) => void
}

/** Detecta si un valor es un monto (número grande que debería formatearse como moneda) */
function esMonto(value: unknown): boolean {
  return typeof value === 'number' && Math.abs(value) >= 1000
}

/** Formatea un número como moneda MXN */
function formatearMoneda(value: number): string {
  return `$${Math.abs(value).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/** Determina qué columnas son numéricas/moneda basándose en los datos */
function detectarColumnasNumericas(headers: string[], rows: Record<string, unknown>[]): Set<string> {
  const columnasNumericas = new Set<string>()
  
  for (const header of headers) {
    // Revisar primeros valores para determinar si es numérica
    const primerValor = rows[0]?.[header]
    if (esMonto(primerValor)) {
      columnasNumericas.add(header)
    }
  }
  
  return columnasNumericas
}

/** Calcula totales para columnas numéricas */
function calcularTotales(headers: string[], rows: Record<string, unknown>[], columnasNumericas: Set<string>): Record<string, number> {
  const totales: Record<string, number> = {}
  
  for (const header of headers) {
    if (columnasNumericas.has(header)) {
      totales[header] = rows.reduce((sum, row) => {
        const val = row[header]
        return sum + (typeof val === 'number' ? val : 0)
      }, 0)
    }
  }
  
  return totales
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

  const columnasNumericas = detectarColumnasNumericas(headers, rows)
  const totales = calcularTotales(headers, rows, columnasNumericas)

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-surface-700', className)}>
      <table className="w-full">
        <thead className="bg-surface-800">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className={cn(
                  'px-4 py-3 text-sm font-medium text-surface-300 uppercase tracking-wider',
                  columnasNumericas.has(header) ? 'text-right' : 'text-left'
                )}
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
                  className={cn(
                    'px-4 py-3 text-sm text-surface-200 whitespace-nowrap',
                    columnasNumericas.has(header) ? 'text-right font-mono' : 'text-left'
                  )}
                >
                  {formatCellValue(row[header], columnasNumericas.has(header))}
                </td>
              ))}
            </tr>
          ))}
          
          {/* Fila de totales si hay columnas numéricas */}
          {columnasNumericas.size > 0 && (
            <tr className="bg-blue-900/30 font-bold border-t-2 border-blue-500">
              {headers.map((header, idx) => (
                <td
                  key={header}
                  className={cn(
                    'px-4 py-3 text-sm text-blue-200 whitespace-nowrap',
                    columnasNumericas.has(header) ? 'text-right font-mono' : 'text-left'
                  )}
                >
                  {idx === 0 && !columnasNumericas.has(header) 
                    ? 'TOTAL' 
                    : (totales[header] !== undefined ? formatearMoneda(totales[header]) : '')}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

/** Formatea el valor de una celda para mostrar */
function formatCellValue(value: unknown, esMoneda: boolean = false): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (value instanceof Date) return value.toLocaleDateString('es-ES')
  if (typeof value === 'object') return JSON.stringify(value)
  
  // Formatear como moneda si aplica
  if (esMoneda && typeof value === 'number') {
    return formatearMoneda(value)
  }
  
  return String(value)
}

