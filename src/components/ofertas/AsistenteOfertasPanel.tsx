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
import { resolverRfc, resumenOfertas, campanasDe, resolverFamiliaId } from './asistente'
import { consultarAgente, type RespuestaAgente } from '@/services/asistenteN8n'

interface Msg { id: string; tipo: 'user' | 'bot'; texto: string }

export function AsistenteOfertasPanel({ onCrearOferta }: { onCrearOferta: (tipo: 'Cliente' | 'Prospecto') => void }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const { offers, clientsByRfc, catalogs, createClientOffer, createProspectOffer, searchClients } = useOfertasStore()

  const [input, setInput] = useState('')
  const [sessionId] = useState(() => `ofertas_${Date.now()}`)
  const [loading, setLoading] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: '0', tipo: 'bot', texto: 'Soy tu asistente de gestión de ofertas. Puedo crear ofertas, localizar un cliente/prospecto por RFC o número, y decirte qué ofertas o campañas tiene.' },
  ])
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const add = (tipo: Msg['tipo'], texto: string) => setMsgs((p) => [...p, { id: Date.now() + Math.random() + '', tipo, texto }])

  /** Devuelve true si lo resolvió localmente; false → fallback a n8n. */
  function responder(texto: string): boolean {
    const t = texto.toLowerCase()
    // Crear
    if (/(crea|crear|nueva|alta).*(prospecto)/.test(t)) { add('bot', 'Abriendo el asistente para crear una oferta de prospecto…'); onCrearOferta('Prospecto'); return true }
    if (/(crea|crear|nueva|alta).*(cliente|oferta)/.test(t)) { add('bot', 'Abriendo el asistente para crear una oferta de cliente…'); onCrearOferta('Cliente'); return true }

    // Consultas con RFC / número de cliente
    const rfc = resolverRfc(texto, clientsByRfc)
    if (rfc) {
      const cli = clientsByRfc[rfc]
      const quien = cli ? `${cli.nombre} (${rfc})` : `RFC ${rfc}`
      if (t.includes('campaña') || t.includes('campana')) {
        const camps = campanasDe(rfc, offers, catalogs)
        add('bot', camps.length ? `${quien} está en:\n${camps.map((c) => `• ${c}`).join('\n')}` : `${quien} no tiene campañas registradas.`)
        return true
      }
      add('bot', `Ofertas de ${quien}:\n${resumenOfertas(rfc, offers)}`)
      return true
    }
    return false // no resuelto localmente → n8n
  }

  /** Ejecuta en el store el intent de creación devuelto por n8n (cambio real). */
  function ejecutarCrear(resp: RespuestaAgente): string {
    const d = resp.data || {}
    const idFam = resolverFamiliaId(String(d.familia || d.familiaProducto || d.producto || ''), catalogs)
    const esPros = resp.intent === 'CREAR_PROSPECTO' || d.tipo === 'Prospecto'
    if (resp.intent === 'CREAR_OFERTA' || resp.intent === 'CREAR_PROSPECTO') {
      if (!idFam) return resp.mensaje || 'No identifiqué la familia de producto.'
      try {
        if (esPros) {
          createProspectOffer({ nombre: String(d.nombre || ''), tipoPersona: String(d.tipoPersona || 'PF'), rfc: String(d.rfc || ''), correo: String(d.correo || ''), telefono: String(d.telefono || ''), idFamilia: idFam })
          return resp.mensaje || '✅ Oferta de prospecto creada.'
        }
        let rfc = String(d.rfc || '')
        if (!rfc && d.nombre) rfc = searchClients(String(d.nombre))[0]?.rfc || ''
        if (!rfc) return 'No identifiqué al cliente. Dame su RFC o número de cliente.'
        createClientOffer({ rfc, idFamilia: idFam })
        return resp.mensaje || '✅ Oferta de cliente creada.'
      } catch (e) { return `⚠ ${e instanceof Error ? e.message : 'No se pudo crear la oferta.'}` }
    }
    return resp.mensaje || 'No pude procesar la solicitud.'
  }

  async function enviar(texto: string) {
    if (!texto.trim() || loading) return
    add('user', texto.trim()); setInput('')
    if (responder(texto.trim())) return
    setLoading(true)
    const resp = await consultarAgente('ofertasCrear', texto.trim(), sessionId)
    setLoading(false)
    add('bot', ejecutarCrear(resp))
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
        {loading && (
          <div className={cn('p-3 rounded-xl flex gap-1', isHey ? 'bg-white/5' : 'bg-orange-50')}>
            {[0, 150, 300].map((d) => <div key={d} className={cn('w-2 h-2 rounded-full animate-bounce', isHey ? 'bg-cyan-400' : 'bg-orange-400')} style={{ animationDelay: `${d}ms` }} />)}
          </div>
        )}
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
          <button onClick={() => enviar(input)} disabled={!input.trim() || loading} className={cn('px-3 py-2 rounded-lg', input.trim() && !loading ? (isHey ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'bg-orange-500 text-white hover:bg-orange-600') : (isHey ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-400'))}><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </aside>
  )
}
