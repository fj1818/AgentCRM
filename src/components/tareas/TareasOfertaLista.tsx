/**
 * Listado de Tareas vinculadas a ofertas (alcance Hey Tech).
 * Dos vistas: "Mis tareas" (soy responsable) y "Tareas que asigné".
 * Filtros por estatus y tipo. Permite saltar a la oferta vinculada.
 */

import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { useUIStore } from '@/stores'
import { useNavStore } from '@/stores/nav.store'
import {
  useTareasOfertaStore, TIPOS_TAREA, ESTATUS_TAREA, type Tarea, type TareaEstatus,
} from '@/stores/tareasOferta.store'
import { cn } from '@/utils'

const ESTATUS_CLS: Record<TareaEstatus, string> = {
  'Pendiente': 'bg-amber-500/20 text-amber-500',
  'En Progreso': 'bg-blue-500/20 text-blue-500',
  'Completada': 'bg-emerald-500/20 text-emerald-500',
  'Cancelada': 'bg-gray-500/20 text-gray-400',
}
const PRIORIDAD_CLS: Record<string, string> = {
  'Alta': 'bg-red-500/20 text-red-500',
  'Media': 'bg-amber-500/20 text-amber-500',
  'Baja': 'bg-emerald-500/20 text-emerald-500',
}

export function TareasOfertaLista({ modo }: { modo: 'mias' | 'asignadas' }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const abrirOferta = useNavStore((s) => s.abrirOferta)
  const { tareas, misTareas, tareasAsignadas } = useTareasOfertaStore()

  const [fEstatus, setFEstatus] = useState('')
  const [fTipo, setFTipo] = useState('')

  // `tareas` en deps para refrescar al cambiar el store.
  const base = useMemo(() => (modo === 'mias' ? misTareas() : tareasAsignadas()), [modo, misTareas, tareasAsignadas, tareas])
  const lista = useMemo(
    () => base.filter((t) => (!fEstatus || t.estatus === fEstatus) && (!fTipo || t.tipo === fTipo)),
    [base, fEstatus, fTipo],
  )

  const selectCls = cn('px-3 py-1.5 text-sm rounded-lg border [&>option]:text-gray-900', isHey ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-orange-200 text-gray-800')
  const thCls = cn('px-3 py-2 text-left text-xs font-medium uppercase tracking-wider', isHey ? 'text-gray-400' : 'text-gray-500')
  const tdCls = cn('px-3 py-2 text-sm', isHey ? 'text-gray-300' : 'text-gray-700')

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('text-sm', isHey ? 'text-gray-400' : 'text-gray-600')}>Mostrando <b>{lista.length}</b> tarea(s)</span>
        <div className="flex-1" />
        <select className={selectCls} value={fEstatus} onChange={(e) => setFEstatus(e.target.value)}>
          <option value="">Estatus: todos</option>
          {ESTATUS_TAREA.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={selectCls} value={fTipo} onChange={(e) => setFTipo(e.target.value)}>
          <option value="">Tipo: todos</option>
          {TIPOS_TAREA.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className={cn('rounded-xl border overflow-hidden', isHey ? 'border-white/10' : 'border-orange-200')}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isHey ? 'bg-white/5' : 'bg-orange-50'}>
              <tr>
                <th className={thCls}>Título</th>
                <th className={thCls}>Tipo</th>
                <th className={thCls}>{modo === 'mias' ? 'Asignó' : 'Responsable'}</th>
                <th className={thCls}>Vencimiento</th>
                <th className={thCls}>Prioridad</th>
                <th className={thCls}>Estatus</th>
                <th className={cn(thCls, 'text-center')}>Oferta</th>
              </tr>
            </thead>
            <tbody className={cn('divide-y', isHey ? 'divide-white/5' : 'divide-orange-100')}>
              {lista.length === 0 && (
                <tr><td colSpan={7} className={cn('px-3 py-6 text-center text-sm', isHey ? 'text-gray-500' : 'text-gray-400')}>Sin tareas.</td></tr>
              )}
              {lista.map((t: Tarea) => (
                <tr key={t.id} className={isHey ? 'hover:bg-white/5' : 'hover:bg-orange-50/50'}>
                  <td className={tdCls}>{t.titulo}</td>
                  <td className={tdCls}>{t.tipo}</td>
                  <td className={tdCls}>{modo === 'mias' ? t.asignadoPor : t.responsable}</td>
                  <td className={cn(tdCls, 'whitespace-nowrap')}>{t.fechaVencimiento}</td>
                  <td className="px-3 py-2">{t.prioridad && <span className={cn('px-2 py-0.5 text-xs rounded-full', PRIORIDAD_CLS[t.prioridad])}>{t.prioridad}</span>}</td>
                  <td className="px-3 py-2"><span className={cn('px-2 py-0.5 text-xs rounded-full', ESTATUS_CLS[t.estatus])}>{t.estatus}</span></td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => abrirOferta(t.idOferta)} title="Ver oferta vinculada"
                      className={cn('p-1.5 rounded-lg', isHey ? 'hover:bg-white/10 text-cyan-400' : 'hover:bg-orange-100 text-orange-500')}>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
