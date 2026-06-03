/**
 * Panel de agente de chat dentro del detalle de la oferta.
 * Conversa con el agente n8n usando el contexto según el tipo de oferta
 * (Cliente → oportunidades, Prospecto → prospectos). Inyecta el ID de la
 * oferta como contexto de sistema para que el agente sepa qué registro ve.
 */

import { useEffect, useRef, useState } from 'react'
import { Bot, Send } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import { enviarAlAgente } from '@/services'
import type { Offer } from '@/data/ofertas-seed'

interface Msg { id: string; tipo: 'usuario' | 'asistente'; texto: string }

export function OfertaAgentePanel({ offer }: { offer: Offer }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const contexto: 'oportunidades' | 'prospectos' = offer.tipoOferta === 'Cliente' ? 'oportunidades' : 'prospectos'
  const idOferta = offer.raw['ID de la oferta'] || ''

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => `oferta_${idOferta}_${Date.now()}`)
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: '0', tipo: 'asistente', texto: 'Puedo ayudarte con esta oferta: cambiar etapa, actualizar monto, sugerencias…' },
  ])
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const add = (tipo: Msg['tipo'], texto: string) => setMsgs((p) => [...p, { id: Date.now() + Math.random() + '', tipo, texto }])

  async function enviar(texto: string) {
    if (!texto.trim()) return
    add('usuario', texto.trim())
    setInput('')
    setLoading(true)
    try {
      const sys = `[SISTEMA: El usuario está viendo la oferta ID: ${idOferta} (${offer.tipoOferta}). Etapa: ${offer.etapa}. Producto: ${offer.producto}.]`
      const r = await enviarAlAgente(`${texto.trim()}\n${sys}`, sessionId, contexto)
      add('asistente', typeof r === 'object' && r !== null ? (r.mensaje || JSON.stringify(r)) : String(r))
    } catch {
      add('asistente', '❌ Error al consultar al agente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className={cn('w-80 shrink-0 border-l flex flex-col', isHey ? 'border-white/10 bg-[#1a1f2e]' : 'border-orange-100 bg-white')}>
      <div className={cn('px-4 py-3 border-b flex items-center gap-2', isHey ? 'border-white/10' : 'border-orange-100')}>
        <Bot className={cn('w-5 h-5', isHey ? 'text-cyan-400' : 'text-orange-500')} />
        <span className={cn('font-semibold text-sm', isHey ? 'text-white' : 'text-gray-800')}>Agente de Ofertas</span>
        <span className={cn('ml-auto text-xs flex items-center gap-1', isHey ? 'text-cyan-400' : 'text-green-600')}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> En línea
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {msgs.map((m) => (
          <div key={m.id} className={cn('p-3 rounded-xl text-sm',
            m.tipo === 'asistente'
              ? isHey ? 'bg-white/5 text-gray-300' : 'bg-orange-50 text-gray-600'
              : isHey ? 'bg-cyan-500/20 text-cyan-100 ml-6' : 'bg-orange-100 text-gray-700 ml-6')}>
            <p className="whitespace-pre-wrap">{m.texto}</p>
          </div>
        ))}
        {loading && (
          <div className={cn('p-3 rounded-xl flex gap-1', isHey ? 'bg-white/5' : 'bg-orange-50')}>
            {[0, 150, 300].map((d) => (
              <div key={d} className={cn('w-2 h-2 rounded-full animate-bounce', isHey ? 'bg-cyan-400' : 'bg-orange-400')} style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className={cn('p-3 border-t', isHey ? 'border-white/10' : 'border-orange-100')}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(input) } }}
            placeholder="Escribe una instrucción…"
            className={cn('flex-1 px-3 py-2 text-sm rounded-lg border', isHey ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500' : 'bg-orange-50 border-orange-200 text-gray-800 placeholder:text-gray-400')}
          />
          <button onClick={() => enviar(input)} disabled={!input.trim() || loading}
            className={cn('px-3 py-2 rounded-lg', input.trim() && !loading ? (isHey ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'bg-orange-500 text-white hover:bg-orange-600') : (isHey ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-400'))}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
