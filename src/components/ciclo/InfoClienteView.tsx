/**
 * InfoClienteView — sección de IDENTIDAD del cliente (sin finanzas).
 * Permite agregar métodos de contacto (teléfono/correo/dirección) y enviar
 * una comunicación (correo/WhatsApp/llamada). Demo: estado local.
 */

import { useState } from 'react'
import { Phone, Mail, MapPin, Plus, Send, MessageCircle } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import { getCiclo360 } from '@/data/ciclo-seed'

type TipoContacto = 'Teléfono' | 'Correo' | 'Dirección'
type Canal = 'Correo' | 'WhatsApp' | 'Llamada'

export function InfoClienteView({ rfc }: { rfc: string }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const data = getCiclo360(rfc)

  const [nuevos, setNuevos] = useState<{ tipo: TipoContacto; valor: string }[]>([])
  const [tipo, setTipo] = useState<TipoContacto>('Teléfono')
  const [valor, setValor] = useState('')

  const [canal, setCanal] = useState<Canal>('Correo')
  const [mensaje, setMensaje] = useState('')
  const [enviado, setEnviado] = useState<string | null>(null)

  if (!data) return <div className={cn('p-6 text-sm', isHey ? 'text-gray-400' : 'text-gray-500')}>Sin información.</div>
  const { persona, numerosCliente } = data

  const subtle = isHey ? 'text-gray-400' : 'text-gray-500'
  const labelCls = cn('text-[11px] uppercase tracking-wide mb-1', subtle)
  const valueBox = cn('px-3 py-2 text-sm rounded-lg border', isHey ? 'bg-white/5 border-white/10 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700')
  const cardCls = cn('rounded-xl border p-4', isHey ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white')
  const inputCls = cn('px-3 py-2 text-sm rounded-lg border', isHey ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-orange-200 text-gray-800')
  const btnPrimary = cn('px-3 py-2 text-sm rounded-lg font-medium', isHey ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'bg-orange-500 text-white hover:bg-orange-600')

  const campos: [string, string][] = [
    ['Nombre / Razón social', persona.nombre],
    ['RFC', persona.rfc],
    ['Tipo de persona', persona.tipoPersona],
    ['Segmento', persona.segmento],
  ]
  const contactosBase = [
    { tipo: 'Teléfono' as TipoContacto, valor: persona.telefonos },
    { tipo: 'Correo' as TipoContacto, valor: persona.correo },
    { tipo: 'Dirección' as TipoContacto, valor: persona.direccion },
  ].filter((c) => c.valor)
  const contactos = [...contactosBase, ...nuevos]

  const iconFor = (t: TipoContacto) => t === 'Teléfono' ? Phone : t === 'Correo' ? Mail : MapPin

  function agregar() {
    if (!valor.trim()) return
    setNuevos((p) => [...p, { tipo, valor: valor.trim() }])
    setValor('')
  }
  function enviar() {
    if (!mensaje.trim()) return
    setEnviado(`✅ ${canal} enviado al cliente: "${mensaje.trim()}"`)
    setMensaje('')
    setTimeout(() => setEnviado(null), 4000)
  }

  return (
    <div className="space-y-4">
      {/* Identidad */}
      <section className={cardCls}>
        <h3 className={cn('font-semibold text-sm mb-3', isHey ? 'text-white' : 'text-gray-800')}>Datos de identidad</h3>
        <div className="grid grid-cols-2 gap-4">
          {campos.map(([l, v]) => (
            <div key={l}><div className={labelCls}>{l}</div><div className={valueBox}>{v || '—'}</div></div>
          ))}
        </div>
      </section>

      {/* Métodos de contacto */}
      <section className={cardCls}>
        <h3 className={cn('font-semibold text-sm mb-3', isHey ? 'text-white' : 'text-gray-800')}>Métodos de contacto</h3>
        <div className="space-y-2 mb-3">
          {contactos.length === 0 && <div className={cn('text-sm', subtle)}>Sin métodos de contacto.</div>}
          {contactos.map((c, i) => {
            const Icon = iconFor(c.tipo)
            return (
              <div key={i} className={cn('flex items-center gap-2 rounded-lg px-3 py-2', isHey ? 'bg-white/5' : 'bg-orange-50')}>
                <Icon className={cn('w-4 h-4', isHey ? 'text-cyan-400' : 'text-orange-500')} />
                <span className={cn('text-xs w-20 shrink-0', subtle)}>{c.tipo}</span>
                <span className={cn('text-sm', isHey ? 'text-gray-200' : 'text-gray-700')}>{c.valor}</span>
              </div>
            )
          })}
        </div>
        {/* Agregar contacto */}
        <div className="flex flex-wrap gap-2 items-center">
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoContacto)} className={inputCls}>
            <option>Teléfono</option><option>Correo</option><option>Dirección</option>
          </select>
          <input value={valor} onChange={(e) => setValor(e.target.value)} placeholder={`Nuevo ${tipo.toLowerCase()}…`}
            onKeyDown={(e) => { if (e.key === 'Enter') agregar() }} className={cn(inputCls, 'flex-1 min-w-[180px]')} />
          <button onClick={agregar} disabled={!valor.trim()} className={cn(btnPrimary, !valor.trim() && 'opacity-50')}>
            <Plus className="w-4 h-4 inline -mt-0.5 mr-1" />Agregar
          </button>
        </div>
      </section>

      {/* Números de cliente */}
      <section className={cardCls}>
        <h3 className={cn('font-semibold text-sm mb-3', isHey ? 'text-white' : 'text-gray-800')}>Números de cliente</h3>
        {numerosCliente.length === 0 ? <div className={cn('text-sm', subtle)}>Sin números de cliente.</div> : (
          <div className="flex flex-wrap gap-2">
            {numerosCliente.map((n) => (
              <span key={n.numeroCliente} className={cn('inline-flex px-2 py-0.5 text-xs font-medium rounded-full', isHey ? 'bg-white/10 text-gray-200' : 'bg-gray-100 text-gray-700')}>{n.numeroCliente}</span>
            ))}
          </div>
        )}
      </section>

      {/* Enviar comunicación */}
      <section className={cardCls}>
        <h3 className={cn('font-semibold text-sm mb-3', isHey ? 'text-white' : 'text-gray-800')}>Enviar comunicación</h3>
        <div className="flex gap-2 mb-2">
          {(['Correo', 'WhatsApp', 'Llamada'] as Canal[]).map((c) => {
            const Icon = c === 'Correo' ? Mail : c === 'WhatsApp' ? MessageCircle : Phone
            return (
              <button key={c} onClick={() => setCanal(c)}
                className={cn('flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border',
                  canal === c ? (isHey ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-orange-300 bg-orange-50 text-orange-600')
                    : (isHey ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-orange-200 text-gray-600 hover:bg-orange-50'))}>
                <Icon className="w-4 h-4" />{c}
              </button>
            )
          })}
        </div>
        <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} rows={3}
          placeholder={canal === 'Llamada' ? 'Notas de la llamada…' : `Mensaje por ${canal}…`} className={cn(inputCls, 'w-full')} />
        <div className="flex items-center justify-between mt-2">
          <span className={cn('text-sm', enviado ? 'text-emerald-500' : subtle)}>{enviado || `Canal seleccionado: ${canal}`}</span>
          <button onClick={enviar} disabled={!mensaje.trim()} className={cn(btnPrimary, !mensaje.trim() && 'opacity-50')}>
            <Send className="w-4 h-4 inline -mt-0.5 mr-1" />{canal === 'Llamada' ? 'Registrar' : 'Enviar'}
          </button>
        </div>
      </section>
    </div>
  )
}
