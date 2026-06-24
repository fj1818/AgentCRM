/**
 * Sección de Tareas dentro del detalle de la oferta (alcance Hey Tech).
 * Lista las tareas vinculadas a la oferta, permite alta, detalle/edición y
 * cierre con comentario (que se replica como nota en la oferta).
 */

import { useMemo, useState } from 'react'
import { cn } from '@/utils'
import {
  useTareasOfertaStore, TIPOS_TAREA, PRIORIDADES, ESTATUS_TAREA, ESTATUS_CERRADOS,
  type Tarea, type TareaEstatus, type TareaPrioridad,
} from '@/stores/tareasOferta.store'
import { dmyToYmd, ymdToDmy } from './ofertasFormat'

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

export function TareasOfertaPanel({ idOferta, rfc, responsableDefault, isHey }: {
  idOferta: string; rfc: string; responsableDefault: string; isHey: boolean
}) {
  const { tareas, addTarea, updateTarea } = useTareasOfertaStore()
  const lista = useMemo(() => tareas.filter((t) => t.idOferta === idOferta), [tareas, idOferta])

  const [nuevaOpen, setNuevaOpen] = useState(false)
  const [detalle, setDetalle] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const labelCls = cn('text-[11px] uppercase tracking-wide mb-1', isHey ? 'text-gray-400' : 'text-gray-500')
  const valueBox = cn('px-3 py-2 text-sm rounded-lg border min-h-[38px]', isHey ? 'bg-white/5 border-white/10 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700')
  const btnPrimary = cn('px-4 py-2 text-sm rounded-lg font-medium', isHey ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'bg-orange-500 text-white hover:bg-orange-600')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className={cn('text-sm', isHey ? 'text-gray-400' : 'text-gray-600')}>
          Mostrando <b>{lista.length}</b> tarea(s) de esta oferta
        </div>
        {!nuevaOpen && (
          <button onClick={() => { setNuevaOpen(true); setMsg(null) }} className={btnPrimary}>+ Nueva tarea</button>
        )}
      </div>

      {msg && <div className={cn('text-sm', msg.ok ? 'text-emerald-500' : 'text-red-500')}>{msg.text}</div>}

      {nuevaOpen && (
        <NuevaTareaForm
          isHey={isHey} responsableDefault={responsableDefault}
          onCancel={() => setNuevaOpen(false)}
          onSave={(p) => {
            const res = addTarea({ idOferta, rfc, ...p })
            if (res.ok) { setNuevaOpen(false); setMsg({ text: '✓ Tarea creada.', ok: true }) }
            else setMsg({ text: res.error || 'Error.', ok: false })
          }}
        />
      )}

      {lista.length === 0 ? (
        <div className={cn('text-sm', isHey ? 'text-gray-400' : 'text-gray-500')}>Sin tareas para esta oferta.</div>
      ) : (
        <div className="space-y-2">
          {lista.map((t) => {
            const cerrada = ESTATUS_CERRADOS.includes(t.estatus)
            const abierto = detalle === t.id
            return (
              <div key={t.id} className={cn('rounded-xl border', isHey ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white')}>
                <button
                  onClick={() => setDetalle(abierto ? null : t.id)}
                  className={cn('w-full flex items-center gap-3 px-4 py-3 text-left', isHey ? 'hover:bg-white/5' : 'hover:bg-orange-50')}
                >
                  <div className="flex-1 min-w-0">
                    <div className={cn('text-sm font-medium truncate', isHey ? 'text-white' : 'text-gray-800')}>{t.titulo}</div>
                    <div className={cn('text-xs', isHey ? 'text-gray-400' : 'text-gray-500')}>{t.tipo} · Vence {t.fechaVencimiento} · {t.responsable}</div>
                  </div>
                  {t.prioridad && <span className={cn('px-2 py-0.5 text-xs rounded-full', PRIORIDAD_CLS[t.prioridad])}>{t.prioridad}</span>}
                  <span className={cn('px-2 py-0.5 text-xs rounded-full', ESTATUS_CLS[t.estatus])}>{t.estatus}</span>
                </button>

                {abierto && (
                  <div className={cn('border-t px-4 py-3 space-y-3', isHey ? 'border-white/10' : 'border-orange-100')}>
                    {t.descripcion && (
                      <div><div className={labelCls}>Descripción</div><div className={valueBox}>{t.descripcion}</div></div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div><div className={labelCls}>Fecha de creación</div><div className={valueBox}>{t.fechaCreacion || '—'}</div></div>
                      <div><div className={labelCls}>Fecha de cierre</div><div className={valueBox}>{t.fechaCierre || '—'}</div></div>
                    </div>

                    {cerrada ? (
                      <div>
                        <div className={labelCls}>Comentario de cierre</div>
                        <div className={valueBox}>{t.comentarioCierre || '—'}</div>
                        <div className={cn('mt-2 text-xs italic', isHey ? 'text-gray-500' : 'text-gray-400')}>Tarea cerrada — no editable.</div>
                      </div>
                    ) : (
                      <EditarTareaForm
                        tarea={t} isHey={isHey}
                        onSave={(changes) => {
                          const res = updateTarea(t.id, changes)
                          if (res.ok) setMsg({ text: '✓ Tarea actualizada.', ok: true })
                          else setMsg({ text: res.error || 'Error.', ok: false })
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function NuevaTareaForm({ isHey, responsableDefault, onCancel, onSave }: {
  isHey: boolean; responsableDefault: string; onCancel: () => void
  onSave: (p: { titulo: string; tipo: string; responsable: string; fechaVencimiento: string; descripcion: string; prioridad: TareaPrioridad }) => void
}) {
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState('')
  const [responsable, setResponsable] = useState(responsableDefault)
  const [fecha, setFecha] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [prioridad, setPrioridad] = useState<TareaPrioridad>('')

  const labelCls = cn('text-[11px] uppercase tracking-wide mb-1', isHey ? 'text-gray-400' : 'text-gray-500')
  const inputCls = cn('w-full px-3 py-2 text-sm rounded-lg border [&>option]:text-gray-900', isHey ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-orange-200 text-gray-800')

  return (
    <div className={cn('rounded-xl border p-4 space-y-3', isHey ? 'border-cyan-500/30 bg-white/5' : 'border-orange-300 bg-orange-50/50')}>
      <div className={cn('text-sm font-semibold', isHey ? 'text-white' : 'text-gray-800')}>Nueva tarea</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><div className={labelCls}>Título *</div><input className={inputCls} value={titulo} onChange={(e) => setTitulo(e.target.value)} /></div>
        <div>
          <div className={labelCls}>Tipo de tarea *</div>
          <select className={inputCls} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">— selecciona —</option>
            {TIPOS_TAREA.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div><div className={labelCls}>Fecha de vencimiento *</div><input type="date" className={inputCls} value={dmyToYmd(fecha)} onChange={(e) => setFecha(ymdToDmy(e.target.value))} /></div>
        <div><div className={labelCls}>Responsable *</div><input className={inputCls} value={responsable} onChange={(e) => setResponsable(e.target.value)} /></div>
        <div>
          <div className={labelCls}>Prioridad</div>
          <select className={inputCls} value={prioridad} onChange={(e) => setPrioridad(e.target.value as TareaPrioridad)}>
            <option value="">— sin asignar —</option>
            {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="col-span-2"><div className={labelCls}>Descripción</div><textarea rows={2} className={inputCls} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className={cn('px-3 py-1.5 text-sm rounded-lg', isHey ? 'text-gray-400' : 'text-gray-500')}>Cancelar</button>
        <button
          onClick={() => onSave({ titulo, tipo, responsable, fechaVencimiento: fecha, descripcion, prioridad })}
          className={cn('px-3 py-1.5 text-sm rounded-lg font-medium', isHey ? 'bg-cyan-500 text-white' : 'bg-orange-500 text-white')}
        >Crear tarea</button>
      </div>
    </div>
  )
}

function EditarTareaForm({ tarea, isHey, onSave }: {
  tarea: Tarea; isHey: boolean; onSave: (changes: Partial<Tarea>) => void
}) {
  const [estatus, setEstatus] = useState<TareaEstatus>(tarea.estatus)
  const [comentario, setComentario] = useState('')
  const cierra = ESTATUS_CERRADOS.includes(estatus)

  const labelCls = cn('text-[11px] uppercase tracking-wide mb-1', isHey ? 'text-gray-400' : 'text-gray-500')
  const inputCls = cn('w-full px-3 py-2 text-sm rounded-lg border [&>option]:text-gray-900', isHey ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-orange-200 text-gray-800')

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className={labelCls}>Estatus</div>
          <select className={inputCls} value={estatus} onChange={(e) => setEstatus(e.target.value as TareaEstatus)}>
            {ESTATUS_TAREA.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {cierra && (
        <div>
          <div className={labelCls}>Comentario de cierre *</div>
          <textarea rows={2} className={inputCls} placeholder="Obligatorio al completar o cancelar…" value={comentario} onChange={(e) => setComentario(e.target.value)} />
        </div>
      )}
      <div className="flex justify-end">
        <button
          onClick={() => onSave(cierra ? { estatus, comentarioCierre: comentario } : { estatus })}
          className={cn('px-3 py-1.5 text-sm rounded-lg font-medium', isHey ? 'bg-cyan-500 text-white' : 'bg-orange-500 text-white')}
        >{cierra ? 'Cerrar tarea' : 'Guardar'}</button>
      </div>
    </div>
  )
}
