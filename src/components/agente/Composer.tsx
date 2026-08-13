/**
 * Barra de entrada del chat.
 *
 * Soporta dos velocidades: escribir en lenguaje natural, o teclear "/" para
 * disparar comandos conocidos sin pensar en cómo redactarlos.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ArrowUp, Command, Loader2, Square } from 'lucide-react'
import { cn } from '@/utils'
import { COMANDOS } from '@/agentic/sugerencias'
import { useTema } from './ui'

interface Props {
  onEnviar: (texto: string) => void
  trabajando: boolean
  contexto?: string | null
  onLimpiarContexto?: () => void
}

export function Composer({ onEnviar, trabajando, contexto, onLimpiarContexto }: Props) {
  const t = useTema()
  const [texto, setTexto] = useState('')
  const [resaltado, setResaltado] = useState(0)
  const ref = useRef<HTMLTextAreaElement>(null)

  const mostrandoComandos = texto.startsWith('/')
  const coincidencias = useMemo(() => {
    if (!mostrandoComandos) return []
    const q = texto.slice(1).toLowerCase()
    return COMANDOS.filter((c) => c.comando.slice(1).startsWith(q))
  }, [texto, mostrandoComandos])

  useEffect(() => setResaltado(0), [texto])

  // Autoajuste de altura, hasta un máximo razonable.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [texto])

  const enviar = (valor?: string) => {
    const v = (valor ?? texto).trim()
    if (!v || trabajando) return
    onEnviar(v)
    setTexto('')
  }

  const teclado = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (coincidencias.length) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setResaltado((i) => (i + 1) % coincidencias.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setResaltado((i) => (i - 1 + coincidencias.length) % coincidencias.length)
        return
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault()
        const c = coincidencias[resaltado]!
        if (c.prompt.endsWith(' ')) setTexto(c.prompt)
        else enviar(c.prompt)
        return
      }
      if (e.key === 'Escape') {
        setTexto('')
        return
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  return (
    <div className={cn('border-t px-4 py-3', t.borde, t.hey ? 'bg-[#151a26]/80' : 'bg-white/90', 'backdrop-blur')}>
      <div className="max-w-4xl mx-auto">
        {contexto && (
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('text-[11px]', t.textoSuave)}>Contexto activo:</span>
            <button
              onClick={onLimpiarContexto}
              className={cn(
                'inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg border transition-colors',
                t.hey ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/20' : 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
              )}
              title="Quitar contexto"
            >
              {contexto}
              <span className="opacity-60">×</span>
            </button>
          </div>
        )}

        {coincidencias.length > 0 && (
          <div className={cn('mb-2 rounded-xl border overflow-hidden animate-fade-in', t.card)}>
            {coincidencias.map((c, i) => (
              <button
                key={c.comando}
                onMouseEnter={() => setResaltado(i)}
                onClick={() => (c.prompt.endsWith(' ') ? setTexto(c.prompt) : enviar(c.prompt))}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                  i === resaltado && (t.hey ? 'bg-white/[0.07]' : 'bg-orange-50')
                )}
              >
                <code className={cn('text-xs font-mono font-semibold w-24 flex-shrink-0', t.acento)}>{c.comando}</code>
                <span className={cn('text-[13px] truncate', t.textoMedio)}>{c.descripcion}</span>
              </button>
            ))}
          </div>
        )}

        <div
          className={cn(
            'flex items-end gap-2 rounded-2xl border px-3 py-2 transition-shadow focus-within:ring-2',
            t.hey ? 'bg-white/[0.04] border-white/15' : 'bg-white border-slate-300 shadow-sm',
            t.anillo
          )}
        >
          <textarea
            ref={ref}
            rows={1}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={teclado}
            placeholder="Pregunta, pide una acción o escribe / para ver comandos…"
            className={cn(
              'flex-1 bg-transparent resize-none outline-none text-[14px] leading-relaxed py-1.5 max-h-40',
              t.hey ? 'text-white placeholder:text-white/35' : 'text-slate-900 placeholder:text-slate-400'
            )}
          />
          <button
            onClick={() => enviar()}
            disabled={!texto.trim() || trabajando}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30 active:scale-95',
              t.acentoBg,
              t.hey ? 'text-slate-900' : 'text-white'
            )}
            title="Enviar"
          >
            {trabajando ? <Loader2 className="w-4 h-4 animate-spin" /> : texto.trim() ? <ArrowUp className="w-4 h-4" /> : <Square className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className={cn('text-[11px] mt-1.5 flex items-center gap-1.5', t.textoSuave)}>
          <Command className="w-3 h-3" />
          Enter para enviar · Shift+Enter para salto de línea · / para comandos
        </p>
      </div>
    </div>
  )
}
