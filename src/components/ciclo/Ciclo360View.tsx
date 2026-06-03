/**
 * Ciclo360View — vista 360° por PESTAÑAS del ciclo de vida de una persona (RFC).
 * Sin identidad (nombre/RFC) para no mezclar identidad con finanzas.
 * Pestañas: Resumen · Productos · Saldos y mora · Líneas por vencer ·
 * Movimientos · Ingresos NF · Ofertas · Comunicaciones · Aclaraciones · Denuncias.
 * Las ofertas enlazan al módulo Ofertas (mismo detalle).
 */

import { useMemo, useState, type ReactNode } from 'react'
import {
  Sparkles, CreditCard, Activity, BadgeCheck, Wallet, Megaphone,
  MessageSquareWarning, Gavel, Store, Star, RefreshCw, CalendarClock,
  LayoutGrid, ChevronRight, ChevronDown, ExternalLink,
} from 'lucide-react'
import { useUIStore } from '@/stores'
import { useNavStore } from '@/stores/nav.store'
import { cn } from '@/utils'
import { getCiclo360 } from '@/data/ciclo-seed'
import { money } from '@/components/ofertas/ofertasFormat'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899']

function npsColor(cat: string, isHey: boolean) {
  if (cat === 'Promotor') return 'bg-emerald-500/20 text-emerald-500'
  if (cat === 'Detractor') return 'bg-red-500/20 text-red-500'
  return isHey ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-600'
}
function mask4(s: string) { const v = String(s || ''); return v.length > 4 ? `•••• ${v.slice(-4)}` : v }
function dmyToKey(f: string) { const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(f || ''); return m ? `${m[3]}-${m[2]}` : '' }
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function Ciclo360View({ rfc }: { rfc: string }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const abrirOferta = useNavStore((s) => s.abrirOferta)
  const data = getCiclo360(rfc)

  const [tab, setTab] = useState('resumen')
  const [filtroCanal, setFiltroCanal] = useState('')
  const [filtroAclTipo, setFiltroAclTipo] = useState('')
  const [filtroAclEstatus, setFiltroAclEstatus] = useState('')
  const [expandido, setExpandido] = useState<string | null>(null)

  // Movimientos mensuales (últimos 6 meses) — antes de cualquier return (hooks estables)
  const mensual = useMemo(() => {
    if (!data) return []
    const map = new Map<string, { ingreso: number; egreso: number }>()
    data.variaciones.forEach((v) => {
      const k = dmyToKey(v.fecha); if (!k) return
      const cur = map.get(k) || { ingreso: 0, egreso: 0 }
      if (v.montoMovimiento >= 0) cur.ingreso += v.montoMovimiento; else cur.egreso += Math.abs(v.montoMovimiento)
      map.set(k, cur)
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-6)
      .map(([k, val]) => ({ label: `${MESES[Number(k.slice(5, 7)) - 1]} ${k.slice(2, 4)}`, ...val }))
  }, [data])

  if (!data) return <div className={cn('p-6 text-sm', isHey ? 'text-gray-400' : 'text-gray-500')}>Sin información para este registro.</div>

  const { persona, contratos, ofertas, variaciones, ingresos, timbrado, aclaraciones, comunicaciones, denuncias, tpv, recomendacion, nps } = data
  const esCliente = persona.esCliente

  const subtle = isHey ? 'text-gray-400' : 'text-gray-500'
  const cardCls = cn('rounded-xl border p-4', isHey ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white')
  const thCls = cn('text-left text-[11px] uppercase tracking-wide px-2 py-1.5', subtle)
  const tdCls = cn('px-2 py-2 text-sm', isHey ? 'text-gray-300' : 'text-gray-700')
  const Pill = ({ children, c }: { children: ReactNode; c: string }) => <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full', c)}>{children}</span>
  const estatusPill = (e: string) => e === 'Activo' ? 'bg-emerald-500/20 text-emerald-500' : e === 'Vencido' ? 'bg-amber-500/20 text-amber-500' : 'bg-gray-500/20 text-gray-400'

  // Resumen financiero
  const activos = contratos.filter((c) => c.estatus === 'Activo')
  const saldoTotal = contratos.reduce((s, c) => s + c.saldoActual, 0)
  const saldoVencido = contratos.reduce((s, c) => s + c.saldoVencido, 0)
  const enMora = contratos.filter((c) => c.diasMora > 0)
  const lineasCredito = contratos.filter((c) => c.tipo === 'Crédito' || c.tipo === 'TDC')
  const porVencer = lineasCredito.filter((c) => c.porVencer)

  // Distribución de saldo por tipo (cálculo simple; no es hook)
  const distrib = (() => {
    const m = new Map<string, number>()
    contratos.forEach((c) => { if (c.saldoActual > 0) m.set(c.tipo, (m.get(c.tipo) || 0) + c.saldoActual) })
    return Array.from(m.entries()).map(([tipo, val], i) => ({ tipo, val, color: COLORS[i % COLORS.length]! }))
  })()
  const distribTotal = distrib.reduce((s, d) => s + d.val, 0)

  // Donut (conic-gradient)
  const donut = (() => {
    if (!distribTotal) return 'transparent'
    let acc = 0
    const stops = distrib.map((d) => { const a = (acc / distribTotal) * 360; acc += d.val; const b = (acc / distribTotal) * 360; return `${d.color} ${a}deg ${b}deg` })
    return `conic-gradient(${stops.join(',')})`
  })()

  const maxMov = Math.max(1, ...mensual.map((m) => Math.max(m.ingreso, m.egreso)))

  // Pestañas
  const tabs: { key: string; label: string; icon: typeof Sparkles; n?: number; soloCliente?: boolean }[] = [
    { key: 'resumen', label: 'Resumen', icon: LayoutGrid },
    { key: 'productos', label: 'Productos', icon: CreditCard, n: contratos.length, soloCliente: true },
    { key: 'saldos', label: 'Saldos y mora', icon: Wallet, soloCliente: true },
    { key: 'vencer', label: 'Líneas por vencer', icon: CalendarClock, n: porVencer.length, soloCliente: true },
    { key: 'movimientos', label: 'Movimientos', icon: Activity, n: variaciones.length, soloCliente: true },
    { key: 'ingresos', label: 'Ingresos NF', icon: Wallet, n: ingresos.length, soloCliente: true },
    { key: 'ofertas', label: 'Ofertas', icon: BadgeCheck, n: ofertas.length },
    { key: 'comunicaciones', label: 'Comunicaciones', icon: Megaphone, n: comunicaciones.length },
    { key: 'aclaraciones', label: 'Aclaraciones', icon: MessageSquareWarning, n: aclaraciones.length },
    ...(denuncias.length ? [{ key: 'denuncias', label: 'Denuncias', icon: Gavel, n: denuncias.length }] : []),
  ].filter((t) => esCliente || !t.soloCliente)

  const Empty = ({ t }: { t: string }) => <div className={cn('text-sm py-4', subtle)}>{t}</div>
  const Kpi = ({ l, v, sub }: { l: string; v: string; sub?: string }) => (
    <div className={cn('rounded-lg p-3', isHey ? 'bg-white/5' : 'bg-orange-50')}>
      <div className={cn('text-xs', subtle)}>{l}</div>
      <div className={cn('text-xl font-bold', isHey ? 'text-white' : 'text-gray-900')}>{v}</div>
      {sub && <div className={cn('text-xs', subtle)}>{sub}</div>}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Encabezado neutro (sin identidad) */}
      <section className={cardCls}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', isHey ? 'bg-cyan-500/10 text-cyan-400' : 'bg-orange-100 text-orange-600')}><RefreshCw className="w-6 h-6" /></div>
            <div>
              <h2 className={cn('text-lg font-bold', isHey ? 'text-white' : 'text-gray-900')}>Ciclo de vida</h2>
              <p className={cn('text-xs', subtle)}>Perfil: {persona.tipoPersona} · {persona.segmento}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill c={esCliente ? (persona.estatus === 'Inactivo' ? 'bg-gray-500/20 text-gray-400' : 'bg-emerald-500/20 text-emerald-500') : 'bg-purple-500/20 text-purple-400'}>{esCliente ? `Cliente ${persona.estatus}` : 'Prospecto'}</Pill>
            {nps && <Pill c={npsColor(nps.categoria, isHey)}><Star className="w-3 h-3 mr-1" />NPS {nps.score} · {nps.categoria}</Pill>}
          </div>
        </div>
        <div className={cn('mt-3 text-sm', isHey ? 'text-gray-300' : 'text-gray-600')}>
          {persona.nacioComoProspecto
            ? <>Nació como <b>prospecto</b>{persona.fechaAltaProspecto ? ` el ${persona.fechaAltaProspecto}` : ''}{persona.fechaConversion ? <> · <b>Convertido a cliente</b> el {persona.fechaConversion}</> : ' · Sigue como prospecto'}</>
            : <>Alta directa como cliente.</>}
        </div>
      </section>

      {/* Pestañas */}
      <div className={cn('flex gap-1 overflow-x-auto pb-1 border-b', isHey ? 'border-white/10' : 'border-orange-100')}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-1.5 px-3 py-2 text-sm rounded-t-lg whitespace-nowrap border-b-2 -mb-px',
              tab === t.key
                ? isHey ? 'border-cyan-400 text-cyan-300' : 'border-orange-500 text-orange-600'
                : cn('border-transparent', isHey ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'))}>
            <t.icon className="w-4 h-4" />{t.label}
            {t.n !== undefined && <span className={cn('text-[10px] px-1.5 rounded-full', isHey ? 'bg-white/10' : 'bg-orange-100 text-orange-600')}>{t.n}</span>}
          </button>
        ))}
      </div>

      {/* ── RESUMEN ── */}
      {tab === 'resumen' && (
        <div className="space-y-4">
          {recomendacion && (
            <section className={cn(cardCls, isHey ? 'ring-1 ring-cyan-500/20' : 'ring-1 ring-orange-200')}>
              <div className="flex items-center gap-2 mb-2"><Sparkles className={cn('w-4 h-4', isHey ? 'text-cyan-400' : 'text-orange-500')} /><h3 className={cn('font-semibold text-sm', isHey ? 'text-white' : 'text-gray-800')}>Siguiente producto recomendado</h3></div>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className={cn('font-medium', isHey ? 'text-white' : 'text-gray-800')}>{recomendacion.productoRecomendado} <span className={subtle}>({recomendacion.familia})</span></div>
                  <div className={cn('text-sm', subtle)}>{recomendacion.motivo}</div>
                </div>
                <Pill c={isHey ? 'bg-cyan-500/20 text-cyan-300' : 'bg-orange-100 text-orange-600'}>Score {recomendacion.score}</Pill>
              </div>
            </section>
          )}

          {esCliente ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Kpi l="Saldo total" v={money(saldoTotal)} />
                <Kpi l="Saldo vencido" v={money(saldoVencido)} sub={`${enMora.length} en mora`} />
                <Kpi l="Productos activos" v={String(activos.length)} />
                <Kpi l="Líneas por vencer" v={String(porVencer.length)} sub="≤ 30 días" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Donut distribución */}
                <section className={cardCls}>
                  <h3 className={cn('font-semibold text-sm mb-3', isHey ? 'text-white' : 'text-gray-800')}>Distribución de saldo por producto</h3>
                  {distribTotal === 0 ? <Empty t="Sin saldos." /> : (
                    <div className="flex items-center gap-4">
                      <div className="relative w-32 h-32 rounded-full shrink-0" style={{ background: donut }}>
                        <div className={cn('absolute inset-[18%] rounded-full', isHey ? 'bg-[#0f1219]' : 'bg-white')} />
                      </div>
                      <div className="space-y-1">
                        {distrib.map((d) => (
                          <div key={d.tipo} className="flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                            <span className={isHey ? 'text-gray-300' : 'text-gray-700'}>{d.tipo}: {money(d.val)}</span>
                            <span className={subtle}>({Math.round((d.val / distribTotal) * 100)}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* Movimientos mensuales */}
                <section className={cardCls}>
                  <h3 className={cn('font-semibold text-sm mb-3', isHey ? 'text-white' : 'text-gray-800')}>Movimientos (últimos 6 meses)</h3>
                  {mensual.length === 0 ? <Empty t="Sin movimientos." /> : (
                    <>
                      <div className="flex items-end gap-3 h-36">
                        {mensual.map((m) => (
                          <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                            <div className="flex items-end gap-0.5 h-28 w-full justify-center">
                              <div className="w-2.5 rounded-t bg-blue-500" style={{ height: `${(m.ingreso / maxMov) * 100}%` }} title={`Ingreso ${money(m.ingreso)}`} />
                              <div className="w-2.5 rounded-t bg-amber-500" style={{ height: `${(m.egreso / maxMov) * 100}%` }} title={`Egreso ${money(m.egreso)}`} />
                            </div>
                            <span className={cn('text-[10px]', subtle)}>{m.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500" />Ingresos</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500" />Egresos</span>
                      </div>
                    </>
                  )}
                </section>
              </div>
            </>
          ) : (
            <section className={cardCls}><Empty t="Prospecto: aún no es cliente. No tiene productos, saldos ni movimientos. Gestiónalo desde Ofertas y Comunicaciones." /></section>
          )}
        </div>
      )}

      {/* ── PRODUCTOS (tarjetas) ── */}
      {tab === 'productos' && (
        contratos.length === 0 ? <section className={cardCls}><Empty t="Sin productos." /></section> : (
          <div className="grid md:grid-cols-2 gap-3">
            {contratos.map((c) => {
              const disponible = Math.max(0, c.lineaAutorizada - c.saldoActual)
              const usoPct = c.lineaAutorizada ? Math.min(100, Math.round((c.saldoActual / c.lineaAutorizada) * 100)) : 0
              const tieneLinea = c.tipo === 'TDC' || c.tipo === 'Crédito'
              return (
                <section key={c.idContrato} className={cardCls}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className={cn('font-semibold', isHey ? 'text-white' : 'text-gray-800')}>{c.producto}</div>
                      <div className={cn('text-xs', subtle)}>{c.familia} · {mask4(c.numeroCuenta)}</div>
                    </div>
                    <Pill c={estatusPill(c.estatus)}>{c.estatus}</Pill>
                  </div>
                  <div className={cn('text-2xl font-bold mt-2', isHey ? 'text-white' : 'text-gray-900')}>{money(c.saldoActual)}</div>
                  {tieneLinea && (
                    <>
                      <div className={cn('h-1.5 rounded-full mt-2 overflow-hidden', isHey ? 'bg-white/10' : 'bg-gray-200')}>
                        <div className="h-full bg-blue-500" style={{ width: `${usoPct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className={subtle}>Uso {usoPct}%</span>
                        <span className={subtle}>Disponible {money(disponible)} / {money(c.lineaAutorizada)}</span>
                      </div>
                    </>
                  )}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-3">
                    <span className={subtle}>Próximo pago</span><span className="text-right">{c.fechaProximoPago}</span>
                    <span className={subtle}>Vence</span><span className={cn('text-right', c.porVencer ? 'text-amber-500 font-medium' : '')}>{c.fechaVencimiento}</span>
                    <span className={subtle}>Mora</span><span className="text-right"><Pill c={c.diasMora > 0 ? 'bg-red-500/20 text-red-500' : (isHey ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500')}>{c.bucketMora}</Pill></span>
                  </div>
                </section>
              )
            })}
          </div>
        )
      )}

      {/* ── SALDOS Y MORA ── */}
      {tab === 'saldos' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi l="Saldo total" v={money(saldoTotal)} />
            <Kpi l="Saldo vencido" v={money(saldoVencido)} />
            <Kpi l="Contratos en mora" v={String(enMora.length)} />
            <Kpi l="% cartera vencida" v={`${saldoTotal ? Math.round((saldoVencido / saldoTotal) * 100) : 0}%`} />
          </div>
          {/* Distribución por bucket de mora */}
          <section className={cardCls}>
            <h3 className={cn('font-semibold text-sm mb-3', isHey ? 'text-white' : 'text-gray-800')}>Cartera por bucket de mora</h3>
            {(() => {
              const buckets = ['Al corriente', '1-29', '30-59', '60-89', '90+']
              const byB = buckets.map((b) => ({ b, n: contratos.filter((c) => c.bucketMora === b).length }))
              const max = Math.max(1, ...byB.map((x) => x.n))
              return (
                <div className="space-y-2">
                  {byB.map((x) => (
                    <div key={x.b} className="flex items-center gap-2 text-sm">
                      <span className={cn('w-24 shrink-0', subtle)}>{x.b}</span>
                      <div className={cn('flex-1 h-4 rounded overflow-hidden', isHey ? 'bg-white/10' : 'bg-gray-100')}>
                        <div className={cn('h-full', x.b === 'Al corriente' ? 'bg-emerald-500' : x.b === '90+' ? 'bg-red-500' : 'bg-amber-500')} style={{ width: `${(x.n / max) * 100}%` }} />
                      </div>
                      <span className={cn('w-8 text-right', isHey ? 'text-gray-300' : 'text-gray-700')}>{x.n}</span>
                    </div>
                  ))}
                </div>
              )
            })()}
          </section>
          {/* Tabla de contratos con saldo */}
          <section className={cardCls}>
            <table className="w-full">
              <thead><tr>{['Producto', 'Saldo', 'Vencido', 'Mora', 'Estatus'].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
              <tbody>
                {contratos.map((c) => (
                  <tr key={c.idContrato} className={cn('border-t', isHey ? 'border-white/5' : 'border-orange-100')}>
                    <td className={tdCls}>{c.producto}</td><td className={tdCls}>{money(c.saldoActual)}</td>
                    <td className={tdCls}>{c.saldoVencido ? money(c.saldoVencido) : '—'}</td>
                    <td className="px-2 py-2"><Pill c={c.diasMora > 0 ? 'bg-red-500/20 text-red-500' : (isHey ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500')}>{c.bucketMora}</Pill></td>
                    <td className="px-2 py-2"><Pill c={estatusPill(c.estatus)}>{c.estatus}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {/* ── LÍNEAS POR VENCER ── */}
      {tab === 'vencer' && (
        <section className={cardCls}>
          <h3 className={cn('font-semibold text-sm mb-3', isHey ? 'text-white' : 'text-gray-800')}>Líneas de crédito y contratos por vencimiento</h3>
          {lineasCredito.length === 0 ? <Empty t="Sin líneas de crédito." /> : (
            <table className="w-full">
              <thead><tr>{['Producto', 'Línea', 'Saldo', 'Vence', 'Mora', 'Estatus'].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
              <tbody>
                {lineasCredito.slice().sort((a, b) => Number(a.porVencer === false) - Number(b.porVencer === false)).map((c) => (
                  <tr key={c.idContrato} className={cn('border-t', isHey ? 'border-white/5' : 'border-orange-100', c.porVencer ? (isHey ? 'bg-amber-500/5' : 'bg-amber-50') : '')}>
                    <td className={tdCls}>{c.producto} <span className={subtle}>({c.familia})</span></td>
                    <td className={tdCls}>{money(c.lineaAutorizada)}</td>
                    <td className={tdCls}>{money(c.saldoActual)}</td>
                    <td className={cn(tdCls, c.porVencer ? 'text-amber-500 font-medium' : '')}>{c.fechaVencimiento}{c.porVencer ? ' ⚠' : ''}</td>
                    <td className="px-2 py-2"><Pill c={c.diasMora > 0 ? 'bg-red-500/20 text-red-500' : (isHey ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500')}>{c.bucketMora}</Pill></td>
                    <td className="px-2 py-2"><Pill c={estatusPill(c.estatus)}>{c.estatus}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* ── MOVIMIENTOS ── */}
      {tab === 'movimientos' && (
        <div className="space-y-4">
          <section className={cardCls}>
            <h3 className={cn('font-semibold text-sm mb-3', isHey ? 'text-white' : 'text-gray-800')}>Timbrado / activación</h3>
            <div className="grid md:grid-cols-2 gap-2">
              {timbrado.map((t) => (
                <div key={t.idContrato} className={cn('flex items-center justify-between rounded-lg px-3 py-2', isHey ? 'bg-white/5' : 'bg-orange-50')}>
                  <div><div className={cn('text-sm font-medium', isHey ? 'text-white' : 'text-gray-800')}>{t.evento} <span className={subtle}>· {t.familia}</span></div><div className={cn('text-xs', subtle)}>{t.criterio}</div></div>
                  <Pill c={t.cumplido ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-500/20 text-gray-400'}>{t.cumplido ? '✓ Timbrado' : 'Pendiente'}</Pill>
                </div>
              ))}
            </div>
          </section>
          <section className={cardCls}>
            <h3 className={cn('font-semibold text-sm mb-3', isHey ? 'text-white' : 'text-gray-800')}>Variaciones (cheques / créditos)</h3>
            {variaciones.length === 0 ? <Empty t="Sin variaciones." /> : (
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full">
                  <thead><tr>{['Fecha', 'Tipo', 'Anterior', 'Actual', 'Movimiento'].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
                  <tbody>
                    {variaciones.map((v, i) => (
                      <tr key={i} className={cn('border-t', isHey ? 'border-white/5' : 'border-orange-100')}>
                        <td className={tdCls}>{v.fecha}</td><td className={tdCls}>{v.tipo}</td><td className={tdCls}>{money(v.montoAnterior)}</td><td className={tdCls}>{money(v.montoActual)}</td>
                        <td className={cn(tdCls, v.montoMovimiento >= 0 ? 'text-emerald-500' : 'text-red-500')}>{v.montoMovimiento >= 0 ? '+' : ''}{money(v.montoMovimiento)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── INGRESOS NF ── */}
      {tab === 'ingresos' && (
        <section className={cardCls}>
          <h3 className={cn('font-semibold text-sm mb-1', isHey ? 'text-white' : 'text-gray-800')}>Ingresos no financieros (cobros por servicios)</h3>
          <p className={cn('text-xs mb-3', subtle)}>Total: {money(ingresos.reduce((s, g) => s + g.monto, 0))} en {ingresos.reduce((s, g) => s + g.operaciones, 0)} operaciones</p>
          {ingresos.length === 0 ? <Empty t="Sin cobros por servicios." /> : (
            <table className="w-full">
              <thead><tr>{['Concepto', 'Cobro', 'Operaciones', 'Fecha'].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
              <tbody>
                {ingresos.map((g, i) => (
                  <tr key={i} className={cn('border-t', isHey ? 'border-white/5' : 'border-orange-100')}>
                    <td className={tdCls}>{g.concepto}</td><td className={tdCls}>{money(g.monto)}</td><td className={tdCls}>{g.operaciones}</td><td className={tdCls}>{g.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tpv.length > 0 && (
            <div className="mt-4">
              <h4 className={cn('font-semibold text-sm mb-2', isHey ? 'text-white' : 'text-gray-800')}><Store className="w-4 h-4 inline mr-1" />TPV — afiliaciones</h4>
              <table className="w-full">
                <thead><tr>{['Afiliación', 'Terminal', 'Modelo', 'Estatus', 'Facturación'].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
                <tbody>
                  {tpv.map((t, i) => (
                    <tr key={i} className={cn('border-t', isHey ? 'border-white/5' : 'border-orange-100')}>
                      <td className={tdCls}>{t.numeroAfiliacion}</td><td className={tdCls}>{t.terminalId}</td><td className={tdCls}>{t.modelo}</td>
                      <td className="px-2 py-2"><Pill c={t.estatus === 'Activa' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-500/20 text-gray-400'}>{t.estatus}</Pill></td>
                      <td className={tdCls}>{money(t.facturacionMensual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ── OFERTAS (enlazan al módulo) ── */}
      {tab === 'ofertas' && (
        <section className={cardCls}>
          <h3 className={cn('font-semibold text-sm mb-3', isHey ? 'text-white' : 'text-gray-800')}>Ofertas del cliente</h3>
          {ofertas.length === 0 ? <Empty t="Sin ofertas." /> : (
            <table className="w-full">
              <thead><tr>{['Producto', 'Monto', 'Etapa', 'Fecha', ''].map((h, i) => <th key={i} className={thCls}>{h}</th>)}</tr></thead>
              <tbody>
                {ofertas.map((o) => (
                  <tr key={o.idOferta} className={cn('border-t cursor-pointer', isHey ? 'border-white/5 hover:bg-white/5' : 'border-orange-100 hover:bg-orange-50/50')}
                    onClick={() => abrirOferta(o.idOferta)}>
                    <td className={tdCls}>{o.producto} <span className={subtle}>({o.familia})</span></td>
                    <td className={tdCls}>{money(o.monto)}</td>
                    <td className="px-2 py-2"><Pill c={o.tipoOferta === 'Cliente' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}>{o.etapa}</Pill></td>
                    <td className={tdCls}>{o.fechaCierre}</td>
                    <td className="px-2 py-2 text-right"><ExternalLink className={cn('w-4 h-4 inline', isHey ? 'text-cyan-400' : 'text-orange-500')} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className={cn('text-xs mt-2', subtle)}>Haz clic en una oferta para abrirla en el módulo Ofertas.</p>
        </section>
      )}

      {/* ── COMUNICACIONES (filtros + contenido) ── */}
      {tab === 'comunicaciones' && (
        <section className={cardCls}>
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <h3 className={cn('font-semibold text-sm', isHey ? 'text-white' : 'text-gray-800')}>Comunicaciones</h3>
            <select value={filtroCanal} onChange={(e) => setFiltroCanal(e.target.value)} className={cn('px-2 py-1.5 text-sm rounded-lg border', isHey ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-orange-200 text-gray-800')}>
              <option value="">Todos los canales</option>
              {['WhatsApp', 'SMS', 'Correo', 'Email', 'Llamada'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {comunicaciones.filter((c) => !filtroCanal || c.canal === filtroCanal).length === 0 ? <Empty t="Sin comunicaciones." /> : (
            <div className="space-y-1">
              {comunicaciones.filter((c) => !filtroCanal || c.canal === filtroCanal).map((c, i) => {
                const id = `com${i}`
                return (
                  <div key={id} className={cn('rounded-lg border', isHey ? 'border-white/10' : 'border-orange-100')}>
                    <button onClick={() => setExpandido(expandido === id ? null : id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left">
                      {expandido === id ? <ChevronDown className="w-4 h-4 opacity-60" /> : <ChevronRight className="w-4 h-4 opacity-60" />}
                      <Pill c={isHey ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}>{c.canal}</Pill>
                      <span className={cn('font-medium', isHey ? 'text-gray-200' : 'text-gray-800')}>{c.asunto}</span>
                      <span className={cn('ml-auto text-xs', subtle)}>{c.estatus} · {c.fecha}</span>
                    </button>
                    {expandido === id && <div className={cn('px-9 pb-3 text-sm', subtle)}>{c.contenido}</div>}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ── ACLARACIONES (filtros + contenido) ── */}
      {tab === 'aclaraciones' && (
        <section className={cardCls}>
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <h3 className={cn('font-semibold text-sm', isHey ? 'text-white' : 'text-gray-800')}>Aclaraciones, quejas y comentarios</h3>
            <div className="flex gap-2">
              <select value={filtroAclTipo} onChange={(e) => setFiltroAclTipo(e.target.value)} className={cn('px-2 py-1.5 text-sm rounded-lg border', isHey ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-orange-200 text-gray-800')}>
                <option value="">Todos los tipos</option>{['Aclaración', 'Queja', 'Comentario'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={filtroAclEstatus} onChange={(e) => setFiltroAclEstatus(e.target.value)} className={cn('px-2 py-1.5 text-sm rounded-lg border', isHey ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-orange-200 text-gray-800')}>
                <option value="">Todos los estatus</option>{['Abierta', 'En proceso', 'Cerrada'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          {(() => {
            const list = aclaraciones.filter((a) => (!filtroAclTipo || a.tipo === filtroAclTipo) && (!filtroAclEstatus || a.estatus === filtroAclEstatus))
            if (list.length === 0) return <Empty t="Sin registros." />
            return (
              <div className="space-y-1">
                {list.map((a) => {
                  const id = a.folio
                  return (
                    <div key={id} className={cn('rounded-lg border', isHey ? 'border-white/10' : 'border-orange-100')}>
                      <button onClick={() => setExpandido(expandido === id ? null : id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left">
                        {expandido === id ? <ChevronDown className="w-4 h-4 opacity-60" /> : <ChevronRight className="w-4 h-4 opacity-60" />}
                        <Pill c={a.tipo === 'Queja' ? 'bg-red-500/20 text-red-500' : a.tipo === 'Aclaración' ? 'bg-amber-500/20 text-amber-500' : (isHey ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600')}>{a.tipo}</Pill>
                        <span className={cn('font-medium', isHey ? 'text-gray-200' : 'text-gray-800')}>{a.motivo}</span>
                        <span className="ml-auto flex items-center gap-2">
                          <Pill c={a.estatus === 'Cerrada' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}>{a.estatus}</Pill>
                          <span className={cn('text-xs', subtle)}>{a.fechaApertura}</span>
                        </span>
                      </button>
                      {expandido === id && (
                        <div className={cn('px-9 pb-3 text-sm', subtle)}>
                          <div className="font-mono text-xs mb-1">{a.folio} · {a.canal}</div>
                          {a.detalle}
                          {a.fechaCierre && <div className="text-xs mt-1">Cerrada el {a.fechaCierre}</div>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </section>
      )}

      {/* ── DENUNCIAS ── */}
      {tab === 'denuncias' && (
        <section className={cardCls}>
          <h3 className={cn('font-semibold text-sm mb-3', isHey ? 'text-white' : 'text-gray-800')}>Denuncias</h3>
          <table className="w-full">
            <thead><tr>{['Folio', 'Tipo', 'Autoridad', 'Estatus', 'Fecha'].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
            <tbody>
              {denuncias.map((d) => (
                <tr key={d.folio} className={cn('border-t', isHey ? 'border-white/5' : 'border-orange-100')}>
                  <td className={cn(tdCls, 'font-mono text-xs')}>{d.folio}</td><td className={tdCls}>{d.tipo}</td><td className={tdCls}>{d.autoridad}</td><td className={tdCls}>{d.estatus}</td><td className={tdCls}>{d.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
