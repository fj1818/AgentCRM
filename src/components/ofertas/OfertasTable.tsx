/**
 * Tabla de Ofertas con columnas dinámicas según el perfil (UserAccessContext).
 */

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import type { CampoCompilado, Oferta, UserAccessContext } from '@/types/ofertas.types'
import { formatValue } from './ofertasFormat'

interface Props {
  ofertas: Oferta[]
  ctx: UserAccessContext
  onVerDetalle: (oferta: Oferta) => void
}

export function OfertasTable({ ofertas, ctx, onVerDetalle }: Props) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [pagina, setPagina] = useState(1)
  const porPagina = 15

  // Columnas = campos visibles para este perfil, en el orden del layout
  const columnas: CampoCompilado[] = ctx.campos

  const totalPaginas = Math.max(1, Math.ceil(ofertas.length / porPagina))
  const datos = ofertas.slice((pagina - 1) * porPagina, pagina * porPagina)

  useEffect(() => {
    setPagina(1)
  }, [ofertas])

  return (
    <div className={cn('rounded-xl border overflow-hidden', isHey ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white')}>
      <div className={cn('px-4 py-2 text-sm', isHey ? 'bg-white/5 border-b border-white/10 text-gray-400' : 'bg-orange-50 border-b border-orange-100 text-gray-600')}>
        Mostrando <strong>{datos.length}</strong> de <strong>{ofertas.length}</strong> ofertas
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={isHey ? 'bg-white/5' : 'bg-orange-50'}>
            <tr>
              {columnas.map((c) => (
                <th
                  key={String(c.key)}
                  className={cn('px-3 py-3 text-left text-xs font-medium uppercase tracking-wider', isHey ? 'text-gray-400' : 'text-gray-500')}
                >
                  {c.label}
                </th>
              ))}
              <th className={cn('px-3 py-3 text-center text-xs font-medium uppercase tracking-wider', isHey ? 'text-gray-400' : 'text-gray-500')}>
                Detalle
              </th>
            </tr>
          </thead>
          <tbody className={cn('divide-y', isHey ? 'divide-white/5' : 'divide-orange-100')}>
            {datos.map((oferta) => (
              <tr key={oferta.idOferta} className={isHey ? 'hover:bg-white/5' : 'hover:bg-orange-50/50'}>
                {columnas.map((c) => (
                  <td key={String(c.key)} className={cn('px-3 py-2 text-sm', isHey ? 'text-gray-300' : 'text-gray-700')}>
                    {formatValue(c, oferta)}
                  </td>
                ))}
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => onVerDetalle(oferta)}
                    className={cn('p-1.5 rounded-lg transition-colors', isHey ? 'hover:bg-white/10 text-cyan-400' : 'hover:bg-orange-100 text-orange-500')}
                    title="Ver detalle"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className={cn('px-4 py-3 flex items-center justify-between border-t', isHey ? 'border-white/10' : 'border-orange-100')}>
        <button
          onClick={() => setPagina((p) => Math.max(1, p - 1))}
          disabled={pagina === 1}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors',
            pagina === 1
              ? isHey ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
              : isHey ? 'text-cyan-400 hover:bg-white/10' : 'text-orange-500 hover:bg-orange-100'
          )}
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
        <span className={cn('text-sm', isHey ? 'text-gray-400' : 'text-gray-600')}>
          {pagina} / {totalPaginas}
        </span>
        <button
          onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          disabled={pagina === totalPaginas}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors',
            pagina === totalPaginas
              ? isHey ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
              : isHey ? 'text-cyan-400 hover:bg-white/10' : 'text-orange-500 hover:bg-orange-100'
          )}
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
