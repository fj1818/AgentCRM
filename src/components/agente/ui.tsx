/**
 * Primitivas visuales compartidas por los bloques de UI generativa.
 *
 * Todos los bloques se pintan sobre las mismas superficies y tonos para que el
 * chat se sienta como un producto y no como una colección de widgets sueltos.
 */

import type { ReactNode } from 'react'
import {
  AlertTriangle, ArrowRight, Book, Briefcase, Building2, Calendar, Check,
  Clock, Edit3, FileText, Flame, Hash, History, Info, Mail, Megaphone, Package, Pause,
  Percent, Phone, PieChart, Plus, Search, Shield, Sparkles, Target, TrendingUp, Trophy,
  User, Wallet, X,
} from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import type { ActionVariant, AgentAction, Tono } from '@/agentic/types'

// ── Iconos ───────────────────────────────────────────────────────────────────
const ICONOS: Record<string, typeof User> = {
  alert: AlertTriangle, arrowRight: ArrowRight, book: Book, briefcase: Briefcase,
  building: Building2, calendar: Calendar, chart: PieChart, check: Check, clock: Clock,
  edit: Edit3, file: FileText, flame: Flame, hash: Hash, history: History, info: Info,
  mail: Mail, megaphone: Megaphone, package: Package, pause: Pause, percent: Percent,
  phone: Phone, plus: Plus, search: Search, shield: Shield, sparkles: Sparkles,
  target: Target, trending: TrendingUp, trophy: Trophy, user: User, wallet: Wallet, x: X,
}

export function Icono({ nombre, className }: { nombre?: string; className?: string }) {
  const C = (nombre && ICONOS[nombre]) || Sparkles
  return <C className={className ?? 'w-4 h-4'} />
}

// ── Tema ─────────────────────────────────────────────────────────────────────
export function useTema() {
  const theme = useUIStore((s) => s.theme)
  const hey = theme === 'hey'
  return {
    hey,
    /** Superficie de tarjeta. */
    card: hey ? 'bg-white/[0.04] border-white/10' : 'bg-white border-slate-200/80',
    cardHover: hey ? 'hover:bg-white/[0.07] hover:border-white/20' : 'hover:border-orange-300 hover:shadow-md',
    /** Superficie hundida (encabezados de tabla, chips). */
    sunken: hey ? 'bg-white/[0.03]' : 'bg-slate-50',
    texto: hey ? 'text-white' : 'text-slate-900',
    textoSuave: hey ? 'text-white/60' : 'text-slate-500',
    textoMedio: hey ? 'text-white/80' : 'text-slate-700',
    borde: hey ? 'border-white/10' : 'border-slate-200',
    acento: hey ? 'text-cyan-400' : 'text-orange-600',
    acentoBg: hey ? 'bg-cyan-500' : 'bg-orange-500',
    anillo: hey ? 'focus:ring-cyan-500/40' : 'focus:ring-orange-400/40',
    input: hey
      ? 'bg-white/[0.04] border-white/15 text-white placeholder:text-white/30'
      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',
  }
}

// ── Tonos semánticos ─────────────────────────────────────────────────────────
export function clasesTono(tono: Tono | undefined, hey: boolean): string {
  switch (tono) {
    case 'positivo':
      return hey ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'negativo':
      return hey ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
    case 'alerta':
      return hey ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
    default:
      return hey ? 'bg-white/[0.06] text-white/70 border-white/15' : 'bg-slate-100 text-slate-600 border-slate-200'
  }
}

export function barraTono(tono: Tono | undefined, hey: boolean): string {
  switch (tono) {
    case 'positivo':
      return 'bg-emerald-500'
    case 'negativo':
      return 'bg-rose-500'
    case 'alerta':
      return 'bg-amber-500'
    default:
      return hey ? 'bg-cyan-500' : 'bg-orange-500'
  }
}

export function Badge({ children, tono }: { children: ReactNode; tono?: Tono }) {
  const { hey } = useTema()
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium whitespace-nowrap', clasesTono(tono, hey))}>
      {children}
    </span>
  )
}

/** Deduce el tono de un texto de etapa o riesgo, para pintar tablas. */
export function tonoDeValor(v: string): Tono {
  const s = v.toLowerCase()
  if (['ganada', 'bajo', 'hecha', 'entregado'].includes(s)) return 'positivo'
  if (['perdida', 'alto', 'descartado'].includes(s)) return 'negativo'
  if (['negociación', 'negociacion', 'medio', 'propuesta'].includes(s)) return 'alerta'
  return 'neutro'
}

// ── Botón de acción ──────────────────────────────────────────────────────────
export function botonClases(variant: ActionVariant | undefined, hey: boolean): string {
  const base =
    'inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus:ring-2'
  switch (variant) {
    case 'primary':
      return cn(base, hey
        ? 'bg-cyan-500 text-slate-900 hover:bg-cyan-400 focus:ring-cyan-500/40 shadow-sm shadow-cyan-500/20'
        : 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-400/40 shadow-sm shadow-orange-500/20')
    case 'danger':
      return cn(base, hey
        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 focus:ring-rose-500/40'
        : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 focus:ring-rose-400/40')
    case 'success':
      return cn(base, 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-400/40')
    case 'ghost':
      return cn(base, hey
        ? 'text-white/70 hover:text-white hover:bg-white/10 focus:ring-white/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300')
    default:
      return cn(base, hey
        ? 'bg-white/[0.06] text-white/90 border border-white/15 hover:bg-white/10 focus:ring-white/20'
        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-300')
  }
}

interface BotonAccionProps {
  accion: AgentAction
  onAccion: (a: AgentAction) => void
  className?: string
  disabled?: boolean
}

export function BotonAccion({ accion, onAccion, className, disabled }: BotonAccionProps) {
  const { hey } = useTema()
  return (
    <button
      type="button"
      disabled={disabled || accion.disabled}
      onClick={() => onAccion(accion)}
      className={cn(botonClases(accion.variant, hey), className)}
    >
      {accion.icon && <Icono nombre={accion.icon} className="w-4 h-4 flex-shrink-0" />}
      <span className="truncate">{accion.label}</span>
    </button>
  )
}

// ── Contenedor de bloque ─────────────────────────────────────────────────────
export function Panel({
  children,
  titulo,
  subtitulo,
  icono,
  acciones,
  className,
  padding = true,
}: {
  children: ReactNode
  titulo?: string
  subtitulo?: string
  icono?: string
  acciones?: ReactNode
  className?: string
  padding?: boolean
}) {
  const t = useTema()
  return (
    <section className={cn('rounded-2xl border overflow-hidden animate-fade-in', t.card, className)}>
      {(titulo || acciones) && (
        <header className={cn('flex items-start justify-between gap-3 px-4 py-3 border-b', t.borde, t.sunken)}>
          <div className="min-w-0 flex items-start gap-2.5">
            {icono && (
              <span className={cn('mt-0.5 flex-shrink-0', t.acento)}>
                <Icono nombre={icono} className="w-4 h-4" />
              </span>
            )}
            <div className="min-w-0">
              {titulo && <h3 className={cn('text-sm font-semibold leading-snug', t.texto)}>{titulo}</h3>}
              {subtitulo && <p className={cn('text-xs mt-0.5 leading-snug', t.textoSuave)}>{subtitulo}</p>}
            </div>
          </div>
          {acciones && <div className="flex items-center gap-1.5 flex-shrink-0">{acciones}</div>}
        </header>
      )}
      <div className={padding ? 'p-4' : undefined}>{children}</div>
    </section>
  )
}

/** Iniciales para avatares de cliente. */
export function iniciales(nombre: string): string {
  return nombre
    .replace(/S\.A\.|S\. de R\.L\.|de C\.V\.|S\.A\.P\.I\./gi, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function Avatar({ nombre, size = 'md' }: { nombre: string; size?: 'sm' | 'md' | 'lg' }) {
  const { hey } = useTema()
  const dim = size === 'sm' ? 'w-8 h-8 text-[11px]' : size === 'lg' ? 'w-12 h-12 text-sm' : 'w-10 h-10 text-xs'
  return (
    <div
      className={cn(
        'rounded-xl flex items-center justify-center font-bold flex-shrink-0 border',
        dim,
        hey ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' : 'bg-orange-100 text-orange-700 border-orange-200'
      )}
    >
      {iniciales(nombre)}
    </div>
  )
}
