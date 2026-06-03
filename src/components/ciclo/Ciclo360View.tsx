/**
 * Ciclo360View — renderiza la vista 360° del ciclo de vida de una persona (RFC).
 * Reutilizable: se usa en el módulo "Ciclo de vida" (barra lateral) y dentro
 * del detalle de oferta (sección Ciclo de vida) filtrado por el RFC de la oferta.
 * Un prospecto oculta los bloques de productos.
 */

import type { ReactNode } from 'react'
import {
  User, Sparkles, CreditCard, Activity, BadgeCheck, AlertTriangle,
  Wallet, Megaphone, MessageSquareWarning, Gavel, Store, Star, IdCard,
} from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import { getCiclo360 } from '@/data/ciclo-seed'
import { money } from '@/components/ofertas/ofertasFormat'

function npsColor(cat: string, isHey: boolean) {
  if (cat === 'Promotor') return 'bg-emerald-500/20 text-emerald-500'
  if (cat === 'Detractor') return 'bg-red-500/20 text-red-500'
  return isHey ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-600'
}

export function Ciclo360View({ rfc }: { rfc: string }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const data = getCiclo360(rfc)

  if (!data) return <div className={cn('p-6 text-sm', isHey ? 'text-gray-400' : 'text-gray-500')}>Sin información para este registro.</div>

  const { persona, numerosCliente, contratos, ofertas, variaciones, ingresos, timbrado, aclaraciones, comunicaciones, denuncias, tpv, recomendacion, nps } = data
  const esCliente = persona.esCliente

  const cardCls = cn('rounded-xl border p-4', isHey ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white')
  const subtle = isHey ? 'text-gray-400' : 'text-gray-500'
  const thCls = cn('text-left text-[11px] uppercase tracking-wide px-2 py-1', subtle)
  const tdCls = cn('px-2 py-1.5 text-sm', isHey ? 'text-gray-300' : 'text-gray-700')

  // Resumen financiero
  const activos = contratos.filter((c) => c.estatus === 'Activo')
  const saldoTotal = contratos.reduce((s, c) => s + c.saldoActual, 0)
  const saldoVencido = contratos.reduce((s, c) => s + c.saldoVencido, 0)
  const enMora = contratos.filter((c) => c.diasMora > 0)
  const porVencer = contratos.filter((c) => c.porVencer)

  const Section = ({ icon: Icon, title, count, children }: { icon: typeof User; title: string; count?: number; children: ReactNode }) => (
    <section className={cardCls}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn('w-4 h-4', isHey ? 'text-cyan-400' : 'text-orange-500')} />
        <h3 className={cn('font-semibold text-sm', isHey ? 'text-white' : 'text-gray-800')}>{title}</h3>
        {count !== undefined && <span className={cn('text-xs px-2 py-0.5 rounded-full', isHey ? 'bg-white/10 text-gray-300' : 'bg-orange-100 text-orange-600')}>{count}</span>}
      </div>
      {children}
    </section>
  )
  const Empty = ({ t }: { t: string }) => <div className={cn('text-sm', subtle)}>{t}</div>
  const Pill = ({ children, cls }: { children: ReactNode; cls: string }) => <span className={cn('inline-flex px-2 py-0.5 text-xs font-medium rounded-full', cls)}>{children}</span>

  return (
    <div className="space-y-4">
      {/* Encabezado / línea de vida */}
      <section className={cardCls}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', isHey ? 'bg-cyan-500/10 text-cyan-400' : 'bg-orange-100 text-orange-600')}><User className="w-6 h-6" /></div>
            <div>
              <h2 className={cn('text-lg font-bold', isHey ? 'text-white' : 'text-gray-900')}>{persona.nombre}</h2>
              <p className={cn('text-xs', subtle)}>{persona.rfc} · {persona.tipoPersona} · {persona.segmento} · {persona.banco}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill cls={esCliente ? (persona.estatus === 'Inactivo' ? 'bg-gray-500/20 text-gray-400' : 'bg-emerald-500/20 text-emerald-500') : 'bg-purple-500/20 text-purple-400'}>
              {esCliente ? `Cliente ${persona.estatus}` : 'Prospecto'}
            </Pill>
            {nps && <Pill cls={npsColor(nps.categoria, isHey)}><Star className="w-3 h-3 mr-1" />NPS {nps.score} · {nps.categoria}</Pill>}
          </div>
        </div>
        {/* Línea de vida */}
        <div className={cn('mt-3 text-sm', isHey ? 'text-gray-300' : 'text-gray-600')}>
          {persona.nacioComoProspecto
            ? <>Nació como <b>prospecto</b>{persona.fechaAltaProspecto ? ` el ${persona.fechaAltaProspecto}` : ''}{persona.fechaConversion ? <> · <b>Convertido a cliente</b> el {persona.fechaConversion}</> : ' · Sigue como prospecto'}</>
            : <>Alta directa como cliente.</>}
        </div>
      </section>

      {/* NBA */}
      {recomendacion && (
        <Section icon={Sparkles} title="Siguiente producto recomendado">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className={cn('font-medium', isHey ? 'text-white' : 'text-gray-800')}>{recomendacion.productoRecomendado} <span className={subtle}>({recomendacion.familia})</span></div>
              <div className={cn('text-sm', subtle)}>{recomendacion.motivo}</div>
            </div>
            <Pill cls={isHey ? 'bg-cyan-500/20 text-cyan-300' : 'bg-orange-100 text-orange-600'}>Score {recomendacion.score}</Pill>
          </div>
        </Section>
      )}

      {/* Bloques de cliente (productos) */}
      {esCliente ? (
        <>
          {/* Resumen financiero */}
          <Section icon={Wallet} title="Resumen financiero">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['Saldo total', money(saldoTotal)],
                ['Saldo vencido', money(saldoVencido)],
                ['Contratos activos', String(activos.length)],
                ['En mora / por vencer', `${enMora.length} / ${porVencer.length}`],
              ].map(([l, v]) => (
                <div key={l} className={cn('rounded-lg p-3', isHey ? 'bg-white/5' : 'bg-orange-50')}>
                  <div className={cn('text-xs', subtle)}>{l}</div>
                  <div className={cn('text-lg font-bold', isHey ? 'text-white' : 'text-gray-900')}>{v}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* Números de cliente */}
          <Section icon={IdCard} title="Números de cliente" count={numerosCliente.length}>
            {numerosCliente.length === 0 ? <Empty t="Sin números de cliente." /> : (
              <div className="flex flex-wrap gap-2">
                {numerosCliente.map((n) => <Pill key={n.numeroCliente} cls={isHey ? 'bg-white/10 text-gray-200' : 'bg-gray-100 text-gray-700'}>{n.numeroCliente} · {n.banco}</Pill>)}
              </div>
            )}
          </Section>

          {/* Contratos / cuentas */}
          <Section icon={CreditCard} title="Cuentas y contratos" count={contratos.length}>
            {contratos.length === 0 ? <Empty t="Sin contratos." /> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr>{['Producto', 'Familia', 'Cuenta', 'Estatus', 'Saldo', 'Vencido', 'Mora', 'Vence'].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
                  <tbody>
                    {contratos.map((c) => (
                      <tr key={c.idContrato} className={cn('border-t', isHey ? 'border-white/5' : 'border-orange-100')}>
                        <td className={tdCls}>{c.producto}</td>
                        <td className={tdCls}>{c.familia}</td>
                        <td className={cn(tdCls, 'font-mono text-xs')}>{c.numeroCuenta}</td>
                        <td className="px-2 py-1.5"><Pill cls={c.estatus === 'Activo' ? 'bg-emerald-500/20 text-emerald-500' : c.estatus === 'Vencido' ? 'bg-amber-500/20 text-amber-500' : 'bg-gray-500/20 text-gray-400'}>{c.estatus}</Pill></td>
                        <td className={tdCls}>{money(c.saldoActual)}</td>
                        <td className={tdCls}>{c.saldoVencido ? money(c.saldoVencido) : '—'}</td>
                        <td className="px-2 py-1.5"><Pill cls={c.diasMora > 0 ? 'bg-red-500/20 text-red-500' : (isHey ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500')}>{c.bucketMora}</Pill></td>
                        <td className={cn(tdCls, c.porVencer ? 'text-amber-500 font-medium' : '')}>{c.fechaVencimiento}{c.porVencer ? ' ⚠' : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {/* Timbrado / activación */}
          <Section icon={BadgeCheck} title="Timbrado / activación de productos" count={timbrado.length}>
            {timbrado.length === 0 ? <Empty t="Sin productos." /> : (
              <div className="grid md:grid-cols-2 gap-2">
                {timbrado.map((t) => (
                  <div key={t.idContrato} className={cn('flex items-center justify-between rounded-lg px-3 py-2', isHey ? 'bg-white/5' : 'bg-orange-50')}>
                    <div>
                      <div className={cn('text-sm font-medium', isHey ? 'text-white' : 'text-gray-800')}>{t.evento} <span className={subtle}>· {t.familia}</span></div>
                      <div className={cn('text-xs', subtle)}>{t.criterio}</div>
                    </div>
                    <Pill cls={t.cumplido ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-500/20 text-gray-400'}>{t.cumplido ? '✓ Timbrado' : 'Pendiente'}</Pill>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Variaciones */}
          <Section icon={Activity} title="Variaciones (cheques / créditos)" count={variaciones.length}>
            {variaciones.length === 0 ? <Empty t="Sin variaciones." /> : (
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full">
                  <thead><tr>{['Fecha', 'Tipo', 'Anterior', 'Actual', 'Movimiento'].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
                  <tbody>
                    {variaciones.map((v, i) => (
                      <tr key={i} className={cn('border-t', isHey ? 'border-white/5' : 'border-orange-100')}>
                        <td className={tdCls}>{v.fecha}</td><td className={tdCls}>{v.tipo}</td>
                        <td className={tdCls}>{money(v.montoAnterior)}</td><td className={tdCls}>{money(v.montoActual)}</td>
                        <td className={cn(tdCls, v.montoMovimiento >= 0 ? 'text-emerald-500' : 'text-red-500')}>{v.montoMovimiento >= 0 ? '+' : ''}{money(v.montoMovimiento)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {/* Ingresos no financieros */}
          <Section icon={Wallet} title="Ingresos no financieros (cobros por servicios)" count={ingresos.length}>
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
          </Section>

          {/* TPV */}
          {tpv.length > 0 && (
            <Section icon={Store} title="TPV — afiliaciones y equipos" count={tpv.length}>
              <table className="w-full">
                <thead><tr>{['Afiliación', 'Terminal', 'Modelo', 'Estatus', 'Facturación'].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
                <tbody>
                  {tpv.map((t, i) => (
                    <tr key={i} className={cn('border-t', isHey ? 'border-white/5' : 'border-orange-100')}>
                      <td className={tdCls}>{t.numeroAfiliacion}</td><td className={tdCls}>{t.terminalId}</td><td className={tdCls}>{t.modelo}</td>
                      <td className="px-2 py-1.5"><Pill cls={t.estatus === 'Activa' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-500/20 text-gray-400'}>{t.estatus}</Pill></td>
                      <td className={tdCls}>{money(t.facturacionMensual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}
        </>
      ) : (
        <Section icon={AlertTriangle} title="Prospecto">
          <Empty t="Aún no es cliente: no tiene productos contratados, cuentas, saldos ni timbrado. Solo aplica su gestión comercial (ofertas, comunicaciones y aclaraciones)." />
        </Section>
      )}

      {/* Ofertas (cliente y prospecto) */}
      <Section icon={CreditCard} title="Ofertas" count={ofertas.length}>
        {ofertas.length === 0 ? <Empty t="Sin ofertas." /> : (
          <table className="w-full">
            <thead><tr>{['Tipo', 'Familia', 'Producto', 'Etapa', 'Monto', 'Fecha cierre'].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
            <tbody>
              {ofertas.map((o) => (
                <tr key={o.idOferta} className={cn('border-t', isHey ? 'border-white/5' : 'border-orange-100')}>
                  <td className="px-2 py-1.5"><Pill cls={o.tipoOferta === 'Cliente' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}>{o.tipoOferta}</Pill></td>
                  <td className={tdCls}>{o.familia}</td><td className={tdCls}>{o.producto}</td><td className={tdCls}>{o.etapa}</td>
                  <td className={tdCls}>{money(o.monto)}</td><td className={tdCls}>{o.fechaCierre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* Comunicaciones */}
      <Section icon={Megaphone} title="Comunicaciones" count={comunicaciones.length}>
        {comunicaciones.length === 0 ? <Empty t="Sin comunicaciones." /> : (
          <table className="w-full">
            <thead><tr>{['Canal', 'Asunto', 'Estatus', 'Fecha'].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
            <tbody>
              {comunicaciones.map((c, i) => (
                <tr key={i} className={cn('border-t', isHey ? 'border-white/5' : 'border-orange-100')}>
                  <td className={tdCls}>{c.canal}</td><td className={tdCls}>{c.asunto}</td><td className={tdCls}>{c.estatus}</td><td className={tdCls}>{c.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* Aclaraciones / quejas */}
      <Section icon={MessageSquareWarning} title="Aclaraciones, quejas y comentarios" count={aclaraciones.length}>
        {aclaraciones.length === 0 ? <Empty t="Sin aclaraciones." /> : (
          <table className="w-full">
            <thead><tr>{['Folio', 'Tipo', 'Motivo', 'Canal', 'Estatus', 'Apertura'].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
            <tbody>
              {aclaraciones.map((a) => (
                <tr key={a.folio} className={cn('border-t', isHey ? 'border-white/5' : 'border-orange-100')}>
                  <td className={cn(tdCls, 'font-mono text-xs')}>{a.folio}</td><td className={tdCls}>{a.tipo}</td><td className={tdCls}>{a.motivo}</td>
                  <td className={tdCls}>{a.canal}</td>
                  <td className="px-2 py-1.5"><Pill cls={a.estatus === 'Cerrada' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}>{a.estatus}</Pill></td>
                  <td className={tdCls}>{a.fechaApertura}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* Denuncias */}
      {denuncias.length > 0 && (
        <Section icon={Gavel} title="Denuncias" count={denuncias.length}>
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
        </Section>
      )}
    </div>
  )
}
