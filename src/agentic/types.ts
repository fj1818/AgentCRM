/**
 * Contrato de UI generativa entre el agente y el chat.
 *
 * Sigue el patrón "static generative UI": el frontend es dueño del catálogo de
 * componentes y el agente sólo elige cuál renderizar y con qué datos. Eso
 * mantiene el diseño consistente y evita que el agente invente interfaces.
 */

export type ActionVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'

/** Botón que el agente puede colocar en cualquier bloque. */
export interface AgentAction {
  label: string
  icon?: string
  variant?: ActionVariant
  /** Envía este texto al agente como si el usuario lo hubiera escrito. */
  send?: string
  /** Ejecuta una herramienta directamente, sin pasar por interpretación. */
  run?: { tool: string; args?: Record<string, unknown> }
  /** Sólo informativo: no hace nada al pulsarse. */
  disabled?: boolean
}

export type Tono = 'positivo' | 'negativo' | 'neutro' | 'alerta'

export interface Kpi {
  etiqueta: string
  valor: string
  delta?: string
  tono?: Tono
  icono?: string
  detalle?: string
}

export interface Columna {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  /** money y date formatean el valor; badge lo pinta como etiqueta de color. */
  format?: 'text' | 'money' | 'date' | 'badge' | 'percent' | 'dias'
  width?: string
}

export type Fila = Record<string, unknown>

/** Ficha de entidad: cliente, oferta, producto, tarea. */
export interface RecordCard {
  id: string
  titulo: string
  subtitulo?: string
  avatar?: string
  badge?: { texto: string; tono: Tono }
  campos: { label: string; value: string; icono?: string }[]
  /** Barra de progreso opcional (salud del cliente, probabilidad de cierre). */
  medidor?: { label: string; valor: number; tono?: Tono }
  nota?: string
  acciones?: AgentAction[]
}

export type TipoCampo =
  | 'text'
  | 'textarea'
  | 'number'
  | 'money'
  | 'date'
  | 'select'
  | 'segmented'
  | 'toggle'
  | 'slider'

export interface CampoFormulario {
  name: string
  label: string
  type: TipoCampo
  value?: string | number | boolean
  options?: { label: string; value: string }[]
  placeholder?: string
  hint?: string
  required?: boolean
  min?: number
  max?: number
  step?: number
  width?: 'full' | 'half'
}

export interface FormSpec {
  id: string
  titulo: string
  subtitulo?: string
  icono?: string
  campos: CampoFormulario[]
  submitLabel: string
  /** Herramienta que recibe los valores del formulario al enviarlo. */
  tool: string
  /** Argumentos fijos que se combinan con los valores capturados. */
  args?: Record<string, unknown>
}

export interface ConfirmSpec {
  titulo: string
  resumen: string
  /** Lo que va a cambiar, en lenguaje llano. Es la capa de rendición de cuentas. */
  cambios: { label: string; antes?: string; despues: string }[]
  advertencia?: string
  confirmLabel: string
  tool: string
  args?: Record<string, unknown>
}

export interface ItemChecklist {
  id: string
  texto: string
  detalle?: string
  hecho: boolean
  meta?: string
  tono?: Tono
}

export interface Flashcard {
  id: string
  categoria: string
  frente: string
  reverso: string
  tip?: string
}

export interface ItemLinea {
  id: string
  tipo: string
  titulo: string
  detalle?: string
  fecha: string
  autor?: string
}

export interface EtapaEmbudo {
  etapa: string
  cantidad: number
  monto: number
  send?: string
}

export interface SeriePunto {
  label: string
  value: number
}

/** Bloque de UI que el agente puede emitir dentro de un mensaje. */
export type Block =
  | { kind: 'kpis'; items: Kpi[] }
  | {
      kind: 'table'
      titulo?: string
      columnas: Columna[]
      filas: Fila[]
      pageSize?: number
      pie?: string
      /** Acciones por fila; {id} y {nombre} se sustituyen con la fila. */
      accionFila?: AgentAction
      acciones?: AgentAction[]
    }
  | {
      kind: 'chart'
      variante: 'bar' | 'pie' | 'line' | 'donut'
      titulo: string
      series: SeriePunto[]
      unidad?: 'money' | 'count'
      pie?: string
    }
  | { kind: 'record'; item: RecordCard }
  | { kind: 'records'; titulo?: string; items: RecordCard[]; layout?: 'grid' | 'carrusel' }
  | { kind: 'form'; form: FormSpec }
  | { kind: 'confirm'; confirm: ConfirmSpec }
  | { kind: 'choices'; titulo?: string; opciones: AgentAction[] }
  | { kind: 'checklist'; titulo: string; subtitulo?: string; items: ItemChecklist[]; acciones?: AgentAction[] }
  | { kind: 'flashcards'; titulo?: string; cards: Flashcard[] }
  | { kind: 'pipeline'; titulo?: string; etapas: EtapaEmbudo[]; total?: string }
  | { kind: 'timeline'; titulo?: string; items: ItemLinea[] }
  | {
      kind: 'compare'
      titulo?: string
      encabezados: string[]
      filas: { label: string; valores: string[]; destacar?: number }[]
      acciones?: AgentAction[]
    }
  | {
      kind: 'result'
      tono: 'success' | 'error' | 'info'
      titulo: string
      detalle?: string
      campos?: { label: string; value: string }[]
      acciones?: AgentAction[]
    }
  | { kind: 'note'; tono?: Tono; titulo?: string; texto: string }

/** Paso del plan que el agente muestra mientras trabaja. */
export interface PasoPlan {
  id: string
  label: string
  herramienta?: string
  estado: 'pendiente' | 'corriendo' | 'listo'
  detalle?: string
}

export type EstadoTurno = 'pensando' | 'listo' | 'error'

export interface Turno {
  id: string
  rol: 'usuario' | 'agente'
  texto?: string
  bloques?: Block[]
  plan?: PasoPlan[]
  estado: EstadoTurno
  ts: number
}

/** Entrada del registro de acciones ejecutadas (auditoría de la demo). */
export interface AccionRegistrada {
  id: string
  titulo: string
  detalle: string
  ts: number
}

/** Lo que devuelve una herramienta al terminar. */
export interface RespuestaHerramienta {
  texto?: string
  bloques?: Block[]
  /** Se agrega al registro de acciones si la herramienta modificó datos. */
  registro?: { titulo: string; detalle: string }
  /** Fija una entidad como contexto activo de la conversación. */
  contexto?: { tipo: 'cliente' | 'oferta'; id: string } | null
}

/** Eventos que el motor emite mientras resuelve un turno. */
export type EventoAgente =
  | { tipo: 'plan'; pasos: PasoPlan[] }
  | { tipo: 'paso'; id: string; estado: PasoPlan['estado']; detalle?: string }
  | { tipo: 'respuesta'; texto?: string; bloques?: Block[] }
  | { tipo: 'registro'; titulo: string; detalle: string }
  | { tipo: 'contexto'; valor: { tipo: 'cliente' | 'oferta'; id: string } | null }
