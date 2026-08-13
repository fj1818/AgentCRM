/**
 * Bloques de entidad: fichas, listados de tarjetas, línea de tiempo y notas.
 */

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils'
import type { AgentAction, Block, RecordCard } from '@/agentic/types'
import { Avatar, Badge, BotonAccion, Icono, Panel, barraTono, clasesTono, useTema } from '../ui'

type Extraer<K extends Block['kind']> = Extract<Block, { kind: K }>
interface ConAccion {
  onAccion: (a: AgentAction) => void
}

// ── Ficha completa ───────────────────────────────────────────────────────────

export function TarjetaEntidad({
  item,
  onAccion,
  compacta,
}: { item: RecordCard; compacta?: boolean } & ConAccion) {
  const t = useTema()
  const [expandida, setExpandida] = useState(!compacta)
  const camposVisibles = expandida ? item.campos : item.campos.slice(0, 3)

  return (
    <article className={cn('rounded-2xl border overflow-hidden animate-fade-in', t.card)}>
      <header className={cn('flex items-start gap-3 px-4 py-3.5 border-b', t.borde, t.sunken)}>
        {item.avatar && <Avatar nombre={item.avatar} size={compacta ? 'sm' : 'md'} />}
        <div className="min-w-0 flex-1">
          <h3 className={cn('font-semibold leading-snug truncate', compacta ? 'text-sm' : 'text-[15px]', t.texto)}>
            {item.titulo}
          </h3>
          {item.subtitulo && <p className={cn('text-xs mt-0.5 truncate', t.textoSuave)}>{item.subtitulo}</p>}
        </div>
        {item.badge && <Badge tono={item.badge.tono}>{item.badge.texto}</Badge>}
      </header>

      <div className="p-4 space-y-3">
        {item.medidor && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className={cn('text-[11px] font-medium uppercase tracking-wide', t.textoSuave)}>
                {item.medidor.label}
              </span>
              <span className={cn('text-xs font-bold tabular-nums', t.texto)}>{item.medidor.valor}%</span>
            </div>
            <div className={cn('h-2 rounded-full overflow-hidden', t.sunken)}>
              <div
                className={cn('h-full rounded-full transition-all duration-700', barraTono(item.medidor.tono, t.hey))}
                style={{ width: `${item.medidor.valor}%` }}
              />
            </div>
          </div>
        )}

        <dl className={cn('grid gap-x-4 gap-y-2.5', compacta ? 'grid-cols-1' : 'sm:grid-cols-2')}>
          {camposVisibles.map((c) => (
            <div key={c.label} className="flex items-start gap-2 min-w-0">
              <span className={cn('mt-0.5 flex-shrink-0', t.textoSuave)}>
                <Icono nombre={c.icono} className="w-3.5 h-3.5" />
              </span>
              <div className="min-w-0">
                <dt className={cn('text-[10px] uppercase tracking-wide font-medium', t.textoSuave)}>{c.label}</dt>
                <dd className={cn('text-[13px] leading-snug break-words', t.textoMedio)}>{c.value}</dd>
              </div>
            </div>
          ))}
        </dl>

        {item.campos.length > 3 && compacta && (
          <button
            onClick={() => setExpandida((v) => !v)}
            className={cn('flex items-center gap-1 text-xs font-medium', t.acento)}
          >
            {expandida ? 'Ver menos' : `Ver ${item.campos.length - 3} campos más`}
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', expandida && 'rotate-180')} />
          </button>
        )}

        {item.nota && (
          <p className={cn('text-[13px] italic leading-snug rounded-xl px-3 py-2 border', clasesTono('neutro', t.hey))}>
            “{item.nota}”
          </p>
        )}
      </div>

      {item.acciones && item.acciones.length > 0 && (
        <footer className={cn('flex flex-wrap gap-2 px-4 py-3 border-t', t.borde, t.sunken)}>
          {item.acciones.map((a, i) => (
            <BotonAccion key={i} accion={a} onAccion={onAccion} />
          ))}
        </footer>
      )}
    </article>
  )
}

export function BloqueFicha({ bloque, onAccion }: { bloque: Extraer<'record'> } & ConAccion) {
  return <TarjetaEntidad item={bloque.item} onAccion={onAccion} />
}

export function BloqueFichas({ bloque, onAccion }: { bloque: Extraer<'records'> } & ConAccion) {
  const t = useTema()
  const carrusel = bloque.layout === 'carrusel'

  return (
    <div className="animate-fade-in">
      {bloque.titulo && (
        <h3 className={cn('text-sm font-semibold mb-2.5 flex items-center gap-2', t.texto)}>
          <Icono nombre="briefcase" className={cn('w-4 h-4', t.acento)} />
          {bloque.titulo}
        </h3>
      )}
      <div
        className={cn(
          carrusel
            ? 'flex gap-3 overflow-x-auto pb-2 snap-x [&>*]:snap-start [&>*]:min-w-[300px] [&>*]:max-w-[340px]'
            : 'grid gap-3 sm:grid-cols-2'
        )}
      >
        {bloque.items.map((item) => (
          <TarjetaEntidad key={item.id} item={item} onAccion={onAccion} compacta />
        ))}
      </div>
    </div>
  )
}

// ── Línea de tiempo ──────────────────────────────────────────────────────────

const ICONO_ACTIVIDAD: Record<string, string> = {
  llamada: 'phone',
  correo: 'mail',
  reunion: 'user',
  nota: 'edit',
  sistema: 'info',
  contrato: 'file',
}

export function BloqueLinea({ bloque }: { bloque: Extraer<'timeline'> }) {
  const t = useTema()
  const [todos, setTodos] = useState(false)
  const visibles = todos ? bloque.items : bloque.items.slice(0, 5)

  return (
    <Panel titulo={bloque.titulo ?? 'Actividad'} icono="history">
      <ol className="relative space-y-4">
        <span className={cn('absolute left-[15px] top-2 bottom-2 w-px', t.hey ? 'bg-white/10' : 'bg-slate-200')} />
        {visibles.map((it) => (
          <li key={it.id} className="relative flex gap-3">
            <span
              className={cn(
                'relative z-10 w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0',
                clasesTono('neutro', t.hey),
                t.hey ? 'bg-[#1b2130]' : 'bg-white'
              )}
            >
              <Icono nombre={ICONO_ACTIVIDAD[it.tipo] ?? 'info'} className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <h4 className={cn('text-[13px] font-medium leading-snug', t.texto)}>{it.titulo}</h4>
                <span className={cn('text-[11px] whitespace-nowrap flex-shrink-0', t.textoSuave)}>{it.fecha}</span>
              </div>
              {it.detalle && <p className={cn('text-xs mt-0.5 leading-relaxed', t.textoSuave)}>{it.detalle}</p>}
              {it.autor && <p className={cn('text-[11px] mt-1', t.textoSuave)}>— {it.autor}</p>}
            </div>
          </li>
        ))}
      </ol>
      {bloque.items.length > 5 && (
        <button onClick={() => setTodos((v) => !v)} className={cn('mt-3 text-xs font-medium', t.acento)}>
          {todos ? 'Ver menos' : `Ver las ${bloque.items.length} interacciones`}
        </button>
      )}
    </Panel>
  )
}

// ── Nota / insight ───────────────────────────────────────────────────────────

export function BloqueNota({ bloque }: { bloque: Extraer<'note'> }) {
  const t = useTema()
  const icono = bloque.tono === 'alerta' ? 'alert' : bloque.tono === 'positivo' ? 'sparkles' : 'info'

  return (
    <div className={cn('rounded-2xl border p-4 animate-fade-in', clasesTono(bloque.tono, t.hey))}>
      <div className="flex gap-3">
        <Icono nombre={icono} className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          {bloque.titulo && <h4 className="text-sm font-semibold mb-1">{bloque.titulo}</h4>}
          <div className="text-[13px] leading-relaxed [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:space-y-0.5 [&_li]:ml-4 [&_li]:list-disc">
            <ReactMarkdown>{bloque.texto}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
