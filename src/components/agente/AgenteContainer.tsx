/**
 * CRM agéntico: la aplicación completa dentro de una conversación.
 */

import { useEffect, useRef, useState } from 'react'
import { RotateCcw, Sparkles } from 'lucide-react'
import { cn } from '@/utils'
import type { AgentAction } from '@/agentic/types'
import { useAgenteStore, nombreContexto } from '@/stores/agente.store'
import { YO } from '@/agentic/data'
import { Bienvenida } from './Bienvenida'
import { Composer } from './Composer'
import { RailContexto } from './RailContexto'
import { Turno } from './Turno'
import { useTema } from './ui'

export function AgenteContainer() {
  const t = useTema()
  const { turnos, trabajando, contexto, bitacora, consumidos, enviar, ejecutar, marcarConsumido, limpiar, fijarContexto } =
    useAgenteStore()
  const [railAbierto, setRailAbierto] = useState(true)
  const finRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [turnos])

  /** Un botón puede mandar texto al agente o disparar una herramienta. */
  const manejarAccion = (a: AgentAction) => {
    if (a.run) ejecutar(a.run.tool, a.run.args ?? {}, a.label || undefined)
    else if (a.send) enviar(a.send)
  }

  const nombre = nombreContexto(contexto)

  return (
    <div className={cn('flex h-full overflow-hidden', t.hey ? 'bg-[#1a1f2e]' : 'bg-orange-50/30')}>
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className={cn('flex items-center justify-between gap-3 px-4 py-3 border-b flex-shrink-0', t.borde, t.hey ? 'bg-[#151a26]/80' : 'bg-white/90', 'backdrop-blur')}>
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border',
                t.hey ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300' : 'bg-orange-100 border-orange-200 text-orange-600'
              )}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className={cn('text-sm font-semibold leading-tight', t.texto)}>Agente CRM</h1>
              <p className={cn('text-[11px] leading-tight truncate', t.textoSuave)}>
                {trabajando ? 'Trabajando…' : `Portafolio de ${YO}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                'hidden sm:inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg border',
                trabajando
                  ? t.hey ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-300' : 'bg-orange-50 border-orange-200 text-orange-700'
                  : t.hey ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', trabajando ? 'bg-current animate-pulse' : 'bg-current')} />
              {trabajando ? 'Ejecutando' : 'Listo'}
            </span>
            {turnos.length > 0 && (
              <button
                onClick={limpiar}
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors',
                  t.hey ? 'border-white/15 text-white/60 hover:text-white hover:bg-white/10' : 'border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                )}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nueva conversación</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {turnos.length === 0 ? (
            <Bienvenida onElegir={enviar} />
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">
              {turnos.map((turno) => (
                <Turno
                  key={turno.id}
                  turno={turno}
                  consumidos={consumidos}
                  onAccion={manejarAccion}
                  onEnviarHerramienta={(tool, args, etiqueta) => ejecutar(tool, args, etiqueta)}
                  onConsumir={marcarConsumido}
                />
              ))}
              <div ref={finRef} className="h-2" />
            </div>
          )}
        </div>

        <Composer
          onEnviar={enviar}
          trabajando={trabajando}
          contexto={nombre}
          onLimpiarContexto={() => fijarContexto(null)}
        />
      </div>

      <RailContexto
        abierto={railAbierto}
        onToggle={() => setRailAbierto((v) => !v)}
        contexto={nombre}
        tipoContexto={contexto?.tipo}
        bitacora={bitacora}
        onEnviar={enviar}
      />
    </div>
  )
}
