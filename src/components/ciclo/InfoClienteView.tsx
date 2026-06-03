/**
 * InfoClienteView — sección de IDENTIDAD del cliente (sin finanzas).
 * Separa la información sensible/identidad del ciclo de vida financiero.
 */

import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import { getCiclo360 } from '@/data/ciclo-seed'

export function InfoClienteView({ rfc }: { rfc: string }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const data = getCiclo360(rfc)
  if (!data) return <div className={cn('p-6 text-sm', isHey ? 'text-gray-400' : 'text-gray-500')}>Sin información.</div>

  const { persona, numerosCliente } = data
  const subtle = isHey ? 'text-gray-400' : 'text-gray-500'
  const labelCls = cn('text-[11px] uppercase tracking-wide mb-1', subtle)
  const valueBox = cn('px-3 py-2 text-sm rounded-lg border', isHey ? 'bg-white/5 border-white/10 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700')
  const cardCls = cn('rounded-xl border p-4', isHey ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white')

  const campos: [string, string][] = [
    ['Nombre / Razón social', persona.nombre],
    ['RFC', persona.rfc],
    ['Tipo de persona', persona.tipoPersona],
    ['Segmento', persona.segmento],
    ['Teléfonos', persona.telefonos],
    ['Correo', persona.correo],
    ['Dirección', persona.direccion],
  ]

  return (
    <div className="space-y-4">
      <section className={cardCls}>
        <h3 className={cn('font-semibold text-sm mb-3', isHey ? 'text-white' : 'text-gray-800')}>Datos de identidad y contacto</h3>
        <div className="grid grid-cols-2 gap-4">
          {campos.map(([l, v]) => (
            <div key={l}><div className={labelCls}>{l}</div><div className={valueBox}>{v || '—'}</div></div>
          ))}
        </div>
      </section>

      <section className={cardCls}>
        <h3 className={cn('font-semibold text-sm mb-3', isHey ? 'text-white' : 'text-gray-800')}>Números de cliente</h3>
        {numerosCliente.length === 0 ? (
          <div className={cn('text-sm', subtle)}>Sin números de cliente.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {numerosCliente.map((n) => (
              <span key={n.numeroCliente} className={cn('inline-flex px-2 py-0.5 text-xs font-medium rounded-full', isHey ? 'bg-white/10 text-gray-200' : 'bg-gray-100 text-gray-700')}>{n.numeroCliente}</span>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
