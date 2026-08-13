/**
 * Bloques analíticos: KPIs, tablas, gráficas, embudo y comparativos.
 */

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'
import { cn } from '@/utils'
import type { AgentAction, Block, Columna, Fila } from '@/agentic/types'
import { formatoMoneda, formatoFechaCorta } from '@/agentic/data'
import { Badge, BotonAccion, Icono, Panel, clasesTono, barraTono, tonoDeValor, useTema } from '../ui'

type Extraer<K extends Block['kind']> = Extract<Block, { kind: K }>
interface ConAccion {
  onAccion: (a: AgentAction) => void
}

// ── KPIs / flash cards ───────────────────────────────────────────────────────

export function BloqueKpis({ bloque }: { bloque: Extraer<'kpis'> }) {
  const t = useTema()
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 animate-fade-in">
      {bloque.items.map((k, i) => (
        <div
          key={i}
          className={cn('rounded-2xl border p-3.5 transition-all duration-200', t.card, t.cardHover)}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('p-1.5 rounded-lg border', clasesTono(k.tono, t.hey))}>
              <Icono nombre={k.icono} className="w-3.5 h-3.5" />
            </span>
            <span className={cn('text-[11px] font-medium uppercase tracking-wide truncate', t.textoSuave)}>
              {k.etiqueta}
            </span>
          </div>
          <div className={cn('text-xl font-bold leading-tight tabular-nums', t.texto)}>{k.valor}</div>
          {(k.detalle || k.delta) && (
            <p className={cn('text-[11px] mt-1 leading-snug', t.textoSuave)}>
              {k.delta && <span className={cn('font-semibold mr-1', t.acento)}>{k.delta}</span>}
              {k.detalle}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Tabla ────────────────────────────────────────────────────────────────────

function formatearCelda(valor: unknown, col: Columna) {
  if (valor === null || valor === undefined || valor === '') return '—'
  switch (col.format) {
    case 'money':
      return formatoMoneda(Number(valor))
    case 'date':
      return formatoFechaCorta(String(valor))
    case 'percent':
      return `${Number(valor)}%`
    case 'dias':
      return `${Number(valor)} d`
    default:
      return String(valor)
  }
}

export function BloqueTabla({ bloque, onAccion }: { bloque: Extraer<'table'> } & ConAccion) {
  const t = useTema()
  const [pagina, setPagina] = useState(0)
  const [orden, setOrden] = useState<{ key: string; dir: 1 | -1 } | null>(null)
  const tam = bloque.pageSize ?? 10

  const filas = useMemo(() => {
    if (!orden) return bloque.filas
    return [...bloque.filas].sort((a, b) => {
      const va = a[orden.key]
      const vb = b[orden.key]
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * orden.dir
      return String(va ?? '').localeCompare(String(vb ?? ''), 'es') * orden.dir
    })
  }, [bloque.filas, orden])

  const paginas = Math.ceil(filas.length / tam)
  const visibles = filas.slice(pagina * tam, pagina * tam + tam)

  const alternar = (key: string) =>
    setOrden((o) => (o?.key === key ? { key, dir: o.dir === 1 ? -1 : 1 } : { key, dir: -1 }))

  /** Sustituye {campo} en la acción con los valores de la fila. */
  const accionDeFila = (fila: Fila): AgentAction | null => {
    if (!bloque.accionFila) return null
    const rellenar = (s?: string) =>
      s?.replace(/\{(\w+)\}/g, (_, k: string) => String(fila[k] ?? ''))
    return {
      ...bloque.accionFila,
      send: rellenar(bloque.accionFila.send),
      run: bloque.accionFila.run
        ? { tool: bloque.accionFila.run.tool, args: { ...bloque.accionFila.run.args, id: fila.id } }
        : undefined,
    }
  }

  return (
    <Panel
      titulo={bloque.titulo}
      icono="chart"
      padding={false}
      acciones={
        paginas > 1 ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagina((p) => Math.max(0, p - 1))}
              disabled={pagina === 0}
              className={cn('p-1 rounded-lg disabled:opacity-30', t.textoSuave, t.hey ? 'hover:bg-white/10' : 'hover:bg-slate-200')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className={cn('text-[11px] tabular-nums px-1', t.textoSuave)}>
              {pagina + 1}/{paginas}
            </span>
            <button
              onClick={() => setPagina((p) => Math.min(paginas - 1, p + 1))}
              disabled={pagina >= paginas - 1}
              className={cn('p-1 rounded-lg disabled:opacity-30', t.textoSuave, t.hey ? 'hover:bg-white/10' : 'hover:bg-slate-200')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : undefined
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={cn('border-b', t.borde)}>
              {bloque.columnas.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  onClick={() => alternar(c.key)}
                  className={cn(
                    'px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide cursor-pointer select-none whitespace-nowrap group',
                    t.textoSuave,
                    c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    <ArrowUpDown
                      className={cn(
                        'w-3 h-3 transition-opacity',
                        orden?.key === c.key ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                      )}
                    />
                  </span>
                </th>
              ))}
              {bloque.accionFila && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {visibles.map((fila, i) => {
              const accion = accionDeFila(fila)
              return (
                <tr
                  key={String(fila.id ?? i)}
                  className={cn('border-b last:border-0 transition-colors', t.borde, t.hey ? 'hover:bg-white/[0.04]' : 'hover:bg-orange-50/60')}
                >
                  {bloque.columnas.map((c) => {
                    const valor = fila[c.key]
                    return (
                      <td
                        key={c.key}
                        className={cn(
                          'px-4 py-2.5 whitespace-nowrap',
                          t.textoMedio,
                          c.format === 'money' || c.format === 'percent' || c.format === 'dias' ? 'tabular-nums' : '',
                          c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                        )}
                      >
                        {c.format === 'badge' ? (
                          <Badge tono={tonoDeValor(String(valor))}>{String(valor)}</Badge>
                        ) : (
                          <span className={c.key === 'cliente' || c.key === 'nombre' ? cn('font-medium', t.texto) : undefined}>
                            {formatearCelda(valor, c)}
                          </span>
                        )}
                      </td>
                    )
                  })}
                  {accion && (
                    <td className="px-2 py-1.5">
                      <BotonAccion accion={{ ...accion, label: '', variant: 'ghost' }} onAccion={onAccion} className="px-2" />
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {(bloque.pie || bloque.acciones) && (
        <div className={cn('flex items-center justify-between gap-3 px-4 py-2.5 border-t', t.borde, t.sunken)}>
          <p className={cn('text-[11px]', t.textoSuave)}>{bloque.pie}</p>
          <div className="flex gap-1.5">
            {bloque.acciones?.map((a, i) => <BotonAccion key={i} accion={a} onAccion={onAccion} />)}
          </div>
        </div>
      )}
    </Panel>
  )
}

// ── Gráficas ─────────────────────────────────────────────────────────────────

const PALETA_HEY = ['#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#60a5fa']
const PALETA_BAN = ['#FF8800', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#0ea5e9']

export function BloqueGrafica({ bloque }: { bloque: Extraer<'chart'> }) {
  const t = useTema()
  const paleta = t.hey ? PALETA_HEY : PALETA_BAN
  const total = bloque.series.reduce((a, s) => a + s.value, 0)
  const max = Math.max(...bloque.series.map((s) => s.value), 1)
  const fmt = (v: number) => (bloque.unidad === 'money' ? formatoMoneda(v) : String(v))

  return (
    <Panel titulo={bloque.titulo} icono="chart" subtitulo={bloque.pie}>
      {bloque.variante === 'bar' || bloque.variante === 'line' ? (
        <div className="space-y-2.5">
          {bloque.series.map((s, i) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className={cn('text-xs w-28 truncate flex-shrink-0', t.textoMedio)}>{s.label}</span>
              <div className={cn('flex-1 h-7 rounded-lg overflow-hidden', t.sunken)}>
                <div
                  className="h-full rounded-lg transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(2, (s.value / max) * 100)}%`, backgroundColor: paleta[i % paleta.length] }}
                />
              </div>
              <span className={cn('text-xs font-semibold w-32 text-right tabular-nums flex-shrink-0', t.texto)}>
                {fmt(s.value)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-6 flex-wrap">
          <Dona series={bloque.series} paleta={paleta} hueco={bloque.variante === 'donut'} />
          <ul className="flex-1 min-w-[180px] space-y-1.5">
            {bloque.series.map((s, i) => (
              <li key={s.label} className="flex items-center gap-2.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: paleta[i % paleta.length] }} />
                <span className={cn('flex-1 truncate', t.textoMedio)}>{s.label}</span>
                <span className={cn('font-semibold tabular-nums', t.texto)}>{fmt(s.value)}</span>
                <span className={cn('w-10 text-right tabular-nums', t.textoSuave)}>
                  {total ? Math.round((s.value / total) * 100) : 0}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  )
}

function Dona({ series, paleta, hueco }: { series: { label: string; value: number }[]; paleta: string[]; hueco: boolean }) {
  const total = series.reduce((a, s) => a + s.value, 0) || 1
  const R = 60
  const C = 2 * Math.PI * R
  let acumulado = 0

  return (
    <svg viewBox="0 0 160 160" className="w-36 h-36 flex-shrink-0 -rotate-90">
      {series.map((s, i) => {
        const largo = (s.value / total) * C
        const el = (
          <circle
            key={s.label}
            cx="80"
            cy="80"
            r={R}
            fill="none"
            stroke={paleta[i % paleta.length]}
            strokeWidth={hueco ? 22 : 60}
            strokeDasharray={`${largo} ${C - largo}`}
            strokeDashoffset={-acumulado}
          />
        )
        acumulado += largo
        return el
      })}
    </svg>
  )
}

// ── Embudo ───────────────────────────────────────────────────────────────────

export function BloqueEmbudo({ bloque, onAccion }: { bloque: Extraer<'pipeline'> } & ConAccion) {
  const t = useTema()
  const max = Math.max(...bloque.etapas.map((e) => e.monto), 1)

  return (
    <Panel titulo={bloque.titulo ?? 'Embudo'} subtitulo={bloque.total ? `Total abierto: ${bloque.total}` : undefined} icono="briefcase">
      <div className="space-y-2">
        {bloque.etapas.map((e, i) => (
          <button
            key={e.etapa}
            onClick={() => e.send && onAccion({ label: e.etapa, send: e.send })}
            disabled={!e.send}
            className={cn(
              'w-full group text-left rounded-xl border p-3 transition-all duration-200 disabled:pointer-events-none',
              t.card,
              e.send && t.cardHover
            )}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className={cn('text-sm font-medium', t.texto)}>{e.etapa}</span>
              <span className={cn('text-xs tabular-nums', t.textoSuave)}>
                {e.cantidad} {e.cantidad === 1 ? 'oferta' : 'ofertas'} · <span className={cn('font-semibold', t.texto)}>{formatoMoneda(e.monto)}</span>
              </span>
            </div>
            <div className={cn('h-2 rounded-full overflow-hidden', t.sunken)}>
              <div
                className={cn('h-full rounded-full transition-all duration-700', barraTono(i >= 3 ? 'positivo' : 'neutro', t.hey))}
                style={{ width: `${Math.max(3, (e.monto / max) * 100)}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </Panel>
  )
}

// ── Comparativo ──────────────────────────────────────────────────────────────

export function BloqueComparativo({ bloque, onAccion }: { bloque: Extraer<'compare'> } & ConAccion) {
  const t = useTema()
  return (
    <Panel titulo={bloque.titulo ?? 'Comparativo'} icono="package" padding={false}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={cn('border-b', t.borde)}>
              {bloque.encabezados.map((h, i) => (
                <th
                  key={i}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold align-bottom',
                    i === 1 ? t.acento : t.textoSuave,
                    i === 0 && 'w-36'
                  )}
                >
                  {i === 1 && <span className="block text-[10px] uppercase tracking-wide mb-0.5">Recomendado</span>}
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bloque.filas.map((f) => (
              <tr key={f.label} className={cn('border-b last:border-0', t.borde)}>
                <td className={cn('px-4 py-2.5 text-xs font-medium align-top', t.textoSuave)}>{f.label}</td>
                {f.valores.map((v, j) => (
                  <td
                    key={j}
                    className={cn(
                      'px-4 py-2.5 align-top text-[13px] leading-snug',
                      j === f.destacar ? cn('font-semibold', t.texto) : t.textoMedio,
                      j === 0 && (t.hey ? 'bg-cyan-500/[0.06]' : 'bg-orange-50/50')
                    )}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {bloque.acciones && (
        <div className={cn('flex flex-wrap gap-2 px-4 py-3 border-t', t.borde, t.sunken)}>
          {bloque.acciones.map((a, i) => <BotonAccion key={i} accion={a} onAccion={onAccion} />)}
        </div>
      )}
    </Panel>
  )
}
