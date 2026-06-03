/**
 * Lógica del Asistente de Gestión de Ofertas (local, sobre el store).
 * Extrae intención de texto libre y consulta clientes/prospectos y sus ofertas.
 * Respeta privacidad: las respuestas comerciales (ofertas/campañas) NO incluyen
 * montos/finanzas.
 */

import type { Offer, Client, Catalogs } from '@/data/ofertas-seed'
import { NUMEROS_CLIENTE } from '@/data/ciclo-seed'

export function extractRFC(t: string): string | null {
  const m = /\b([A-ZÑ&]{3,4}\d{6}[A-Z0-9]{2,3})\b/i.exec(t)
  return m ? m[1]!.toUpperCase() : null
}
export function extractNumeroCliente(t: string): string | null {
  const m = /\bCLI-?\d{4,}\b/i.exec(t)
  return m ? m[0]!.toUpperCase().replace('CLI', 'CLI-').replace('CLI--', 'CLI-') : null
}
export function extractMonto(t: string): number | null {
  const m = /(\d[\d,]*\.?\d*)/.exec(t.replace(/\$/g, ''))
  if (!m) return null
  const n = Number(m[1]!.replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Resuelve un RFC a partir de RFC directo o número de cliente. */
export function resolverRfc(texto: string, clientsByRfc: Record<string, Client>): string | null {
  const rfc = extractRFC(texto)
  if (rfc && clientsByRfc[rfc]) return rfc
  const num = extractNumeroCliente(texto)
  if (num) {
    const hit = NUMEROS_CLIENTE.find((n) => n.numeroCliente.toUpperCase() === num)
    if (hit) return hit.rfc
    const cli = Object.values(clientsByRfc).find((c) => (c.numero || '').toUpperCase() === num)
    if (cli) return cli.rfc
  }
  if (rfc) return rfc // RFC aunque no esté en clientes (prospecto)
  return null
}

export function ofertasDe(rfc: string, offers: Offer[]): Offer[] {
  return offers.filter((o) => (o.raw['RFC'] || '') === rfc)
}

/** Campañas (nombres) en las que está un cliente, a partir de sus ofertas. */
export function campanasDe(rfc: string, offers: Offer[], catalogs: Catalogs): string[] {
  const set = new Set<string>()
  ofertasDe(rfc, offers).forEach((o) => {
    const id = o.raw['ID de la campaña'] || ''
    const nombre = catalogs.campaigns[id] || o.raw['Campaña'] || id
    if (nombre) set.add(nombre)
  })
  return Array.from(set)
}

/** Resumen comercial (sin finanzas) de las ofertas de un cliente/prospecto. */
export function resumenOfertas(rfc: string, offers: Offer[]): string {
  const list = ofertasDe(rfc, offers)
  if (!list.length) return 'No tiene ofertas registradas.'
  return list.map((o) => `• ${o.producto} (${o.familia}) — ${o.tipoOferta} · etapa: ${o.etapa}`).join('\n')
}

/** Etapas permitidas según el origen de la oferta. */
export const ETAPAS_CLIENTE = ['No contactado', 'Interesado', 'Negociación', 'Descartado', 'Fabrica', 'Entregado', 'Timbrado']
export const ETAPAS_PROSPECTO = ['No contactado', 'En negociación', 'Interesado', 'Descartado', 'Convertido']

export function etapasPermitidas(tipoOferta: string): string[] {
  return tipoOferta === 'Cliente' ? ETAPAS_CLIENTE : ETAPAS_PROSPECTO
}

/** Busca una etapa válida mencionada en el texto. */
export function parseEtapa(texto: string, permitidas: string[]): string | null {
  const t = texto.toLowerCase()
  return permitidas.find((e) => t.includes(e.toLowerCase())) || null
}
