/**
 * ContactoAcciones — botones WhatsApp / Correo / Llamada.
 * Al presionar uno, permite elegir el destino (teléfono o correo) entre los
 * disponibles del cliente o capturar uno, e inicia el proceso real
 * (wa.me / mailto: / tel:). Reutilizable en Ciclo de vida y detalle de oferta.
 */

import { useState } from 'react'
import { MessageCircle, Mail, Phone, ExternalLink } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'

type Canal = 'WhatsApp' | 'Correo' | 'Llamada'

function listar(s?: string): string[] {
  return String(s || '').split(/[,;]+/).map((x) => x.trim()).filter(Boolean)
}
function soloDigitos(s: string): string { return s.replace(/\D/g, '') }
function waNumero(s: string): string { const d = soloDigitos(s); return d.length === 10 ? '52' + d : d }

export function ContactoAcciones({ telefonos, correos }: { telefonos?: string; correos?: string }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [canal, setCanal] = useState<Canal | null>(null)
  const [destino, setDestino] = useState('')

  const tels = listar(telefonos)
  const mails = listar(correos)
  const esCorreo = canal === 'Correo'
  const opciones = esCorreo ? mails : tels

  const inputCls = cn('px-3 py-2 text-sm rounded-lg border w-full', isHey ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-orange-200 text-gray-800')

  function abrir(c: Canal) {
    setCanal(c === canal ? null : c)
    setDestino('')
  }
  function iniciar() {
    const d = destino.trim()
    if (!d) return
    if (canal === 'WhatsApp') window.open(`https://wa.me/${waNumero(d)}`, '_blank')
    else if (canal === 'Llamada') window.location.href = `tel:${soloDigitos(d)}`
    else if (canal === 'Correo') window.location.href = `mailto:${d}`
    setCanal(null); setDestino('')
  }

  const Boton = ({ c, Icon, cls }: { c: Canal; Icon: typeof Mail; cls: string }) => (
    <button onClick={() => abrir(c)}
      className={cn('flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg font-medium text-white', cls, canal === c && 'ring-2 ring-offset-1 ring-offset-transparent')}>
      <Icon className="w-4 h-4" />{c}
    </button>
  )

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Boton c="WhatsApp" Icon={MessageCircle} cls="bg-green-600 hover:bg-green-700" />
        <Boton c="Correo" Icon={Mail} cls={isHey ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-orange-500 hover:bg-orange-600'} />
        <Boton c="Llamada" Icon={Phone} cls="bg-blue-600 hover:bg-blue-700" />
      </div>

      {canal && (
        <div className={cn('mt-3 rounded-lg border p-3', isHey ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-orange-50')}>
          <div className={cn('text-xs mb-2', isHey ? 'text-gray-400' : 'text-gray-500')}>
            {esCorreo ? 'Selecciona o escribe el correo:' : 'Selecciona o escribe el teléfono:'}
          </div>
          {opciones.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {opciones.map((o) => (
                <button key={o} onClick={() => setDestino(o)}
                  className={cn('px-2 py-1 text-xs rounded-full border',
                    destino === o ? (isHey ? 'border-cyan-500 bg-cyan-500/20 text-cyan-200' : 'border-orange-400 bg-orange-100 text-orange-700')
                      : (isHey ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-orange-200 text-gray-600 hover:bg-white'))}>
                  {o}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={destino} onChange={(e) => setDestino(e.target.value)} type={esCorreo ? 'email' : 'tel'}
              placeholder={esCorreo ? 'correo@dominio.com' : '10 dígitos'} className={inputCls}
              onKeyDown={(e) => { if (e.key === 'Enter') iniciar() }} />
            <button onClick={iniciar} disabled={!destino.trim()}
              className={cn('px-3 py-2 text-sm rounded-lg font-medium whitespace-nowrap', destino.trim()
                ? (isHey ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'bg-orange-500 text-white hover:bg-orange-600')
                : (isHey ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-400'))}>
              <ExternalLink className="w-4 h-4 inline -mt-0.5 mr-1" />Iniciar {canal}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
