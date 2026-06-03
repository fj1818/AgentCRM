/**
 * Agente de la oferta (detalle). Permite actualizar campos mediante solicitudes
 * (con valores permitidos) y responder dudas del cliente: en qué otras campañas
 * está y qué otras ofertas tiene. Chatbot local con chips + consulta libre.
 */

import { useEffect, useRef, useState } from 'react'
import { Bot, Send } from 'lucide-react'
import { useUIStore } from '@/stores'
import { useOfertasStore } from '@/stores/ofertas.store'
import { cn } from '@/utils'
import type { Offer } from '@/data/ofertas-seed'
import { etapasPermitidas, parseEtapa, extractMonto, campanasDe, resumenOfertas } from './asistente'

interface Msg { id: string; tipo: 'user' | 'bot'; texto: string }

export function OfertaAgentePanel({ offer }: { offer: Offer }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const { offers, catalogs, updateOffer } = useOfertasStore()

  const idOferta = offer.raw['ID de la oferta'] || ''
  const rfc = offer.raw['RFC'] || ''
  const etapas = etapasPermitidas(offer.tipoOferta)

  const [input, setInput] = useState('')
  const [modoEtapa, setModoEtapa] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: '0', tipo: 'bot', texto: 'Puedo actualizar esta oferta (etapa, monto) y responder dudas del cliente: "¿en qué campañas está?" o "¿qué otras ofertas tiene?".' },
  ])
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const add = (tipo: Msg['tipo'], texto: string) => setMsgs((p) => [...p, { id: Date.now() + Math.random() + '', tipo, texto }])

  function aplicarEtapa(etapa: string) {
    setModoEtapa(false)
    add('user', `Cambiar etapa a ${etapa}`)
    const res = updateOffer(idOferta, { Etapa: etapa })
    add('bot', res.ok ? `✓ Etapa actualizada a "${etapa}".` : `⚠ ${res.error}`)
  }

  function aplicarMonto(monto: number) {
    add('bot', (() => {
      const res = updateOffer(idOferta, { 'Monto de la oferta': String(monto) })
      return res.ok ? `✓ Monto actualizado a $${monto.toLocaleString('es-MX')}.` : `⚠ ${res.error}`
    })())
  }

  function responder(texto: string) {
    const t = texto.toLowerCase()
    if (t.includes('campaña') || t.includes('campana')) {
      const c = campanasDe(rfc, offers, catalogs)
      add('bot', c.length ? `Este cliente está en:\n${c.map((x) => `• ${x}`).join('\n')}` : 'No tiene otras campañas registradas.')
      return
    }
    if (t.includes('oferta') && (t.includes('otra') || t.includes('tiene') || t.includes('qué') || t.includes('que'))) {
      add('bot', `Ofertas del cliente:\n${resumenOfertas(rfc, offers)}`)
      return
    }
    if (t.includes('etapa')) {
      const e = parseEtapa(texto, etapas)
      if (e) { aplicarEtapa(e); return }
      setModoEtapa(true)
      add('bot', `¿A qué etapa? Opciones: ${etapas.join(', ')}.`)
      return
    }
    if (t.includes('monto')) {
      const m = extractMonto(texto)
      if (m) { aplicarMonto(m); return }
      add('bot', 'Indica el monto, ej. "actualiza el monto a 50000".')
      return
    }
    add('bot', 'Puedo: cambiar etapa, actualizar monto, o decirte sus campañas y otras ofertas.')
  }

  function enviar(texto: string) { if (!texto.trim()) return; add('user', texto.trim()); setInput(''); responder(texto.trim()) }

  const chips = [
    { l: 'Cambiar etapa', a: () => { setModoEtapa(true); add('bot', `Selecciona la etapa (${offer.tipoOferta}):`) } },
    { l: 'Actualizar monto', a: () => add('bot', 'Escribe: "monto 50000".') },
    { l: 'Sus campañas', a: () => responder('campañas') },
    { l: 'Otras ofertas', a: () => responder('otras ofertas') },
  ]

  return (
    <aside className={cn('w-80 shrink-0 border-l flex flex-col', isHey ? 'border-white/10 bg-[#1a1f2e]' : 'border-orange-100 bg-white')}>
      <div className={cn('px-4 py-3 border-b flex items-center gap-2', isHey ? 'border-white/10' : 'border-orange-100')}>
        <Bot className={cn('w-5 h-5', isHey ? 'text-cyan-400' : 'text-orange-500')} />
        <span className={cn('font-semibold text-sm', isHey ? 'text-white' : 'text-gray-800')}>Asistente de la oferta</span>
        <span className={cn('ml-auto text-xs flex items-center gap-1', isHey ? 'text-cyan-400' : 'text-green-600')}><span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> En línea</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {msgs.map((m) => (
          <div key={m.id} className={cn('p-3 rounded-xl text-sm whitespace-pre-wrap',
            m.tipo === 'bot' ? (isHey ? 'bg-white/5 text-gray-300' : 'bg-orange-50 text-gray-600') : (isHey ? 'bg-cyan-500/20 text-cyan-100 ml-6' : 'bg-orange-100 text-gray-700 ml-6'))}>{m.texto}</div>
        ))}
        {modoEtapa && (
          <div className="flex flex-wrap gap-1.5">
            {etapas.map((e) => (
              <button key={e} onClick={() => aplicarEtapa(e)} className={cn('text-xs px-2 py-1 rounded-lg border', isHey ? 'border-cyan-500/40 text-cyan-300 hover:bg-white/5' : 'border-orange-300 text-orange-600 hover:bg-orange-50')}>{e}</button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <button key={c.l} onClick={c.a} className={cn('text-xs px-2.5 py-1.5 rounded-lg border', isHey ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-orange-200 text-gray-600 hover:bg-orange-50')}>{c.l}</button>
        ))}
      </div>

      <div className={cn('p-3 border-t', isHey ? 'border-white/10' : 'border-orange-100')}>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); enviar(input) } }}
            placeholder="Ej. cambia la etapa a Negociación" className={cn('flex-1 px-3 py-2 text-sm rounded-lg border', isHey ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500' : 'bg-orange-50 border-orange-200 text-gray-800 placeholder:text-gray-400')} />
          <button onClick={() => enviar(input)} disabled={!input.trim()} className={cn('px-3 py-2 rounded-lg', input.trim() ? (isHey ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'bg-orange-500 text-white hover:bg-orange-600') : (isHey ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-400'))}><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </aside>
  )
}
