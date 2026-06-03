/**
 * Asistente de Gestión de Ofertas (panel de la tabla).
 * - Crea ofertas de cliente o prospecto (abre el asistente Nueva oferta).
 * - Localiza clientes/prospectos por RFC o número de cliente.
 * - Responde dudas comerciales: qué ofertas tiene, en qué campañas está.
 * Chatbot con chips predefinidos + consulta libre. Local (sobre el store).
 */

import { useEffect, useRef, useState } from 'react'
import { Bot, Send } from 'lucide-react'
import { useUIStore } from '@/stores'
import { useOfertasStore } from '@/stores/ofertas.store'
import { cn } from '@/utils'
import { resolverRfc, resumenOfertas, campanasDe } from './asistente'

interface Msg { id: string; tipo: 'user' | 'bot'; texto: string }

export function AsistenteOfertasPanel({ onCrearOferta }: { onCrearOferta: (tipo: 'Cliente' | 'Prospecto') => void }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const { offers, clientsByRfc, catalogs } = useOfertasStore()

  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: '0', tipo: 'bot', texto: 'Soy tu asistente de gestión de ofertas. Puedo crear ofertas, localizar un cliente/prospecto por RFC o número, y decirte qué ofertas o campañas tiene.' },
  ])
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const add = (tipo: Msg['tipo'], texto: string) => setMsgs((p) => [...p, { id: Date.now() + Math.random() + '', tipo, texto }])

  function responder(texto: string) {
    const t = texto.toLowerCase()
    // Crear
    if (/(crea|crear|nueva|alta).*(prospecto)/.test(t)) { add('bot', 'Abriendo el asistente para crear una oferta de prospecto…'); onCrearOferta('Prospecto'); return }
    if (/(crea|crear|nueva|alta).*(cliente|oferta)/.test(t)) { add('bot', 'Abriendo el asistente para crear una oferta de cliente…'); onCrearOferta('Cliente'); return }

    // Consultas con RFC / número de cliente
    const rfc = resolverRfc(texto, clientsByRfc)
    if (rfc) {
      const cli = clientsByRfc[rfc]
      const quien = cli ? `${cli.nombre} (${rfc})` : `RFC ${rfc}`
      if (t.includes('campaña') || t.includes('campana')) {
        const camps = campanasDe(rfc, offers, catalogs)
        add('bot', camps.length ? `${quien} está en:\n${camps.map((c) => `• ${c}`).join('\n')}` : `${quien} no tiene campañas registradas.`)
        return
      }
      // por defecto: ofertas
      add('bot', `Ofertas de ${quien}:\n${resumenOfertas(rfc, offers)}`)
      return
    }

    if (t.includes('campaña') || t.includes('oferta') || t.includes('cliente') || t.includes('prospecto')) {
      add('bot', 'Indícame el RFC o el número de cliente (ej. "ofertas de XAXX010101000" o "campañas de CLI-4000021").')
      return
    }
    add('bot', 'Puedo: crear ofertas, "ofertas de <RFC/número>" o "campañas de <RFC/número>".')
  }

  function enviar(texto: string) {
    if (!texto.trim()) return
    add('user', texto.trim()); setInput(''); responder(texto.trim())
  }

  const chips = [
    { l: '➕ Oferta de cliente', a: () => { add('user', 'Crear oferta de cliente'); onCrearOferta('Cliente') } },
    { l: '➕ Oferta de prospecto', a: () => { add('user', 'Crear oferta de prospecto'); onCrearOferta('Prospecto') } },
    { l: '🔎 Ofertas de un cliente', a: () => add('bot', 'Escribe: "ofertas de <RFC o número de cliente>".') },
    { l: '🏷️ Campañas de un cliente', a: () => add('bot', 'Escribe: "campañas de <RFC o número de cliente>".') },
  ]

  return (
    <aside className={cn('flex flex-col h-full border-l', isHey ? 'border-white/10 bg-[#1a1f2e]' : 'border-orange-200 bg-white')}>
      <div className={cn('px-4 py-3 border-b flex items-center gap-2', isHey ? 'border-white/10' : 'border-orange-100')}>
        <Bot className={cn('w-5 h-5', isHey ? 'text-cyan-400' : 'text-orange-500')} />
        <span className={cn('font-semibold text-sm', isHey ? 'text-white' : 'text-gray-800')}>Asistente de Ofertas</span>
        <span className={cn('ml-auto text-xs flex items-center gap-1', isHey ? 'text-cyan-400' : 'text-green-600')}><span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> En línea</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {msgs.map((m) => (
          <div key={m.id} className={cn('p-3 rounded-xl text-sm whitespace-pre-wrap',
            m.tipo === 'bot' ? (isHey ? 'bg-white/5 text-gray-300' : 'bg-orange-50 text-gray-600') : (isHey ? 'bg-cyan-500/20 text-cyan-100 ml-6' : 'bg-orange-100 text-gray-700 ml-6'))}>{m.texto}</div>
        ))}
        <div ref={endRef} />
      </div>

      <div className={cn('px-3 pb-2 flex flex-wrap gap-1.5')}>
        {chips.map((c) => (
          <button key={c.l} onClick={c.a} className={cn('text-xs px-2.5 py-1.5 rounded-lg border', isHey ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-orange-200 text-gray-600 hover:bg-orange-50')}>{c.l}</button>
        ))}
      </div>

      <div className={cn('p-3 border-t', isHey ? 'border-white/10' : 'border-orange-100')}>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); enviar(input) } }}
            placeholder="Escribe una instrucción…" className={cn('flex-1 px-3 py-2 text-sm rounded-lg border', isHey ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500' : 'bg-orange-50 border-orange-200 text-gray-800 placeholder:text-gray-400')} />
          <button onClick={() => enviar(input)} disabled={!input.trim()} className={cn('px-3 py-2 rounded-lg', input.trim() ? (isHey ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'bg-orange-500 text-white hover:bg-orange-600') : (isHey ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-400'))}><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </aside>
  )
}
