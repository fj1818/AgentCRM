/**
 * Ofertas Container — réplica del módulo Ofertas del prototipo DiseñoNuevoCRM.
 * Lista (mismas columnas) + buscador + filtros multiselect en cascada +
 * paginación + selección para reasignar + Nueva oferta + detalle.
 */

import { useEffect, useMemo, useState } from 'react'
import { Eye, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'
import { useUIStore } from '@/stores'
import { useOfertasStore } from '@/stores/ofertas.store'
import { useNavStore } from '@/stores/nav.store'
import { cn } from '@/utils'
import type { Offer } from '@/data/ofertas-seed'
import { money } from './ofertasFormat'
import { OfertasFiltros } from './OfertasFiltros'
import { OfertaDetalle } from './OfertaDetalle'
import { NuevaOfertaModal } from './NuevaOfertaModal'
import { ReasignarModal } from './ReasignarModal'

const PAGE_SIZE = 10

export function OfertasContainer() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const offers = useOfertasStore((s) => s.offers)

  const [filtradas, setFiltradas] = useState<Offer[]>(offers)
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [detalle, setDetalle] = useState<Offer | null>(null)
  const [nuevaOpen, setNuevaOpen] = useState(false)
  const [reasignarOpen, setReasignarOpen] = useState(false)
  const [seleccion, setSeleccion] = useState<Record<string, boolean>>({})

  // Abrir oferta cuando se navega desde Ciclo de vida (cruce con módulo Ofertas)
  const ofertaPendiente = useNavStore((s) => s.ofertaPendiente)
  const limpiarOfertaPendiente = useNavStore((s) => s.limpiarOfertaPendiente)
  useEffect(() => {
    if (!ofertaPendiente) return
    const o = offers.find((x) => (x.raw['ID de la oferta'] || '') === ofertaPendiente)
    if (o) setDetalle(o)
    limpiarOfertaPendiente()
  }, [ofertaPendiente, offers, limpiarOfertaPendiente])

  const onApply = useMemo(() => (f: Offer[]) => { setFiltradas(f); setPagina(1) }, [])

  const conBusqueda = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return filtradas
    return filtradas.filter((o) => {
      const hay = [o.ejecutivo, o.tipoOferta, o.familia, o.producto, o.etapa, o.fechaCierre,
        ...Object.values(o.raw)].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [filtradas, busqueda])

  const totalPaginas = Math.max(1, Math.ceil(conBusqueda.length / PAGE_SIZE))
  const pageRows = conBusqueda.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

  const idsSeleccionados = Object.keys(seleccion).filter((k) => seleccion[k])

  const thCls = cn('px-3 py-3 text-left text-xs font-medium uppercase tracking-wider', isHey ? 'text-gray-400' : 'text-gray-500')
  const tdCls = cn('px-3 py-2 text-sm', isHey ? 'text-gray-300' : 'text-gray-700')

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', isHey ? 'bg-[#0f1219]' : 'bg-gray-50')}>
      {/* Header */}
      <div className={cn('px-6 py-4 border-b shrink-0 flex items-center gap-3', isHey ? 'border-white/10 bg-[#1a1f2e]' : 'border-orange-100 bg-white')}>
        <div className={cn('p-2 rounded-lg', isHey ? 'bg-cyan-500/10 text-cyan-400' : 'bg-orange-100 text-orange-600')}><Briefcase className="w-6 h-6" /></div>
        <div>
          <h1 className={cn('text-2xl font-bold', isHey ? 'text-white' : 'text-gray-900')}>Cartera de Ofertas</h1>
          <p className={cn('text-sm', isHey ? 'text-gray-400' : 'text-gray-500')}>Gestiona y analiza tus clientes y prospectos</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Buscador */}
        <input
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setPagina(1) }}
          placeholder="Buscar por nombre, promotor..."
          className={cn('w-full px-4 py-2.5 rounded-xl border text-sm', isHey ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white border-orange-200 text-gray-900 placeholder-gray-400')}
        />

        {/* Filtros */}
        <OfertasFiltros offers={offers} onApply={onApply} />

        {/* Tabla */}
        <div className={cn('rounded-xl border overflow-hidden', isHey ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white')}>
          <div className={cn('px-4 py-2 flex items-center justify-between gap-3', isHey ? 'bg-white/5 border-b border-white/10' : 'bg-orange-50 border-b border-orange-100')}>
            <span className={cn('text-sm', isHey ? 'text-gray-400' : 'text-gray-600')}>
              Mostrando <b>{conBusqueda.length}</b> de <b>{offers.length}</b> ofertas
            </span>
            <div className="flex gap-2">
              <button onClick={() => setNuevaOpen(true)} className={cn('px-3 py-1.5 text-sm rounded-lg font-medium', isHey ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'bg-orange-500 text-white hover:bg-orange-600')}>+ Nueva oferta</button>
              <button onClick={() => setReasignarOpen(true)} disabled={idsSeleccionados.length === 0}
                className={cn('px-3 py-1.5 text-sm rounded-lg font-medium border',
                  idsSeleccionados.length === 0
                    ? isHey ? 'border-white/10 text-gray-600' : 'border-gray-200 text-gray-400'
                    : isHey ? 'border-cyan-500/40 text-cyan-300 hover:bg-white/5' : 'border-orange-300 text-orange-600 hover:bg-orange-50')}>
                Reasignar ({idsSeleccionados.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isHey ? 'bg-white/5' : 'bg-orange-50'}>
                <tr>
                  <th className={thCls}>Ejecutivo</th>
                  <th className={thCls}>Tipo de oferta</th>
                  <th className={thCls}>Familia de producto</th>
                  <th className={thCls}>Producto</th>
                  <th className={thCls}>Etapa</th>
                  <th className={thCls}>Monto de la oferta</th>
                  <th className={thCls}>Fecha de cierre</th>
                  <th className={cn(thCls, 'text-center')}>Detalle</th>
                  <th className={cn(thCls, 'text-center')}>Reasignar</th>
                </tr>
              </thead>
              <tbody className={cn('divide-y', isHey ? 'divide-white/5' : 'divide-orange-100')}>
                {pageRows.length === 0 && (
                  <tr><td colSpan={9} className={cn('px-3 py-6 text-center text-sm', isHey ? 'text-gray-500' : 'text-gray-400')}>Sin resultados con los filtros actuales.</td></tr>
                )}
                {pageRows.map((o) => {
                  const oid = o.raw['ID de la oferta'] || ''
                  return (
                    <tr key={oid} className={isHey ? 'hover:bg-white/5' : 'hover:bg-orange-50/50'}>
                      <td className={tdCls}>{o.ejecutivo}</td>
                      <td className="px-3 py-2">
                        <span className={cn('inline-flex px-2 py-0.5 text-xs font-medium rounded-full',
                          o.tipoOferta === 'Cliente' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400')}>{o.tipoOferta}</span>
                      </td>
                      <td className={tdCls}>{o.familia}</td>
                      <td className={tdCls}>{o.producto}</td>
                      <td className={tdCls}>{o.etapa}</td>
                      <td className={cn('px-3 py-2 text-sm font-medium', isHey ? 'text-emerald-400' : 'text-emerald-600')}>{money(o.monto)}</td>
                      <td className={tdCls}>{o.fechaCierre}</td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => setDetalle(o)} className={cn('p-1.5 rounded-lg', isHey ? 'hover:bg-white/10 text-cyan-400' : 'hover:bg-orange-100 text-orange-500')} title="Ver detalle"><Eye className="w-4 h-4" /></button>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input type="checkbox" checked={!!seleccion[oid]} onChange={(e) => setSeleccion((p) => ({ ...p, [oid]: e.target.checked }))} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className={cn('px-4 py-3 flex items-center justify-between border-t', isHey ? 'border-white/10' : 'border-orange-100')}>
            <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1}
              className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm', pagina === 1 ? (isHey ? 'text-gray-600' : 'text-gray-400') : (isHey ? 'text-cyan-400 hover:bg-white/10' : 'text-orange-500 hover:bg-orange-100'))}>
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className={cn('text-sm', isHey ? 'text-gray-400' : 'text-gray-600')}>{pagina} / {totalPaginas}</span>
            <button onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}
              className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm', pagina === totalPaginas ? (isHey ? 'text-gray-600' : 'text-gray-400') : (isHey ? 'text-cyan-400 hover:bg-white/10' : 'text-orange-500 hover:bg-orange-100'))}>
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {detalle && <OfertaDetalle offer={detalle} onClose={() => setDetalle(null)} />}
      {nuevaOpen && <NuevaOfertaModal onClose={() => setNuevaOpen(false)} />}
      {reasignarOpen && <ReasignarModal ids={idsSeleccionados} onClose={() => { setReasignarOpen(false); setSeleccion({}) }} />}
    </div>
  )
}
