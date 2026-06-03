/**
 * Chat lateral unificado del módulo Ofertas.
 * Habla con el agente n8n (contexto prospecto/oportunidad seleccionable).
 * Nota: la mutación de datos vía chat se optimizará más adelante; por ahora
 * conversa con el agente y muestra sus respuestas.
 */

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import { enviarAlAgente } from '@/services'

interface Mensaje {
  id: string
  tipo: 'usuario' | 'asistente'
  contenido: string
}

type Contexto = 'prospectos' | 'oportunidades'

export function OfertasChatSidebar() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [contexto, setContexto] = useState<Contexto>('oportunidades')
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `ofertas_${Date.now()}`)
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: '1',
      tipo: 'asistente',
      contenido: '¡Hola! Soy tu asistente de Ofertas. Selecciona el contexto (Oportunidad o Prospecto) y dime qué necesitas.',
    },
  ])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const agregar = (tipo: Mensaje['tipo'], contenido: string) =>
    setMensajes((prev) => [...prev, { id: Date.now().toString(), tipo, contenido }])

  const enviar = async (texto: string) => {
    if (!texto.trim()) return
    agregar('usuario', texto.trim())
    setInput('')
    setIsLoading(true)
    try {
      const r = await enviarAlAgente(texto.trim(), sessionId, contexto)
      const msg = typeof r === 'object' && r !== null ? r.mensaje || JSON.stringify(r) : String(r)
      agregar('asistente', msg)
    } catch {
      agregar('asistente', '❌ Hubo un error procesando tu solicitud.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col h-full border-l', isHey ? 'border-white/10 bg-[#1a1f2e]' : 'border-orange-200 bg-white')}>
      {/* Header */}
      <div className={cn('px-4 py-3 border-b flex items-center gap-2', isHey ? 'border-white/10' : 'border-orange-100')}>
        <MessageSquare className={cn('w-5 h-5', isHey ? 'text-cyan-400' : 'text-orange-500')} />
        <span className={cn('font-semibold text-sm', isHey ? 'text-white' : 'text-gray-800')}>Agente Ofertas</span>
      </div>

      {/* Selector de contexto */}
      <div className={cn('px-3 py-2 flex gap-2 border-b', isHey ? 'border-white/10' : 'border-orange-100')}>
        {(['oportunidades', 'prospectos'] as Contexto[]).map((c) => (
          <button
            key={c}
            onClick={() => setContexto(c)}
            className={cn(
              'flex-1 py-1.5 text-xs rounded-lg transition-colors capitalize',
              contexto === c
                ? isHey ? 'bg-cyan-500 text-white' : 'bg-orange-500 text-white'
                : isHey ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-orange-50 text-gray-600 hover:bg-orange-100'
            )}
          >
            {c === 'oportunidades' ? 'Oportunidad' : 'Prospecto'}
          </button>
        ))}
      </div>

      {/* Mensajes */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {mensajes.map((m) => (
          <div
            key={m.id}
            className={cn(
              'p-3 rounded-xl text-sm',
              m.tipo === 'asistente'
                ? isHey ? 'bg-white/5 text-gray-300' : 'bg-orange-50 text-gray-600'
                : isHey ? 'bg-cyan-500/20 text-cyan-100 ml-6' : 'bg-orange-100 text-gray-700 ml-6'
            )}
          >
            <p className="whitespace-pre-wrap">{m.contenido}</p>
          </div>
        ))}
        {isLoading && (
          <div className={cn('p-3 rounded-xl flex gap-1', isHey ? 'bg-white/5' : 'bg-orange-50')}>
            {[0, 150, 300].map((d) => (
              <div
                key={d}
                className={cn('w-2 h-2 rounded-full animate-bounce', isHey ? 'bg-cyan-400' : 'bg-orange-400')}
                style={{ animationDelay: `${d}ms` }}
              />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className={cn('p-3 border-t', isHey ? 'border-white/10' : 'border-orange-100')}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                enviar(input)
              }
            }}
            placeholder="Escribe aquí..."
            className={cn(
              'flex-1 px-3 py-2 text-sm rounded-lg border',
              isHey ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500' : 'bg-orange-50 border-orange-200 text-gray-800 placeholder:text-gray-400'
            )}
          />
          <button
            onClick={() => enviar(input)}
            disabled={!input.trim() || isLoading}
            className={cn(
              'px-3 py-2 rounded-lg transition-colors',
              input.trim() && !isLoading
                ? isHey ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'bg-orange-500 text-white hover:bg-orange-600'
                : isHey ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-400'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
