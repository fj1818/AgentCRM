/**
 * Catálogo de componentes: traduce un bloque emitido por el agente al
 * componente de React correspondiente.
 *
 * Es el punto único donde se decide qué puede dibujar el agente. Si un bloque
 * no está aquí, no se renderiza — el agente no puede inventar interfaz.
 */

import type { AgentAction, Block } from '@/agentic/types'
import { BloqueComparativo, BloqueEmbudo, BloqueGrafica, BloqueKpis, BloqueTabla } from './BloquesDatos'
import { BloqueFicha, BloqueFichas, BloqueLinea, BloqueNota } from './BloquesFicha'
import {
  BloqueChecklist,
  BloqueConfirmar,
  BloqueFlashcards,
  BloqueFormulario,
  BloqueOpciones,
  BloqueResultado,
} from './BloquesAccion'

interface Props {
  bloque: Block
  /** Identificador estable del bloque dentro del turno. */
  clave: string
  consumido?: string
  onAccion: (a: AgentAction) => void
  onEnviarHerramienta: (tool: string, args: Record<string, unknown>, etiqueta: string) => void
  onConsumir: (clave: string, resultado: string) => void
}

export function Renderizador({ bloque, clave, consumido, onAccion, onEnviarHerramienta, onConsumir }: Props) {
  switch (bloque.kind) {
    case 'kpis':
      return <BloqueKpis bloque={bloque} />
    case 'table':
      return <BloqueTabla bloque={bloque} onAccion={onAccion} />
    case 'chart':
      return <BloqueGrafica bloque={bloque} />
    case 'pipeline':
      return <BloqueEmbudo bloque={bloque} onAccion={onAccion} />
    case 'compare':
      return <BloqueComparativo bloque={bloque} onAccion={onAccion} />
    case 'record':
      return <BloqueFicha bloque={bloque} onAccion={onAccion} />
    case 'records':
      return <BloqueFichas bloque={bloque} onAccion={onAccion} />
    case 'timeline':
      return <BloqueLinea bloque={bloque} />
    case 'note':
      return <BloqueNota bloque={bloque} />
    case 'form':
      return (
        <BloqueFormulario
          bloque={bloque}
          clave={clave}
          consumido={consumido}
          onConsumir={onConsumir}
          onEnviar={onEnviarHerramienta}
        />
      )
    case 'confirm':
      return (
        <BloqueConfirmar
          bloque={bloque}
          clave={clave}
          consumido={consumido}
          onConsumir={onConsumir}
          onEnviar={onEnviarHerramienta}
        />
      )
    case 'choices':
      return <BloqueOpciones bloque={bloque} onAccion={onAccion} />
    case 'checklist':
      return <BloqueChecklist bloque={bloque} onAccion={onAccion} />
    case 'result':
      return <BloqueResultado bloque={bloque} onAccion={onAccion} />
    case 'flashcards':
      return <BloqueFlashcards bloque={bloque} />
    default:
      return null
  }
}
