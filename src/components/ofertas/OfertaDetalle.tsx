/**
 * Detalle de oferta (overlay) — replica AppClient.html.
 * Secciones: Info del cliente · Ciclo de vida (placeholder) · Info de la oferta
 * (5 subsecciones editables) · Notas.
 */

import { useMemo, useState, type ReactNode } from 'react'
import { X, User, RefreshCw, Package, StickyNote } from 'lucide-react'
import { useUIStore } from '@/stores'
import { useOfertasStore } from '@/stores/ofertas.store'
import { cn } from '@/utils'
import type { Offer } from '@/data/ofertas-seed'
import { money, dmyToYmd, ymdToDmy } from './ofertasFormat'
import { OfertaAgentePanel } from './OfertaAgentePanel'
import { Ciclo360View } from '@/components/ciclo/Ciclo360View'

type Src = 'campaigns' | 'families' | 'products' | 'promoters' | 'origins' | 'stages' | 'substages'
interface FieldSpec {
  label: string; tipo: string; col?: string; editable?: boolean
  edit?: 'date' | 'num' | 'money' | 'text' | 'textarea' | 'html' | 'select'; src?: Src; hide?: boolean
}
interface SectionSpec { title: string; hidden?: boolean; fields: FieldSpec[] }

const OFFER_ALIAS: Record<string, string> = { 'Tipo de Oferta': 'Tipo de oferta' }

const OFFER_SECTIONS: SectionSpec[] = [
  { title: 'Información administrativa', fields: [
    { label: 'Fecha de creación', tipo: 'FECHA' },
    { label: 'Fecha de ganado', tipo: 'FECHA' },
    { label: 'Fecha de descarte', tipo: 'FECHA' },
    { label: 'Fecha de vencimiento', tipo: 'FECHA', editable: true, edit: 'date', col: 'Fecha de vencimiento' },
    { label: 'Campaña', tipo: 'PICKLIST', editable: true, edit: 'select', src: 'campaigns', col: 'ID de la campaña' },
    { label: 'Familia de producto', tipo: 'PICKLIST', editable: true, edit: 'select', src: 'families', col: 'ID de la familia de producto' },
    { label: 'Producto', tipo: 'PICKLIST', editable: true, edit: 'select', src: 'products', col: 'Id del producto' },
    { label: 'Folio', tipo: 'TEXTO_255', editable: true, edit: 'text', col: 'Folio' },
    { label: 'Número de línea', tipo: 'TEXTO_255', editable: true, edit: 'text', col: 'Número de línea' },
  ]},
  { title: 'Gestión', fields: [
    { label: 'Etapa', tipo: 'PICKLIST', editable: true, edit: 'select', src: 'stages', col: 'Etapa' },
    { label: 'SubEtapa', tipo: 'PICKLIST', editable: true, edit: 'select', src: 'substages', col: 'SubEtapa' },
    { label: 'Tipo de Oferta', tipo: 'PICKLIST' },
    { label: 'Origen de la oferta', tipo: 'PICKLIST', editable: true, edit: 'select', src: 'origins', col: 'Origen de la oferta' },
    { label: 'Promotor o ejecutivo', tipo: 'TEXTO_255', editable: true, edit: 'select', src: 'promoters', col: 'ID del promotor' },
    { label: 'Promotores de apoyo', tipo: 'TEXTO_255', hide: true },
    { label: 'Motivo de descarte', tipo: 'TEXTO_255', editable: true, edit: 'textarea', col: 'Motivo de descarte' },
  ]},
  { title: 'Condiciones de la oferta', fields: [
    { label: 'Monto de la oferta', tipo: 'MONEDA', editable: true, edit: 'money', col: 'Monto de la oferta' },
    { label: 'Monto fijo de la oferta', tipo: 'MONEDA', editable: true, edit: 'money', col: 'Monto fijo de la oferta' },
    { label: 'Monto revolvente de la oferta', tipo: 'MONEDA', editable: true, edit: 'money', col: 'Monto revolvente de la oferta' },
    { label: 'Tasa inicial de la oferta', tipo: 'NUMERICO', editable: true, edit: 'num', col: 'Tasa inicial de la oferta' },
    { label: 'CAT inicial de la oferta', tipo: 'NUMERICO', editable: true, edit: 'num', col: 'CAT inicial de la oferta' },
    { label: 'Plazo de la oferta', tipo: 'NUMERICO', editable: true, edit: 'num', col: 'Plazo de la oferta' },
    { label: 'Periodo', tipo: 'NUMERICO', editable: true, edit: 'num', col: 'Periodo' },
  ]},
  { title: 'Condiciones de contratación', hidden: true, fields: [] },
  { title: 'Descripción de la oferta', fields: [
    { label: 'Descripción de la oferta', tipo: 'TEXTO_HTML', col: 'Descripción de la oferta' },
  ]},
]

type DetKey = 'cliente' | 'ciclo' | 'oferta' | 'notas'
const DET_TITLES: Record<DetKey, string> = {
  cliente: 'Información del cliente', ciclo: 'Ciclo de vida', oferta: 'Información de la oferta', notas: 'Notas',
}

export function OfertaDetalle({ offer: offerProp, onClose }: { offer: Offer; onClose: () => void }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const { offers, catalogs, clientsByRfc, comments, users, promoterNames, updateOffer, addComment } = useOfertasStore()

  // Oferta VIVA del store: refleja cambios del agente/edición al instante.
  const idActual = offerProp.raw['ID de la oferta'] || ''
  const offer = offers.find((o) => (o.raw['ID de la oferta'] || '') === idActual) || offerProp

  const [sec, setSec] = useState<DetKey>('cliente')
  const [form, setForm] = useState<Record<string, string>>({})
  const [saveMsg, setSaveMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [noteText, setNoteText] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)

  const raw = offer.raw
  const val = (col: string) => (form[col] !== undefined ? form[col] : (raw[col] ?? ''))
  const ruta = catalogs.familyRoute[val('ID de la familia de producto')] || ''

  function srcList(src: Src): { value: string; label: string }[] {
    if (src === 'campaigns') return Object.keys(catalogs.campaigns).map((id) => ({ value: id, label: catalogs.campaigns[id]! }))
    if (src === 'families') return Object.keys(catalogs.families).map((id) => ({ value: id, label: catalogs.families[id]! }))
    if (src === 'products') return (catalogs.productsByFamily[val('ID de la familia de producto')] || []).map((p) => ({ value: p.id, label: p.nombre }))
    if (src === 'promoters') return users.map((u) => ({ value: u.idPromotor, label: `${u.nombre} (#${u.numero})` }))
    if (src === 'origins') return catalogs.origins.map((o) => ({ value: o, label: o }))
    if (src === 'stages') {
      let st = catalogs.stagesByRoute[ruta]
      if (!st || !st.length) { const seen: Record<string, boolean> = {}; st = []; Object.values(catalogs.stagesByRoute).forEach((arr) => arr.forEach((s) => { if (!seen[s.nombre]) { seen[s.nombre] = true; st!.push(s) } })) }
      return st.map((s) => ({ value: s.nombre, label: s.nombre }))
    }
    if (src === 'substages') {
      let list = (catalogs.subStagesByRoute[ruta] || {})[val('Etapa')]
      if (!list) { for (const rt of Object.keys(catalogs.subStagesByRoute)) { const l = catalogs.subStagesByRoute[rt]![val('Etapa')]; if (l) { list = l; break } } }
      return (list || []).map((s) => ({ value: s, label: s }))
    }
    return []
  }

  function setVal(col: string, v: string) {
    setForm((p) => {
      const next = { ...p, [col]: v }
      if (col === 'ID de la familia de producto') next['Id del producto'] = '' // reset producto al cambiar familia
      if (col === 'Etapa') next['SubEtapa'] = ''
      return next
    })
  }

  function guardar() {
    const changes: Record<string, string> = {}
    Object.keys(form).forEach((col) => { changes[col] = form[col]! })
    if (changes['Fecha de vencimiento'] !== undefined) changes['Fecha de vencimiento'] = ymdToDmy(changes['Fecha de vencimiento']) || changes['Fecha de vencimiento']
    const motivo = changes['Motivo de descarte']
    if (motivo !== undefined && motivo.trim() && motivo.trim().length < 20) {
      setSaveMsg({ text: 'El motivo de descarte debe tener al menos 20 caracteres.', ok: false }); return
    }
    const res = updateOffer(raw['ID de la oferta'] || '', changes)
    if (res.ok) { setSaveMsg({ text: '✓ Cambios guardados.', ok: true }); setForm({}) }
    else setSaveMsg({ text: res.error || 'Error al guardar.', ok: false })
  }

  const cliente = clientsByRfc[raw['RFC'] || ''] || { nombre: '', telefonos: '', correo: '', direccion: '', numero: '', rfc: raw['RFC'] || '' }
  const notas = useMemo(() => {
    const oid = raw['ID de la oferta'] || ''
    const parse = (s: string) => { const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s || ''); return m ? new Date(+m[3]!, +m[2]! - 1, +m[1]!).getTime() : 0 }
    return comments.filter((c) => c.idOferta === oid).sort((a, b) => parse(a.fecha) - parse(b.fecha))
  }, [comments, raw])

  const navItems: { key: DetKey; icon: typeof User; label: string }[] = [
    { key: 'cliente', icon: User, label: 'Info del cliente' },
    { key: 'ciclo', icon: RefreshCw, label: 'Ciclo de vida' },
    { key: 'oferta', icon: Package, label: 'Info de la oferta' },
    { key: 'notas', icon: StickyNote, label: 'Notas' },
  ]

  const labelCls = cn('text-[11px] uppercase tracking-wide mb-1', isHey ? 'text-gray-400' : 'text-gray-500')
  const valueBox = cn('px-3 py-2 text-sm rounded-lg border min-h-[38px]', isHey ? 'bg-white/5 border-white/10 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700')
  const inputCls = cn('w-full px-3 py-2 text-sm rounded-lg border', isHey ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-orange-200 text-gray-800')

  function fieldCell(f: FieldSpec) {
    const col = f.col || OFFER_ALIAS[f.label] || f.label
    const cur = val(col)
    const wide = f.edit === 'html' || f.edit === 'textarea' || f.tipo === 'TEXTO_HTML'
    let inner: ReactNode
    if (!f.editable) {
      if (!cur) inner = <div className={valueBox}>—</div>
      else if (f.tipo === 'MONEDA') inner = <div className={valueBox}>{money(cur)}</div>
      else if (f.tipo === 'TEXTO_HTML') inner = <div className={valueBox} dangerouslySetInnerHTML={{ __html: cur }} />
      else inner = <div className={valueBox}>{cur}</div>
    } else if (f.edit === 'date') {
      inner = <input type="date" className={inputCls} value={dmyToYmd(cur)} onChange={(e) => setVal(col, e.target.value)} />
    } else if (f.edit === 'num' || f.edit === 'money') {
      inner = <input type="number" step="any" className={inputCls} value={cur} onChange={(e) => setVal(col, e.target.value)} />
    } else if (f.edit === 'text') {
      inner = <input type="text" className={inputCls} value={cur} onChange={(e) => setVal(col, e.target.value)} />
    } else if (f.edit === 'textarea') {
      inner = <textarea rows={3} className={inputCls} placeholder="Mínimo 20 caracteres al descartar…" value={cur} onChange={(e) => setVal(col, e.target.value)} />
    } else if (f.edit === 'select' && f.src) {
      inner = (
        <select className={inputCls} value={cur} onChange={(e) => setVal(col, e.target.value)}>
          <option value="">— sin asignar —</option>
          {srcList(f.src).slice().sort((a, b) => a.label.localeCompare(b.label)).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )
    }
    return (
      <div key={f.label} className={wide ? 'col-span-2' : ''}>
        <div className={labelCls}>{f.label}</div>
        {inner}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-black/40">
      <div className={cn('m-auto w-full max-w-7xl h-[92vh] rounded-2xl border overflow-hidden flex flex-col', isHey ? 'bg-[#0f1219] border-white/10' : 'bg-gray-50 border-orange-200')}>
        {/* Header */}
        <div className={cn('flex items-center justify-between px-5 py-3 border-b', isHey ? 'border-white/10 bg-[#1a1f2e]' : 'border-orange-100 bg-white')}>
          <div>
            <h2 className={cn('text-lg font-bold', isHey ? 'text-white' : 'text-gray-900')}>{DET_TITLES[sec]}</h2>
            <p className={cn('text-xs', isHey ? 'text-gray-400' : 'text-gray-500')}>{offer.producto} · {offer.ejecutivo} · {offer.tipoOferta}</p>
          </div>
          <button onClick={onClose} className={cn('p-2 rounded-lg', isHey ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-orange-50 text-gray-500')}><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Nav */}
          <nav className={cn('w-52 shrink-0 border-r p-3 space-y-1', isHey ? 'border-white/10 bg-[#1a1f2e]' : 'border-orange-100 bg-white')}>
            {navItems.map((it) => (
              <button
                key={it.key}
                onClick={() => setSec(it.key)}
                className={cn('flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm',
                  sec === it.key
                    ? isHey ? 'bg-cyan-500/20 text-cyan-300' : 'bg-orange-100 text-orange-600'
                    : isHey ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-orange-50')}
              >
                <it.icon className="w-4 h-4" />{it.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {sec === 'cliente' && (
              <div className="grid grid-cols-2 gap-4">
                {([['Nombre', cliente.nombre], ['Teléfonos', cliente.telefonos], ['Correo', cliente.correo], ['Dirección', cliente.direccion], ['Número de cliente', cliente.numero], ['RFC', cliente.rfc]] as [string, string][]).map(([l, v]) => (
                  <div key={l}><div className={labelCls}>{l}</div><div className={valueBox}>{v || '—'}</div></div>
                ))}
              </div>
            )}

            {sec === 'ciclo' && <Ciclo360View rfc={raw['RFC'] || ''} />}

            {sec === 'oferta' && (
              <div className="space-y-6">
                {OFFER_SECTIONS.filter((s) => !s.hidden).map((s) => {
                  const fs = s.fields.filter((f) => !f.hide)
                  if (!fs.length) return null
                  return (
                    <div key={s.title}>
                      <h3 className={cn('text-xs font-semibold uppercase tracking-wider mb-3', isHey ? 'text-cyan-400' : 'text-orange-500')}>{s.title}</h3>
                      <div className="grid grid-cols-2 gap-4">{fs.map(fieldCell)}</div>
                    </div>
                  )
                })}
                <div className="flex items-center justify-end gap-3 pt-2">
                  {saveMsg && <span className={cn('text-sm', saveMsg.ok ? 'text-emerald-500' : 'text-red-500')}>{saveMsg.text}</span>}
                  <button onClick={guardar} disabled={Object.keys(form).length === 0}
                    className={cn('px-4 py-2 text-sm rounded-lg font-medium',
                      Object.keys(form).length === 0
                        ? isHey ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-400'
                        : isHey ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'bg-orange-500 text-white hover:bg-orange-600')}>
                    Guardar cambios
                  </button>
                </div>
              </div>
            )}

            {sec === 'notas' && (
              <div className="space-y-3">
                {!noteOpen && (
                  <button onClick={() => setNoteOpen(true)} className={cn('px-4 py-2 text-sm rounded-lg font-medium', isHey ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'bg-orange-500 text-white hover:bg-orange-600')}>+ Agregar comentario</button>
                )}
                {noteOpen && (
                  <div className="space-y-2">
                    <textarea rows={3} className={inputCls} placeholder="Escribe tu comentario…" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setNoteOpen(false); setNoteText('') }} className={cn('px-3 py-1.5 text-sm rounded-lg', isHey ? 'text-gray-400' : 'text-gray-500')}>Cancelar</button>
                      <button
                        onClick={() => {
                          if (!noteText.trim()) return
                          addComment({ idOferta: raw['ID de la oferta'] || '', rfc: raw['RFC'] || '', comentario: noteText.trim() })
                          setNoteText(''); setNoteOpen(false)
                        }}
                        className={cn('px-3 py-1.5 text-sm rounded-lg font-medium', isHey ? 'bg-cyan-500 text-white' : 'bg-orange-500 text-white')}
                      >Guardar comentario</button>
                    </div>
                  </div>
                )}
                {notas.length === 0 ? (
                  <div className={cn('text-sm', isHey ? 'text-gray-400' : 'text-gray-500')}>Sin notas para esta oferta.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead><tr className={isHey ? 'text-gray-400' : 'text-gray-500'}>
                      <th className="text-left px-2 py-1">Comentario</th><th className="text-left px-2 py-1">Autor</th><th className="text-left px-2 py-1">Fecha</th>
                    </tr></thead>
                    <tbody>
                      {notas.map((c) => (
                        <tr key={c.id} className={cn('border-t', isHey ? 'border-white/5 text-gray-300' : 'border-orange-100 text-gray-700')}>
                          <td className="px-2 py-1.5">{c.comentario}</td>
                          <td className="px-2 py-1.5">{promoterNames[c.idUsuario] || c.idUsuario || '—'}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{c.fecha}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* Agente de chat de la oferta */}
          <OfertaAgentePanel offer={offer} />
        </div>
      </div>
    </div>
  )
}
