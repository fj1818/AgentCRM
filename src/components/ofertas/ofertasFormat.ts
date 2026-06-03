/**
 * Utilidades de formato y enmascarado para el módulo Ofertas.
 */

import type { CampoCompilado, Oferta } from '@/types/ofertas.types'

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

/** Enmascara un valor sensible dejando visibles los extremos */
export function maskValue(value: unknown): string {
  const s = String(value ?? '')
  if (s.length <= 4) return '••••'
  return `${s.slice(0, 2)}${'•'.repeat(Math.max(4, s.length - 4))}${s.slice(-2)}`
}

/** Formatea el valor de un campo según su tipo y si está enmascarado */
export function formatValue(campo: CampoCompilado, oferta: Oferta): string {
  const raw = oferta[campo.key]
  if (campo.masked) return maskValue(raw)
  if (campo.tipoDato === 'Moneda') return formatCurrency(Number(raw) || 0)
  return String(raw ?? '')
}
