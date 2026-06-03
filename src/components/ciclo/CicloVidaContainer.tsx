/**
 * Módulo "Ciclo de vida" (barra lateral). Lista todos los clientes/prospectos
 * carterizados con buscador y filtro, y muestra el ciclo de vida 360° del
 * seleccionado. Reutiliza Ciclo360View.
 */

import { useMemo, useState } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import { listPersonas } from '@/data/ciclo-seed'
import { Ciclo360View } from './Ciclo360View'

type Filtro = 'todos' | 'clientes' | 'prospectos'

export function CicloVidaContainer() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const personas = useMemo(() => listPersonas(), [])

  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [rfcSel, setRfcSel] = useState<string>(personas[0]?.rfc || '')

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return personas.filter((p) => {
      if (filtro === 'clientes' && !p.esCliente) return false
      if (filtro === 'prospectos' && p.esCliente) return false
      if (q && !p.nombre.toLowerCase().includes(q) && !p.rfc.toLowerCase().includes(q)) return false
      return true
    })
  }, [personas, busqueda, filtro])

  const totalClientes = personas.filter((p) => p.esCliente).length
  const totalProspectos = personas.length - totalClientes

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', isHey ? 'bg-[#0f1219]' : 'bg-gray-50')}>
      {/* Header */}
      <div className={cn('px-6 py-4 border-b shrink-0 flex items-center gap-3', isHey ? 'border-white/10 bg-[#1a1f2e]' : 'border-orange-100 bg-white')}>
        <div className={cn('p-2 rounded-lg', isHey ? 'bg-cyan-500/10 text-cyan-400' : 'bg-orange-100 text-orange-600')}><RefreshCw className="w-6 h-6" /></div>
        <div>
          <h1 className={cn('text-2xl font-bold', isHey ? 'text-white' : 'text-gray-900')}>Ciclo de vida</h1>
          <p className={cn('text-sm', isHey ? 'text-gray-400' : 'text-gray-500')}>
            {totalClientes} clientes carterizados · {totalProspectos} prospectos
          </p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Lista de personas */}
        <aside className={cn('w-80 shrink-0 border-r flex flex-col', isHey ? 'border-white/10 bg-[#1a1f2e]' : 'border-orange-100 bg-white')}>
          <div className={cn('p-3 border-b space-y-2', isHey ? 'border-white/10' : 'border-orange-100')}>
            <div className="relative">
              <Search className={cn('absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4', isHey ? 'text-gray-500' : 'text-gray-400')} />
              <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o RFC…"
                className={cn('w-full pl-8 pr-3 py-2 text-sm rounded-lg border', isHey ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500' : 'bg-white border-orange-200 text-gray-800 placeholder:text-gray-400')} />
            </div>
            <div className="flex gap-1">
              {(['todos', 'clientes', 'prospectos'] as Filtro[]).map((f) => (
                <button key={f} onClick={() => setFiltro(f)}
                  className={cn('flex-1 py-1.5 text-xs rounded-lg capitalize',
                    filtro === f ? (isHey ? 'bg-cyan-500 text-white' : 'bg-orange-500 text-white') : (isHey ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-orange-50 text-gray-600 hover:bg-orange-100'))}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {lista.map((p) => (
              <button key={p.rfc} onClick={() => setRfcSel(p.rfc)}
                className={cn('block w-full text-left px-3 py-2.5 border-b',
                  isHey ? 'border-white/5' : 'border-orange-50',
                  rfcSel === p.rfc ? (isHey ? 'bg-cyan-500/10' : 'bg-orange-50') : (isHey ? 'hover:bg-white/5' : 'hover:bg-orange-50/50'))}>
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('text-sm font-medium truncate', isHey ? 'text-white' : 'text-gray-800')}>{p.nombre}</span>
                  <span className={cn('shrink-0 text-[10px] px-1.5 py-0.5 rounded-full', p.esCliente ? (p.estatus === 'Inactivo' ? 'bg-gray-500/20 text-gray-400' : 'bg-emerald-500/20 text-emerald-500') : 'bg-purple-500/20 text-purple-400')}>
                    {p.esCliente ? 'Cliente' : 'Prospecto'}
                  </span>
                </div>
                <div className={cn('text-xs', isHey ? 'text-gray-500' : 'text-gray-400')}>{p.rfc}</div>
              </button>
            ))}
            {lista.length === 0 && <div className={cn('p-4 text-sm', isHey ? 'text-gray-500' : 'text-gray-400')}>Sin resultados.</div>}
          </div>
        </aside>

        {/* Detalle 360° */}
        <div className="flex-1 overflow-y-auto p-6">
          {rfcSel ? <Ciclo360View rfc={rfcSel} /> : <div className={cn('text-sm', isHey ? 'text-gray-400' : 'text-gray-500')}>Selecciona un cliente o prospecto.</div>}
        </div>
      </div>
    </div>
  )
}
