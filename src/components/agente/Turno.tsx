/**
 * Un turno de la conversación.
 *
 * El turno del agente muestra primero el plan (qué está haciendo y con qué
 * herramienta) y después el texto y los bloques. Ver el plan es lo que hace que
 * el usuario confíe en lo que el agente devuelve.
 */

import ReactMarkdown from 'react-markdown'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/utils'
import type { AgentAction, Turno as TurnoTipo } from '@/agentic/types'
import { Renderizador } from './bloques/Renderizador'
import { useTema } from './ui'

interface Props {
  turno: TurnoTipo
  consumidos: Record<string, string>
  onAccion: (a: AgentAction) => void
  onEnviarHerramienta: (tool: string, args: Record<string, unknown>, etiqueta: string) => void
  onConsumir: (clave: string, resultado: string) => void
}

export function Turno({ turno, consumidos, onAccion, onEnviarHerramienta, onConsumir }: Props) {
  const t = useTema()

  if (turno.rol === 'usuario') {
    return (
      <div className="flex justify-end animate-slide-up">
        <div
          className={cn(
            'max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-tr-md px-4 py-2.5 text-[14px] leading-relaxed',
            t.hey ? 'bg-cyan-500 text-slate-900 font-medium' : 'bg-orange-500 text-white'
          )}
        >
          {turno.texto}
        </div>
      </div>
    )
  }

  const pensando = turno.estado === 'pensando'
  const plan = turno.plan ?? []
  const planTerminado = plan.length > 0 && plan.every((p) => p.estado === 'listo')

  return (
    <div className="flex gap-3 animate-slide-up">
      <div
        className={cn(
          'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border mt-0.5',
          t.hey ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300' : 'bg-orange-100 border-orange-200 text-orange-600'
        )}
      >
        <Sparkles className={cn('w-4 h-4', pensando && 'animate-pulse-soft')} />
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        {plan.length > 0 && (
          <div
            className={cn(
              'rounded-xl border px-3 py-2 space-y-1 transition-opacity duration-500',
              t.card,
              planTerminado && !pensando && 'opacity-55'
            )}
          >
            {plan.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-xs">
                {p.estado === 'listo' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                ) : p.estado === 'corriendo' ? (
                  <Loader2 className={cn('w-3.5 h-3.5 animate-spin flex-shrink-0', t.acento)} />
                ) : (
                  <span className={cn('w-3.5 h-3.5 rounded-full border flex-shrink-0', t.borde)} />
                )}
                <span className={cn(p.estado === 'pendiente' ? 'opacity-45' : '', t.textoSuave)}>{p.label}</span>
                {p.herramienta && (
                  <code
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded font-mono',
                      t.hey ? 'bg-white/[0.06] text-white/50' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {p.herramienta}
                  </code>
                )}
              </div>
            ))}
          </div>
        )}

        {turno.texto && (
          <div
            className={cn(
              'text-[14px] leading-relaxed',
              t.textoMedio,
              '[&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold',
              t.hey ? '[&_strong]:text-white' : '[&_strong]:text-slate-900',
              '[&_code]:text-[13px] [&_code]:font-mono [&_ul]:space-y-1 [&_li]:ml-4 [&_li]:list-disc'
            )}
          >
            <ReactMarkdown>{turno.texto}</ReactMarkdown>
          </div>
        )}

        {turno.bloques?.map((b, i) => {
          const clave = `${turno.id}-${i}`
          return (
            <Renderizador
              key={clave}
              clave={clave}
              bloque={b}
              consumido={consumidos[clave]}
              onAccion={onAccion}
              onEnviarHerramienta={onEnviarHerramienta}
              onConsumir={onConsumir}
            />
          )
        })}
      </div>
    </div>
  )
}
