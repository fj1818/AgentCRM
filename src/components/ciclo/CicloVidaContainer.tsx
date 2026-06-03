/**
 * Módulo "Ciclo de vida" (barra lateral).
 * Vista 1: TABLA de clientes/prospectos carterizados (como Ofertas), sin finanzas.
 * Vista 2 (al "Ver detalle"): pantalla con DOS secciones separadas —
 *   "Info del cliente" (identidad) y "Ciclo de vida" (finanzas/actividad).
 * Nunca se muestran identidad y finanzas en la misma sección.
 */

import { useMemo, useState } from 'react'
import { RefreshCw, Eye, ChevronLeft, ChevronRight, Search, User } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import { listPersonas, type Persona } from '@/data/ciclo-seed'
import { Ciclo360View } from './Ciclo360View'
import { InfoClienteView } from './InfoClienteView'

type Filtro = 'todos' | 'clientes' | 'prospectos'
const PAGE_SIZE = 12

export function CicloVidaContainer() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const personas = useMemo(() => listPersonas(), [])

  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [pagina, setPagina] = useState(1)
  const [detalle, setDetalle] = useState<Persona | null>(null)

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
  const totalPaginas = Math.max(1, Math.ceil(lista.length / PAGE_SIZE))
  const rows = lista.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

  const thCls = cn('px-3 py-3 text-left text-xs font-medium uppercase tracking-wider', isHey ? 'text-gray-400' : 'text-gray-500')
  const tdCls = cn('px-3 py-2 text-sm', isHey ? 'text-gray-300' : 'text-gray-700')

  // ── Pantalla de detalle (2 secciones) ──────────────────────────────────────
  if (detalle) return <DetalleCliente persona={detalle} onBack={() => setDetalle(null)} />

  // ── Tabla ───────────────────────────────────────────────────────────────────
  return (
    <div className={cn('flex flex-col h-full overflow-hidden', isHey ? 'bg-[#0f1219]' : 'bg-gray-50')}>
      <div className={cn('px-6 py-4 border-b shrink-0 flex items-center gap-3', isHey ? 'border-white/10 bg-[#1a1f2e]' : 'border-orange-100 bg-white')}>
        <div className={cn('p-2 rounded-lg', isHey ? 'bg-cyan-500/10 text-cyan-400' : 'bg-orange-100 text-orange-600')}><RefreshCw className="w-6 h-6" /></div>
        <div>
          <h1 className={cn('text-2xl font-bold', isHey ? 'text-white' : 'text-gray-900')}>Ciclo de vida</h1>
          <p className={cn('text-sm', isHey ? 'text-gray-400' : 'text-gray-500')}>{totalClientes} clientes carterizados · {totalProspectos} prospectos</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Buscador + filtro */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4', isHey ? 'text-gray-500' : 'text-gray-400')} />
            <input value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1) }} placeholder="Buscar por nombre o RFC…"
              className={cn('w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm', isHey ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white border-orange-200 text-gray-900 placeholder-gray-400')} />
          </div>
          <div className="flex gap-1">
            {(['todos', 'clientes', 'prospectos'] as Filtro[]).map((f) => (
              <button key={f} onClick={() => { setFiltro(f); setPagina(1) }}
                className={cn('px-3 py-2 text-xs rounded-lg capitalize',
                  filtro === f ? (isHey ? 'bg-cyan-500 text-white' : 'bg-orange-500 text-white') : (isHey ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-orange-50 text-gray-600 hover:bg-orange-100'))}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla (identidad básica, SIN finanzas) */}
        <div className={cn('rounded-xl border overflow-hidden', isHey ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white')}>
          <div className={cn('px-4 py-2 text-sm', isHey ? 'bg-white/5 border-b border-white/10 text-gray-400' : 'bg-orange-50 border-b border-orange-100 text-gray-600')}>
            Mostrando <b>{lista.length}</b> de <b>{personas.length}</b>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isHey ? 'bg-white/5' : 'bg-orange-50'}>
                <tr>
                  {['Nombre', 'RFC', 'Tipo', 'Estatus', 'Segmento'].map((h) => <th key={h} className={thCls}>{h}</th>)}
                  <th className={cn(thCls, 'text-center')}>Detalle</th>
                </tr>
              </thead>
              <tbody className={cn('divide-y', isHey ? 'divide-white/5' : 'divide-orange-100')}>
                {rows.length === 0 && <tr><td colSpan={6} className={cn('px-3 py-6 text-center text-sm', isHey ? 'text-gray-500' : 'text-gray-400')}>Sin resultados.</td></tr>}
                {rows.map((p) => (
                  <tr key={p.rfc} className={isHey ? 'hover:bg-white/5' : 'hover:bg-orange-50/50'}>
                    <td className={cn(tdCls, 'font-medium')}>{p.nombre}</td>
                    <td className={cn(tdCls, 'font-mono text-xs')}>{p.rfc}</td>
                    <td className="px-3 py-2">
                      <span className={cn('inline-flex px-2 py-0.5 text-xs font-medium rounded-full', p.esCliente ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400')}>{p.esCliente ? 'Cliente' : 'Prospecto'}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn('inline-flex px-2 py-0.5 text-xs font-medium rounded-full', !p.esCliente ? 'bg-purple-500/20 text-purple-400' : p.estatus === 'Inactivo' ? 'bg-gray-500/20 text-gray-400' : 'bg-emerald-500/20 text-emerald-500')}>{p.esCliente ? p.estatus : 'Prospecto'}</span>
                    </td>
                    <td className={tdCls}>{p.segmento}</td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => setDetalle(p)} className={cn('p-1.5 rounded-lg', isHey ? 'hover:bg-white/10 text-cyan-400' : 'hover:bg-orange-100 text-orange-500')} title="Ver detalle"><Eye className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    </div>
  )
}

// ── Detalle del cliente: 2 secciones separadas ────────────────────────────────
function DetalleCliente({ persona, onBack }: { persona: Persona; onBack: () => void }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [sec, setSec] = useState<'cliente' | 'ciclo'>('cliente')

  const nav: { key: 'cliente' | 'ciclo'; icon: typeof User; label: string }[] = [
    { key: 'cliente', icon: User, label: 'Info del cliente' },
    { key: 'ciclo', icon: RefreshCw, label: 'Ciclo de vida' },
  ]

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', isHey ? 'bg-[#0f1219]' : 'bg-gray-50')}>
      <div className={cn('px-6 py-4 border-b shrink-0 flex items-center gap-3', isHey ? 'border-white/10 bg-[#1a1f2e]' : 'border-orange-100 bg-white')}>
        <button onClick={onBack} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm', isHey ? 'text-cyan-400 hover:bg-white/10' : 'text-orange-500 hover:bg-orange-100')}>
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>
        <h1 className={cn('text-xl font-bold', isHey ? 'text-white' : 'text-gray-900')}>
          {sec === 'cliente' ? 'Información del cliente' : 'Ciclo de vida'}
        </h1>
      </div>

      <div className="flex flex-1 min-h-0">
        <nav className={cn('w-52 shrink-0 border-r p-3 space-y-1', isHey ? 'border-white/10 bg-[#1a1f2e]' : 'border-orange-100 bg-white')}>
          {nav.map((it) => (
            <button key={it.key} onClick={() => setSec(it.key)}
              className={cn('flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm',
                sec === it.key ? (isHey ? 'bg-cyan-500/20 text-cyan-300' : 'bg-orange-100 text-orange-600') : (isHey ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-orange-50'))}>
              <it.icon className="w-4 h-4" />{it.label}
            </button>
          ))}
        </nav>
        <div className="flex-1 overflow-y-auto p-6">
          {sec === 'cliente' ? <InfoClienteView rfc={persona.rfc} /> : <Ciclo360View rfc={persona.rfc} />}
        </div>
      </div>
    </div>
  )
}
