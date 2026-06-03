/**
 * Asistente de Tareas y Agenda (local, sobre eventos.store).
 * Homologado al asistente de Ofertas: chips predefinidos + consulta libre,
 * sin n8n. Crea tareas/reuniones con captura guiada por pasos y responde
 * dudas (tareas de hoy, pendientes, reuniones).
 */

import { useEffect, useRef, useState } from 'react'
import { Bot, Send } from 'lucide-react'
import { useUIStore, useEventosStore } from '@/stores'
import { cn } from '@/utils'

interface Msg { id: string; tipo: 'user' | 'bot'; texto: string }
type Paso = 'nombre' | 'fecha' | 'hora' | 'duracion'
interface Flujo { tipo: 'reunion' | 'tarea'; paso: Paso; datos: { nombre?: string; fecha?: string; hora?: string; duracion?: number } }

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const pad = (n: number) => String(n).padStart(2, '0')
const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }

function parseFecha(t: string): string | null {
  const s = t.toLowerCase().trim()
  const d = new Date()
  if (s.includes('hoy')) return hoyISO()
  if (s.includes('pasado mañana') || s.includes('pasado manana')) { d.setDate(d.getDate() + 2); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
  if (s.includes('mañana') || s.includes('manana')) { d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
  let m = /(\d{4})-(\d{2})-(\d{2})/.exec(s); if (m) return `${m[1]}-${m[2]}-${m[3]}`
  m = /(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/.exec(s); if (m) { const y = m[3] || String(d.getFullYear()); return `${y}-${pad(+m[2]!)}-${pad(+m[1]!)}` }
  const idx = DIAS.findIndex((dia) => s.includes(dia)); if (idx !== -1) { let add = (idx - d.getDay() + 7) % 7; if (add === 0) add = 7; d.setDate(d.getDate() + add); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
  return null
}
function parseHora(t: string): string | null {
  let m = /(\d{1,2})[:h](\d{2})/.exec(t); if (m) return `${pad(+m[1]!)}:${m[2]}`
  m = /a\s*las?\s*(\d{1,2})/i.exec(t); if (m) return `${pad(+m[1]!)}:00`
  return null
}
function parseDuracion(t: string): number | null {
  let m = /(\d+)\s*h(?:ora)?/i.exec(t); if (m) return +m[1]! * 60
  m = /(\d+)\s*min/i.exec(t); if (m) return +m[1]!
  m = /^\s*(\d+)\s*$/.exec(t); if (m) return +m[1]!
  return null
}
function fmtFecha(iso: string) { const d = new Date(iso + 'T12:00:00'); return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) }

export function AsistenteTareasPanel({ onEventoCreado }: { onEventoCreado?: (fecha: Date) => void }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const { eventos, agregarEvento, getEventosPorFecha } = useEventosStore()

  const [input, setInput] = useState('')
  const [flujo, setFlujo] = useState<Flujo | null>(null)
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: '0', tipo: 'bot', texto: 'Soy tu asistente de tareas y agenda. Puedo crear tareas o reuniones y decirte qué tienes hoy o pendiente.' },
  ])
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])
  const add = (tipo: Msg['tipo'], texto: string) => setMsgs((p) => [...p, { id: Date.now() + Math.random() + '', tipo, texto }])

  function iniciar(tipo: 'reunion' | 'tarea') {
    setFlujo({ tipo, paso: 'nombre', datos: {} })
    add('bot', `Vamos a crear una ${tipo === 'reunion' ? 'reunión' : 'tarea'}. ¿Cuál es el nombre/título?`)
  }

  function crear(f: Flujo) {
    agregarEvento({ tipo: f.tipo, nombre: f.datos.nombre!, fecha: f.datos.fecha!, hora: f.datos.hora, duracion: f.datos.duracion || (f.tipo === 'reunion' ? 60 : 30), esPlaneada: false })
    onEventoCreado?.(new Date(f.datos.fecha! + 'T12:00:00'))
    add('bot', `✅ ${f.tipo === 'reunion' ? 'Reunión' : 'Tarea'} creada:\n📝 ${f.datos.nombre}\n📅 ${fmtFecha(f.datos.fecha!)}${f.datos.hora ? ` · ${f.datos.hora}` : ''}\n⏱️ ${f.datos.duracion || (f.tipo === 'reunion' ? 60 : 30)} min`)
    setFlujo(null)
  }

  function avanzar(f: Flujo, texto: string) {
    const datos = { ...f.datos }
    if (f.paso === 'nombre') {
      datos.nombre = texto.trim()
      const next = { ...f, datos, paso: 'fecha' as Paso }
      setFlujo(next); add('bot', '¿Para qué fecha? (hoy, mañana, lunes, 15/06 o 2026-06-15)'); return
    }
    if (f.paso === 'fecha') {
      const fecha = parseFecha(texto) || hoyISO()
      datos.fecha = fecha
      if (f.tipo === 'reunion') { const next = { ...f, datos, paso: 'hora' as Paso }; setFlujo(next); add('bot', `Fecha: ${fmtFecha(fecha)}. ¿A qué hora? (ej. 10:30 o "a las 10")`); return }
      const next = { ...f, datos, paso: 'duracion' as Paso }; setFlujo(next); add('bot', `Fecha: ${fmtFecha(fecha)}. ¿Duración en minutos? (ej. 30)`); return
    }
    if (f.paso === 'hora') {
      datos.hora = parseHora(texto) || undefined
      const next = { ...f, datos, paso: 'duracion' as Paso }; setFlujo(next); add('bot', '¿Duración en minutos? (ej. 60)'); return
    }
    if (f.paso === 'duracion') {
      datos.duracion = parseDuracion(texto) || (f.tipo === 'reunion' ? 60 : 30)
      crear({ ...f, datos }); return
    }
  }

  function responderLibre(texto: string) {
    const t = texto.toLowerCase()
    if (/(crea|crear|nueva|agenda|agendar).*(reuni)/.test(t)) { iniciar('reunion'); return }
    if (/(crea|crear|nueva|alta).*(tarea)/.test(t)) { iniciar('tarea'); return }
    if (t.includes('hoy')) {
      const list = getEventosPorFecha(hoyISO())
      add('bot', list.length ? `Hoy tienes:\n${list.map((e) => `• ${e.hora ? e.hora + ' ' : ''}${e.nombre} (${e.tipo})${e.completado ? ' ✓' : ''}`).join('\n')}` : 'No tienes nada agendado para hoy.')
      return
    }
    if (t.includes('pendiente')) {
      const list = eventos.filter((e) => !e.completado).sort((a, b) => a.fecha.localeCompare(b.fecha))
      add('bot', list.length ? `Pendientes:\n${list.slice(0, 15).map((e) => `• ${e.fecha} ${e.hora || ''} ${e.nombre} (${e.tipo})`).join('\n')}` : 'No tienes pendientes. 🎉')
      return
    }
    if (t.includes('reuni')) {
      const list = eventos.filter((e) => e.tipo === 'reunion')
      add('bot', list.length ? `Reuniones:\n${list.slice(0, 15).map((e) => `• ${e.fecha} ${e.hora || ''} ${e.nombre}`).join('\n')}` : 'No tienes reuniones agendadas.')
      return
    }
    add('bot', 'Puedo: crear tarea/reunión, "qué tengo hoy", "pendientes" o "reuniones".')
  }

  function enviar(texto: string) {
    if (!texto.trim()) return
    add('user', texto.trim()); setInput('')
    if (flujo) avanzar(flujo, texto.trim()); else responderLibre(texto.trim())
  }

  const chips = [
    { l: '✅ Crear tarea', a: () => { add('user', 'Crear tarea'); iniciar('tarea') } },
    { l: '📅 Agendar reunión', a: () => { add('user', 'Agendar reunión'); iniciar('reunion') } },
    { l: '📋 Hoy', a: () => { add('user', '¿Qué tengo hoy?'); responderLibre('hoy') } },
    { l: '🕗 Pendientes', a: () => { add('user', 'Pendientes'); responderLibre('pendientes') } },
  ]

  return (
    <div className={cn('flex flex-col h-full border-l', isHey ? 'border-white/10 bg-[#1a1f2e]' : 'border-orange-200 bg-white')}>
      <div className={cn('px-4 py-3 border-b flex items-center gap-2', isHey ? 'border-white/10' : 'border-orange-100')}>
        <Bot className={cn('w-5 h-5', isHey ? 'text-cyan-400' : 'text-orange-500')} />
        <span className={cn('font-semibold text-sm', isHey ? 'text-white' : 'text-gray-800')}>Asistente de Agenda</span>
        <span className={cn('ml-auto text-xs flex items-center gap-1', isHey ? 'text-cyan-400' : 'text-green-600')}><span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> En línea</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {msgs.map((m) => (
          <div key={m.id} className={cn('p-3 rounded-xl text-sm whitespace-pre-wrap',
            m.tipo === 'bot' ? (isHey ? 'bg-white/5 text-gray-300' : 'bg-orange-50 text-gray-600') : (isHey ? 'bg-cyan-500/20 text-cyan-100 ml-6' : 'bg-orange-100 text-gray-700 ml-6'))}>{m.texto}</div>
        ))}
        <div ref={endRef} />
      </div>

      {!flujo && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button key={c.l} onClick={c.a} className={cn('text-xs px-2.5 py-1.5 rounded-lg border', isHey ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-orange-200 text-gray-600 hover:bg-orange-50')}>{c.l}</button>
          ))}
        </div>
      )}

      <div className={cn('p-3 border-t', isHey ? 'border-white/10' : 'border-orange-100')}>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); enviar(input) } }}
            placeholder={flujo ? 'Responde aquí…' : 'Escribe una instrucción…'} className={cn('flex-1 px-3 py-2 text-sm rounded-lg border', isHey ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500' : 'bg-orange-50 border-orange-200 text-gray-800 placeholder:text-gray-400')} />
          <button onClick={() => enviar(input)} disabled={!input.trim()} className={cn('px-3 py-2 rounded-lg', input.trim() ? (isHey ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'bg-orange-500 text-white hover:bg-orange-600') : (isHey ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-400'))}><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  )
}
