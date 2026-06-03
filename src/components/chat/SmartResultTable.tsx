/**
 * Tabla de resultados del chat — versión avanzada.
 * - Scroll vertical y horizontal con encabezado fijo (sticky)
 * - Ordenamiento por columna
 * - Búsqueda dentro de los resultados
 * - Fila de totales para columnas numéricas
 * - Exportar a CSV
 * - Click en IDE abre detalle del cliente; ofertas abren su modal
 */

import { useMemo, useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Search, Eye } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import { OfferDetailModal } from './OfferDetailModal'
import { ClientDetailsModal } from '@/components/clientes/ClientDetailsModal'
import { traducirColumna, formatearValor } from './tableFormat'

interface TablaData {
  columnas: string[]
  filas: Record<string, unknown>[]
  titulo?: string
  paginate?: boolean
  pageSize?: number
}

type SortDir = 'asc' | 'desc' | null

export function SmartResultTable({ tabla }: { tabla: TablaData }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [selectedRow, setSelectedRow] = useState<Record<string, unknown> | null>(null)
  const [selectedClientIde, setSelectedClientIde] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const todasLasColumnas = useMemo(
    () =>
      tabla.columnas.length > 0
        ? tabla.columnas
        : [...new Set(tabla.filas.flatMap((fila) => Object.keys(fila)))],
    [tabla.columnas, tabla.filas]
  )

  const columnasOcultas = ['items', 'clientes', 'tdc', 'telefonos', 'correos', 'direcciones', 'descripcionOferta']

  const colIdOferta = todasLasColumnas.find(
    (col) => col.toLowerCase() === 'idoferta' || col.toLowerCase() === 'id_oferta'
  )
  const esTablaOfertas = !!colIdOferta

  const columnasVistas = new Set<string>()
  const columnasFiltradas = todasLasColumnas.filter((col) => {
    const colLower = col.toLowerCase()
    if (columnasVistas.has(colLower)) return false
    columnasVistas.add(colLower)
    return !columnasOcultas.includes(col) && !col.includes('_ide') && col !== colIdOferta
  })

  // Columnas numéricas (según primera fila) para alinear y totalizar
  const columnasNumericas = useMemo(() => {
    const primera = tabla.filas[0] || {}
    return new Set(columnasFiltradas.filter((c) => typeof primera[c] === 'number'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabla.filas, columnasFiltradas.join(',')])

  // Filtrado por búsqueda
  const filasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return tabla.filas
    const q = busqueda.toLowerCase()
    return tabla.filas.filter((fila) =>
      columnasFiltradas.some((col) => String(fila[col] ?? '').toLowerCase().includes(q))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, tabla.filas, columnasFiltradas.join(',')])

  // Ordenamiento
  const filasOrdenadas = useMemo(() => {
    if (!sortCol || !sortDir) return filasFiltradas
    const copia = [...filasFiltradas]
    copia.sort((a, b) => {
      const va = a[sortCol]
      const vb = b[sortCol]
      if (va === vb) return 0
      if (va === null || va === undefined) return 1
      if (vb === null || vb === undefined) return -1
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va
      }
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb), 'es')
        : String(vb).localeCompare(String(va), 'es')
    })
    return copia
  }, [filasFiltradas, sortCol, sortDir])

  // Paginación
  const shouldPaginate = tabla.paginate ?? false
  const pageSize = tabla.pageSize ?? 20
  const totalPages = Math.max(1, Math.ceil(filasOrdenadas.length / pageSize))
  const pageSafe = Math.min(currentPage, totalPages)
  const startIdx = (pageSafe - 1) * pageSize
  const filasActuales = shouldPaginate ? filasOrdenadas.slice(startIdx, startIdx + pageSize) : filasOrdenadas

  // Totales por columna numérica (sobre todas las filas filtradas)
  const totales = useMemo(() => {
    const acc: Record<string, number> = {}
    columnasNumericas.forEach((col) => {
      acc[col] = filasOrdenadas.reduce((s, f) => s + (Number(f[col]) || 0), 0)
    })
    return acc
  }, [filasOrdenadas, columnasNumericas])

  const hayTotales = columnasNumericas.size > 0 && filasOrdenadas.length > 1

  const handleSort = (col: string) => {
    if (sortCol !== col) {
      setSortCol(col)
      setSortDir('desc')
    } else {
      setSortDir((d) => (d === 'desc' ? 'asc' : d === 'asc' ? null : 'desc'))
      if (sortDir === 'asc') setSortCol(null)
    }
  }

  const exportarCSV = () => {
    const encabezado = columnasFiltradas.map((c) => `"${traducirColumna(c)}"`).join(',')
    const filas = filasOrdenadas.map((fila) =>
      columnasFiltradas.map((c) => `"${String(fila[c] ?? '').replace(/"/g, '""')}"`).join(',')
    )
    const csv = '﻿' + [encabezado, ...filas].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(tabla.titulo || 'resultados').replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!tabla.filas.length) return null

  return (
    <>
      <div className="max-w-5xl mx-auto animate-fade-in my-4">
        <div
          className={cn(
            'rounded-2xl shadow-xl overflow-hidden border',
            isHey ? 'bg-white/5 border-white/10 backdrop-blur-xl' : 'bg-white border-orange-100'
          )}
        >
          {/* Barra superior: título + búsqueda + export */}
          <div
            className={cn(
              'px-4 py-3 flex flex-wrap items-center gap-3 justify-between border-b',
              isHey
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-white border-white/10'
                : 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 border-orange-100'
            )}
          >
            <span className="font-semibold text-sm truncate">{tabla.titulo || 'Resultados'}</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                  className={cn(
                    'absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5',
                    isHey ? 'text-white/40' : 'text-orange-400'
                  )}
                />
                <input
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Filtrar..."
                  className={cn(
                    'pl-8 pr-3 py-1.5 text-xs rounded-lg border w-36 focus:outline-none focus:ring-1',
                    isHey
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-cyan-500/30'
                      : 'bg-white border-orange-200 text-gray-700 placeholder:text-orange-300 focus:ring-orange-400/30'
                  )}
                />
              </div>
              <button
                onClick={exportarCSV}
                title="Exportar a CSV"
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  isHey
                    ? 'bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30'
                    : 'bg-orange-200 text-orange-700 hover:bg-orange-300'
                )}
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>
            </div>
          </div>

          {/* Contenedor con scroll en ambos ejes y encabezado fijo */}
          <div className="overflow-auto max-h-[28rem]">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className={cn(isHey ? 'bg-[#1b2335]' : 'bg-orange-50')}>
                  {columnasFiltradas.map((col, i) => {
                    const esNum = columnasNumericas.has(col)
                    return (
                      <th
                        key={i}
                        onClick={() => handleSort(col)}
                        className={cn(
                          'px-4 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer select-none',
                          esNum ? 'text-right' : 'text-left',
                          isHey ? 'text-cyan-300 hover:bg-white/5' : 'text-orange-600 hover:bg-orange-100'
                        )}
                      >
                        <span className={cn('inline-flex items-center gap-1', esNum && 'flex-row-reverse')}>
                          {traducirColumna(col)}
                          {sortCol === col ? (
                            sortDir === 'asc' ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : sortDir === 'desc' ? (
                              <ArrowDown className="w-3 h-3" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-40" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </span>
                      </th>
                    )
                  })}
                  {esTablaOfertas && (
                    <th
                      className={cn(
                        'px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider',
                        isHey ? 'text-cyan-300' : 'text-orange-600'
                      )}
                    >
                      Detalle
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className={cn('divide-y', isHey ? 'divide-white/10' : 'divide-orange-100')}>
                {filasActuales.map((fila, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={cn('transition-colors', isHey ? 'hover:bg-white/5' : 'hover:bg-orange-50/50')}
                  >
                    {columnasFiltradas.map((col, colIdx) => {
                      const esNum = columnasNumericas.has(col)
                      const esId = col.toLowerCase() === 'ide' || col.toLowerCase() === 'id'
                      return (
                        <td
                          key={colIdx}
                          className={cn(
                            'px-4 py-3 whitespace-nowrap',
                            esNum ? 'text-right tabular-nums' : 'text-left',
                            isHey ? 'text-white/80' : 'text-gray-700'
                          )}
                        >
                          {esId ? (
                            <button
                              onClick={() => setSelectedClientIde(String(fila[col]))}
                              className={cn(
                                'font-mono hover:underline cursor-pointer transition-colors',
                                isHey ? 'text-cyan-400 hover:text-cyan-300' : 'text-orange-600 hover:text-orange-700'
                              )}
                            >
                              {formatearValor(fila[col], col)}
                            </button>
                          ) : (
                            formatearValor(fila[col], col)
                          )}
                        </td>
                      )
                    })}
                    {esTablaOfertas && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedRow(fila)}
                          className={cn(
                            'p-2 rounded-lg transition-all shadow-md active:scale-95',
                            isHey
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500'
                              : 'bg-gradient-to-r from-orange-400 to-amber-400 text-white hover:from-orange-300 hover:to-amber-300'
                          )}
                          title="Ver detalle completo"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              {hayTotales && (
                <tfoot className="sticky bottom-0 z-10">
                  <tr className={cn(isHey ? 'bg-[#1b2335] text-white' : 'bg-orange-100 text-orange-800')}>
                    {columnasFiltradas.map((col, i) => (
                      <td
                        key={i}
                        className={cn(
                          'px-4 py-2.5 font-semibold text-xs whitespace-nowrap',
                          columnasNumericas.has(col) ? 'text-right tabular-nums' : 'text-left'
                        )}
                      >
                        {i === 0 && !columnasNumericas.has(col)
                          ? 'Total'
                          : columnasNumericas.has(col)
                          ? formatearValor(totales[col], col)
                          : ''}
                      </td>
                    ))}
                    {esTablaOfertas && <td />}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Pie: conteo + paginación */}
          <div
            className={cn(
              'px-4 py-2.5 text-xs font-medium flex items-center justify-between',
              isHey ? 'bg-white/5 text-white/50 border-t border-white/10' : 'bg-orange-50/50 text-gray-500 border-t border-orange-100'
            )}
          >
            <span>
              {filasOrdenadas.length} resultado{filasOrdenadas.length !== 1 ? 's' : ''}
              {busqueda && ` (filtrado de ${tabla.filas.length})`}
              {shouldPaginate && totalPages > 1 && ` · pág. ${pageSafe}/${totalPages}`}
            </span>
            {shouldPaginate && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={pageSafe === 1}
                  className={cn(
                    'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                    pageSafe === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : isHey
                      ? 'bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30'
                      : 'bg-orange-200 text-orange-700 hover:bg-orange-300'
                  )}
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={pageSafe === totalPages}
                  className={cn(
                    'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                    pageSafe === totalPages
                      ? 'opacity-50 cursor-not-allowed'
                      : isHey
                      ? 'bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30'
                      : 'bg-orange-200 text-orange-700 hover:bg-orange-300'
                  )}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <OfferDetailModal isOpen={!!selectedRow} onClose={() => setSelectedRow(null)} data={selectedRow} />
      <ClientDetailsModal
        isOpen={!!selectedClientIde}
        onClose={() => setSelectedClientIde(null)}
        ide={selectedClientIde}
      />
    </>
  )
}
