/**
 * Ofertas Container — módulo unificado (Prospectos + Oportunidades).
 * Layout dinámico + permisos por perfil (selector sin login), tabla,
 * detalle dinámico con sección de ciclo de vida y chat lateral unificado.
 */

import { useMemo, useState } from 'react'
import { Briefcase } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import type { Oferta, Perfil } from '@/types/ofertas.types'
import { PERFILES, buildAccessContext } from '@/config/ofertas.layout.config'
import { ofertasData } from '@/data/ofertasData'
import { OfertasTable } from './OfertasTable'
import { OfertaDetailModal } from './OfertaDetailModal'
import { OfertasChatSidebar } from './OfertasChatSidebar'

const FAMILIAS = ['', 'TDC', 'TPV', 'Cheques', 'Crédito', 'Seguros', 'Nómina']
// Etapas de ambos orígenes (ciclo de vida)
const ETAPAS = [
  '', 'No contactado', 'Interesado', 'En negociación', 'Negociación',
  'Descartado', 'Convertido', 'Fabrica', 'Entregado', 'Timbrado',
]

export function OfertasContainer() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'

  const [perfil, setPerfil] = useState<Perfil>('GERENTE')
  const [ofertas, setOfertas] = useState<Oferta[]>(() => ofertasData)
  const [seleccionada, setSeleccionada] = useState<Oferta | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [familia, setFamilia] = useState('')
  const [etapa, setEtapa] = useState('')
  const [origen, setOrigen] = useState<'' | 'cliente' | 'prospecto'>('')

  const ctx = useMemo(() => buildAccessContext(perfil), [perfil])

  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase()
    return ofertas.filter((o) => {
      if (q && !o.nombre.toLowerCase().includes(q) && !o.productoInteres.toLowerCase().includes(q) && !o.promotor.toLowerCase().includes(q)) return false
      if (familia && o.familiaProducto !== familia) return false
      if (etapa && o.etapa !== etapa) return false
      if (origen && o.origen !== origen) return false
      return true
    })
  }, [ofertas, busqueda, familia, etapa, origen])

  /** Revalida el permiso de edición del campo según el contexto antes de mutar */
  const onUpdateCampo = (idOferta: string, key: keyof Oferta, valor: unknown): boolean => {
    const campo = ctx.campos.find((c) => c.key === key)
    if (!campo || !campo.editable) return false // backend-equivalente: rechaza no autorizado
    setOfertas((prev) => prev.map((o) => (o.idOferta === idOferta ? { ...o, [key]: valor } : o)))
    setSeleccionada((prev) => (prev && prev.idOferta === idOferta ? { ...prev, [key]: valor } : prev))
    return true
  }

  const selectClass = cn(
    'px-3 py-2 text-sm rounded-lg border',
    isHey ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-orange-200 text-gray-800'
  )

  return (
    <div className={cn('flex h-full overflow-hidden', isHey ? 'bg-[#0f1219]' : 'bg-gray-50')}>
      {/* Panel principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className={cn('px-6 py-5 border-b shrink-0 flex items-center justify-between gap-4', isHey ? 'border-white/10 bg-[#1a1f2e]' : 'border-orange-100 bg-white')}>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', isHey ? 'bg-cyan-500/10 text-cyan-400' : 'bg-orange-100 text-orange-600')}>
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className={cn('text-2xl font-bold', isHey ? 'text-white' : 'text-gray-900')}>Ofertas</h1>
              <p className={cn('text-sm', isHey ? 'text-gray-400' : 'text-gray-500')}>Prospectos y oportunidades unificados</p>
            </div>
          </div>

          {/* Selector de perfil (sin login) */}
          <div className="flex items-center gap-2">
            <span className={cn('text-xs', isHey ? 'text-gray-400' : 'text-gray-500')}>Perfil</span>
            <select value={perfil} onChange={(e) => setPerfil(e.target.value as Perfil)} className={selectClass}>
              {PERFILES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Buscar por nombre, producto, promotor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={cn('flex-1 min-w-[220px] px-4 py-2 rounded-lg border text-sm', isHey ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white border-orange-200 text-gray-900 placeholder-gray-400')}
            />
            <select value={familia} onChange={(e) => setFamilia(e.target.value)} className={selectClass}>
              {FAMILIAS.map((f) => (
                <option key={f} value={f}>
                  {f || 'Todas las familias'}
                </option>
              ))}
            </select>
            <select value={etapa} onChange={(e) => setEtapa(e.target.value)} className={selectClass}>
              {ETAPAS.map((e) => (
                <option key={e} value={e}>
                  {e || 'Todas las etapas'}
                </option>
              ))}
            </select>
            <select value={origen} onChange={(e) => setOrigen(e.target.value as typeof origen)} className={selectClass}>
              <option value="">Todos los orígenes</option>
              <option value="cliente">Cliente</option>
              <option value="prospecto">Prospecto</option>
            </select>
          </div>

          <OfertasTable ofertas={filtradas} ctx={ctx} onVerDetalle={setSeleccionada} />
        </div>
      </div>

      {/* Chat lateral */}
      <div className="w-[420px] shrink-0 h-full">
        <OfertasChatSidebar />
      </div>

      {/* Modal detalle */}
      {seleccionada && (
        <OfertaDetailModal
          oferta={seleccionada}
          ctx={ctx}
          onClose={() => setSeleccionada(null)}
          onUpdateCampo={onUpdateCampo}
        />
      )}
    </div>
  )
}
