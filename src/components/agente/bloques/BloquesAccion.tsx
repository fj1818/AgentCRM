/**
 * Bloques que ejecutan algo: formularios, confirmaciones, listas de tareas,
 * atajos, resultados y tarjetas de estudio.
 *
 * Todos comparten una regla: una vez usados quedan bloqueados y muestran lo que
 * se decidió, para que el historial de la conversación siga siendo un registro
 * fiel de lo ocurrido.
 */

import { useState } from 'react'
import { CheckCircle2, Info, XCircle, ArrowLeftRight } from 'lucide-react'
import { cn } from '@/utils'
import type { AgentAction, Block, CampoFormulario } from '@/agentic/types'
import { formatoMoneda } from '@/agentic/data'
import { Badge, BotonAccion, Icono, Panel, botonClases, clasesTono, useTema } from '../ui'

type Extraer<K extends Block['kind']> = Extract<Block, { kind: K }>

interface PropsAccion {
  onAccion: (a: AgentAction) => void
}

/** Estado compartido para bloques de un solo uso. */
interface PropsConsumible extends PropsAccion {
  clave: string
  consumido?: string
  onConsumir: (clave: string, resultado: string) => void
}

// ── Formulario dinámico ──────────────────────────────────────────────────────

function valorInicial(campos: CampoFormulario[]): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  for (const c of campos) out[c.name] = c.value ?? (c.type === 'toggle' ? false : c.type === 'number' || c.type === 'money' || c.type === 'slider' ? 0 : '')
  return out
}

export function BloqueFormulario({
  bloque,
  onEnviar,
  clave,
  consumido,
  onConsumir,
}: {
  bloque: Extraer<'form'>
  onEnviar: (tool: string, args: Record<string, unknown>, etiqueta: string) => void
} & Omit<PropsConsumible, 'onAccion'>) {
  const t = useTema()
  const form = bloque.form
  const [valores, setValores] = useState(() => valorInicial(form.campos))
  const [errores, setErrores] = useState<Record<string, boolean>>({})

  const set = (name: string, v: string | number | boolean) => {
    setValores((s) => ({ ...s, [name]: v }))
    setErrores((e) => ({ ...e, [name]: false }))
  }

  const enviar = () => {
    const faltantes: Record<string, boolean> = {}
    for (const c of form.campos) {
      if (c.required && (valores[c.name] === '' || valores[c.name] === undefined)) faltantes[c.name] = true
    }
    if (Object.keys(faltantes).length) {
      setErrores(faltantes)
      return
    }
    onConsumir(clave, form.submitLabel)
    onEnviar(form.tool, { ...form.args, ...valores }, form.submitLabel)
  }

  if (consumido) {
    return (
      <Panel titulo={form.titulo} icono={form.icono}>
        <div className={cn('flex items-center gap-2 text-sm', t.textoSuave)}>
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          Formulario enviado — {consumido}
        </div>
      </Panel>
    )
  }

  const claseInput = cn(
    'w-full rounded-xl border px-3 py-2 text-sm transition-shadow focus:outline-none focus:ring-2',
    t.input,
    t.anillo
  )

  return (
    <Panel titulo={form.titulo} subtitulo={form.subtitulo} icono={form.icono ?? 'edit'}>
      <div className="grid sm:grid-cols-2 gap-3">
        {form.campos.map((c) => {
          const err = errores[c.name]
          return (
            <div key={c.name} className={c.width === 'full' ? 'sm:col-span-2' : undefined}>
              <label className={cn('block text-[11px] font-medium uppercase tracking-wide mb-1.5', t.textoSuave)}>
                {c.label}
                {c.required && <span className="text-rose-500 ml-0.5">*</span>}
              </label>

              {c.type === 'segmented' ? (
                <div className={cn('inline-flex flex-wrap gap-1 p-1 rounded-xl border w-full', t.borde, t.sunken)}>
                  {c.options?.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => set(c.name, o.value)}
                      className={cn(
                        'flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                        valores[c.name] === o.value
                          ? cn(t.acentoBg, t.hey ? 'text-slate-900' : 'text-white', 'shadow-sm')
                          : cn(t.textoSuave, t.hey ? 'hover:bg-white/10' : 'hover:bg-white')
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              ) : c.type === 'select' ? (
                <select value={String(valores[c.name] ?? '')} onChange={(e) => set(c.name, e.target.value)} className={claseInput}>
                  {c.options?.map((o) => (
                    <option key={o.value} value={o.value} className={t.hey ? 'bg-slate-800' : undefined}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : c.type === 'textarea' ? (
                <textarea
                  rows={2}
                  value={String(valores[c.name] ?? '')}
                  placeholder={c.placeholder}
                  onChange={(e) => set(c.name, e.target.value)}
                  className={cn(claseInput, 'resize-none')}
                />
              ) : c.type === 'slider' ? (
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min={c.min ?? 0}
                    max={c.max ?? 100}
                    step={c.step ?? 1}
                    value={Number(valores[c.name] ?? 0)}
                    onChange={(e) => set(c.name, Number(e.target.value))}
                    className={cn('flex-1 accent-current', t.acento)}
                  />
                  <span className={cn('text-sm font-bold tabular-nums w-12 text-right', t.texto)}>
                    {Number(valores[c.name] ?? 0)}%
                  </span>
                </div>
              ) : c.type === 'toggle' ? (
                <button
                  type="button"
                  onClick={() => set(c.name, !valores[c.name])}
                  className={cn(
                    'w-11 h-6 rounded-full p-0.5 transition-colors',
                    valores[c.name] ? t.acentoBg : t.hey ? 'bg-white/15' : 'bg-slate-300'
                  )}
                >
                  <span className={cn('block w-5 h-5 rounded-full bg-white transition-transform', valores[c.name] && 'translate-x-5')} />
                </button>
              ) : (
                <div className="relative">
                  {c.type === 'money' && (
                    <span className={cn('absolute left-3 top-1/2 -translate-y-1/2 text-sm', t.textoSuave)}>$</span>
                  )}
                  <input
                    type={c.type === 'money' || c.type === 'number' ? 'number' : c.type === 'date' ? 'date' : 'text'}
                    value={String(valores[c.name] ?? '')}
                    placeholder={c.placeholder}
                    onChange={(e) => set(c.name, c.type === 'money' || c.type === 'number' ? Number(e.target.value) : e.target.value)}
                    className={cn(claseInput, c.type === 'money' && 'pl-7 tabular-nums', err && 'border-rose-400 ring-2 ring-rose-400/30')}
                  />
                </div>
              )}

              {c.type === 'money' && Number(valores[c.name]) > 0 && (
                <p className={cn('text-[11px] mt-1', t.textoSuave)}>{formatoMoneda(Number(valores[c.name]))}</p>
              )}
              {c.hint && !err && <p className={cn('text-[11px] mt-1', t.textoSuave)}>{c.hint}</p>}
              {err && <p className="text-[11px] mt-1 text-rose-500">Este campo es obligatorio</p>}
            </div>
          )
        })}
      </div>

      <div className={cn('flex items-center justify-between gap-3 mt-4 pt-3.5 border-t', t.borde)}>
        <p className={cn('text-[11px]', t.textoSuave)}>Nada se guarda hasta que pulses el botón.</p>
        <button type="button" onClick={enviar} className={botonClases('primary', t.hey)}>
          <Icono nombre="check" className="w-4 h-4" />
          {form.submitLabel}
        </button>
      </div>
    </Panel>
  )
}

// ── Confirmación ─────────────────────────────────────────────────────────────

export function BloqueConfirmar({
  bloque,
  onEnviar,
  clave,
  consumido,
  onConsumir,
}: {
  bloque: Extraer<'confirm'>
  onEnviar: (tool: string, args: Record<string, unknown>, etiqueta: string) => void
} & Omit<PropsConsumible, 'onAccion'>) {
  const t = useTema()
  const c = bloque.confirm

  if (consumido) {
    const cancelado = consumido === 'cancelado'
    return (
      <div className={cn('rounded-2xl border p-4 animate-fade-in', clasesTono(cancelado ? 'neutro' : 'positivo', t.hey))}>
        <div className="flex items-center gap-2 text-sm font-medium">
          {cancelado ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {cancelado ? `Cancelaste: ${c.titulo}` : `Confirmado: ${c.titulo}`}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-2xl border-2 overflow-hidden animate-fade-in', t.hey ? 'border-amber-500/40 bg-amber-500/[0.04]' : 'border-amber-300 bg-amber-50/40')}>
      <header className="px-4 py-3 flex items-start gap-2.5">
        <Icono nombre="alert" className={cn('w-4 h-4 mt-0.5 flex-shrink-0', t.hey ? 'text-amber-300' : 'text-amber-600')} />
        <div className="min-w-0">
          <h3 className={cn('text-sm font-semibold', t.texto)}>{c.titulo}</h3>
          <p className={cn('text-xs mt-0.5', t.textoSuave)}>{c.resumen}</p>
        </div>
      </header>

      <div className="px-4 pb-3">
        <p className={cn('text-[10px] uppercase tracking-wide font-semibold mb-2', t.textoSuave)}>Esto va a cambiar</p>
        <ul className="space-y-1.5">
          {c.cambios.map((ch, i) => (
            <li key={i} className={cn('flex items-center gap-2 text-[13px] rounded-lg px-2.5 py-1.5', t.hey ? 'bg-white/[0.04]' : 'bg-white')}>
              <span className={cn('flex-1 min-w-0 truncate', t.textoSuave)}>{ch.label}</span>
              {ch.antes && (
                <>
                  <span className={cn('line-through opacity-60 truncate', t.textoSuave)}>{ch.antes}</span>
                  <ArrowLeftRight className={cn('w-3 h-3 flex-shrink-0', t.textoSuave)} />
                </>
              )}
              <span className={cn('font-semibold truncate', t.texto)}>{ch.despues}</span>
            </li>
          ))}
        </ul>
        {c.advertencia && (
          <p className={cn('text-[12px] mt-2.5 leading-snug', t.hey ? 'text-amber-300' : 'text-amber-700')}>
            ⚠ {c.advertencia}
          </p>
        )}
      </div>

      <footer className={cn('flex gap-2 px-4 py-3 border-t', t.hey ? 'border-white/10' : 'border-amber-200')}>
        <button
          type="button"
          onClick={() => {
            onConsumir(clave, c.confirmLabel)
            onEnviar(c.tool, c.args ?? {}, c.confirmLabel)
          }}
          className={botonClases('primary', t.hey)}
        >
          <Icono nombre="check" className="w-4 h-4" />
          {c.confirmLabel}
        </button>
        <button type="button" onClick={() => onConsumir(clave, 'cancelado')} className={botonClases('ghost', t.hey)}>
          Cancelar
        </button>
      </footer>
    </div>
  )
}

// ── Atajos ───────────────────────────────────────────────────────────────────

export function BloqueOpciones({ bloque, onAccion }: { bloque: Extraer<'choices'> } & PropsAccion) {
  const t = useTema()
  return (
    <div className="animate-fade-in">
      {bloque.titulo && (
        <p className={cn('text-[11px] uppercase tracking-wide font-semibold mb-2', t.textoSuave)}>{bloque.titulo}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {bloque.opciones.map((o, i) => (
          <BotonAccion key={i} accion={o} onAccion={onAccion} />
        ))}
      </div>
    </div>
  )
}

// ── Checklist ────────────────────────────────────────────────────────────────

export function BloqueChecklist({ bloque, onAccion }: { bloque: Extraer<'checklist'> } & PropsAccion) {
  const t = useTema()
  const [hechos, setHechos] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(bloque.items.map((i) => [i.id, i.hecho]))
  )
  const completados = Object.values(hechos).filter(Boolean).length

  return (
    <Panel
      titulo={bloque.titulo}
      subtitulo={bloque.subtitulo}
      icono="check"
      acciones={
        <span className={cn('text-xs font-semibold tabular-nums', completados === bloque.items.length ? 'text-emerald-500' : t.textoSuave)}>
          {completados}/{bloque.items.length}
        </span>
      }
    >
      <ul className="space-y-1.5">
        {bloque.items.map((it) => {
          const hecho = hechos[it.id]
          return (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => setHechos((h) => ({ ...h, [it.id]: !h[it.id] }))}
                className={cn(
                  'w-full flex items-start gap-3 text-left rounded-xl border p-2.5 transition-all duration-150',
                  t.card,
                  t.cardHover,
                  hecho && 'opacity-55'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 w-[18px] h-[18px] flex-shrink-0 rounded-md border flex items-center justify-center transition-colors',
                    hecho ? 'bg-emerald-500 border-emerald-500' : t.hey ? 'border-white/25' : 'border-slate-300'
                  )}
                >
                  {hecho && <Icono nombre="check" className="w-3 h-3 text-white" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block text-[13px] font-medium leading-snug', t.texto, hecho && 'line-through')}>
                    {it.texto}
                  </span>
                  {it.detalle && <span className={cn('block text-[11px] mt-0.5 leading-snug', t.textoSuave)}>{it.detalle}</span>}
                </span>
                {it.meta && <Badge tono={it.tono}>{it.meta}</Badge>}
              </button>
            </li>
          )
        })}
      </ul>
      {bloque.acciones && (
        <div className="flex flex-wrap gap-2 mt-3">
          {bloque.acciones.map((a, i) => (
            <BotonAccion key={i} accion={a} onAccion={onAccion} />
          ))}
        </div>
      )}
    </Panel>
  )
}

// ── Resultado de una acción ──────────────────────────────────────────────────

export function BloqueResultado({ bloque, onAccion }: { bloque: Extraer<'result'> } & PropsAccion) {
  const t = useTema()
  const Ico = bloque.tono === 'success' ? CheckCircle2 : bloque.tono === 'error' ? XCircle : Info
  const color =
    bloque.tono === 'success'
      ? t.hey ? 'border-emerald-500/30 bg-emerald-500/[0.07]' : 'border-emerald-200 bg-emerald-50/60'
      : bloque.tono === 'error'
        ? t.hey ? 'border-rose-500/30 bg-rose-500/[0.07]' : 'border-rose-200 bg-rose-50/60'
        : t.hey ? 'border-cyan-500/30 bg-cyan-500/[0.07]' : 'border-blue-200 bg-blue-50/60'

  return (
    <div className={cn('rounded-2xl border overflow-hidden animate-slide-up', color)}>
      <div className="p-4 flex gap-3">
        <Ico className={cn('w-5 h-5 mt-0.5 flex-shrink-0', bloque.tono === 'success' ? 'text-emerald-500' : bloque.tono === 'error' ? 'text-rose-500' : t.acento)} />
        <div className="min-w-0 flex-1">
          <h3 className={cn('text-sm font-semibold leading-snug', t.texto)}>{bloque.titulo}</h3>
          {bloque.detalle && <p className={cn('text-[13px] mt-1 leading-relaxed', t.textoMedio)}>{bloque.detalle}</p>}
          {bloque.campos && bloque.campos.length > 0 && (
            <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
              {bloque.campos.map((c, i) => (
                <div key={i} className="flex items-baseline gap-2 min-w-0">
                  <dt className={cn('text-[11px] uppercase tracking-wide flex-shrink-0', t.textoSuave)}>{c.label}</dt>
                  <dd className={cn('text-[13px] font-medium truncate', t.texto)}>{c.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
      {bloque.acciones && (
        <div className={cn('flex flex-wrap gap-2 px-4 py-3 border-t', t.hey ? 'border-white/10' : 'border-black/5')}>
          {bloque.acciones.map((a, i) => (
            <BotonAccion key={i} accion={a} onAccion={onAccion} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Flash cards ──────────────────────────────────────────────────────────────

export function BloqueFlashcards({ bloque }: { bloque: Extraer<'flashcards'> }) {
  const t = useTema()
  const [abierta, setAbierta] = useState<string | null>(null)

  return (
    <div className="animate-fade-in">
      {bloque.titulo && (
        <h3 className={cn('text-sm font-semibold mb-2.5 flex items-center gap-2', t.texto)}>
          <Icono nombre="book" className={cn('w-4 h-4', t.acento)} />
          {bloque.titulo}
        </h3>
      )}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {bloque.cards.map((c) => {
          const abiertaEsta = abierta === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setAbierta(abiertaEsta ? null : c.id)}
              className={cn(
                'text-left rounded-2xl border p-4 transition-all duration-200 min-h-[120px] flex flex-col',
                t.card,
                t.cardHover,
                abiertaEsta && (t.hey ? 'border-cyan-500/40 bg-cyan-500/[0.05]' : 'border-orange-300 bg-orange-50/50')
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge tono={c.categoria === 'Objeción' ? 'alerta' : c.categoria === 'Cierre' ? 'positivo' : 'neutro'}>
                  {c.categoria}
                </Badge>
                <span className={cn('text-[10px] uppercase tracking-wide font-medium', t.textoSuave)}>
                  {abiertaEsta ? 'Respuesta' : 'Toca para ver'}
                </span>
              </div>

              {abiertaEsta ? (
                <div className="flex-1 space-y-2 animate-fade-in">
                  <p className={cn('text-[13px] leading-relaxed', t.textoMedio)}>{c.reverso}</p>
                  {c.tip && (
                    <p className={cn('text-[12px] leading-relaxed rounded-lg px-2.5 py-2 border', clasesTono('positivo', t.hey))}>
                      <strong>Tip de campo:</strong> {c.tip}
                    </p>
                  )}
                </div>
              ) : (
                <p className={cn('text-[14px] font-medium leading-snug flex-1 flex items-center', t.texto)}>{c.frente}</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
