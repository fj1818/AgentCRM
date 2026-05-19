import { useState } from 'react'
import { cn } from '@/utils'
import { useUIStore } from '@/stores'

interface FilterableProductTableProps {
  data: Record<string, unknown>[]
  columns: string[]
  titulo?: string
}

type ProductFilter = 'todos' | 'tdc' | 'tpv' | 'cheques'

export function FilterableProductTable({ data, columns, titulo }: FilterableProductTableProps) {
  const [filtro, setFiltro] = useState<ProductFilter>('todos')
  const { theme } = useUIStore()
  const isHey = theme === 'hey'

  // Filtrar datos según la selección
  const datosFiltrados = data.filter(row => {
    if (filtro === 'todos') return true

    const rowStr = Object.values(row).join(' ').toLowerCase()
    
    switch (filtro) {
      case 'tdc':
        return (rowStr.includes('tarjeta') || rowStr.includes('tdc')) && !rowStr.includes('sin')
      case 'tpv':
        return rowStr.includes('tpv') || rowStr.includes('terminal') || rowStr.includes('punto')
      case 'cheques':
        return rowStr.includes('nómina') || rowStr.includes('nomina') || rowStr.includes('cheque') || rowStr.includes('cuenta')
      default:
        return true
    }
  })

  const columnaTotal = columns.find(col => col.toLowerCase().includes('total') || col.toLowerCase().includes('cantidad'))
  const totalGeneral = columnaTotal 
    ? datosFiltrados.reduce((sum, row) => sum + (Number(row[columnaTotal]) || 0), 0)
    : datosFiltrados.length

  return (
    <div className={cn(
      "rounded-xl overflow-hidden",
      isHey 
        ? "bg-white/5 border border-white/10" 
        : "bg-white border border-orange-100"
    )}>
      {/* Header con filtro */}
      <div className={cn(
        "p-4 border-b flex items-center justify-between",
        isHey 
          ? "bg-white/5 border-white/10" 
          : "bg-orange-50 border-orange-100"
      )}>
        <h3 className={cn(
          "font-semibold text-lg",
          isHey ? "text-white" : "text-gray-800"
        )}>
          {titulo || 'Distribución de Clientes por Producto'}
        </h3>

        {/* Dropdown de filtro */}
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-sm",
            isHey ? "text-white/60" : "text-gray-600"
          )}>
            Filtrar por:
          </span>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as ProductFilter)}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer",
              isHey
                ? "bg-white/10 text-white border border-white/20 hover:bg-white/15"
                : "bg-white text-gray-700 border border-orange-200 hover:bg-orange-50"
            )}
          >
            <option value="todos">📊 Todos ({data.length})</option>
            <option value="tdc">💳 TDC</option>
            <option value="tpv">🖥️ TPV</option>
            <option value="cheques">💰 Cheques</option>
          </select>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className={cn(
        "px-4 py-2 text-sm",
        isHey ? "text-white/60" : "text-gray-600"
      )}>
        Mostrando <strong className={isHey ? "text-white" : "text-orange-600"}>{datosFiltrados.length}</strong> registros
        {columnaTotal && (
          <span> • Total: <strong className={isHey ? "text-white" : "text-orange-600"}>{totalGeneral.toLocaleString()}</strong></span>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={cn(
              "border-b",
              isHey 
                ? "bg-white/5 border-white/10" 
                : "bg-orange-50 border-orange-100"
            )}>
              {columns.map((col) => (
                <th
                  key={col}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider",
                    isHey ? "text-white/80" : "text-orange-800"
                  )}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datosFiltrados.map((row, idx) => (
              <tr
                key={idx}
                className={cn(
                  "border-b transition-colors",
                  isHey
                    ? "border-white/5 hover:bg-white/5"
                    : "border-gray-100 hover:bg-orange-50/30"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className={cn(
                      "px-4 py-3 text-sm",
                      isHey ? "text-white/90" : "text-gray-700"
                    )}
                  >
                    {String(row[col] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {datosFiltrados.length === 0 && (
        <div className={cn(
          "p-8 text-center",
          isHey ? "text-white/60" : "text-gray-500"
        )}>
          No hay registros que coincidan con el filtro seleccionado
        </div>
      )}
    </div>
  )
}
