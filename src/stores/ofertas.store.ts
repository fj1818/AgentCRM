/**
 * Store del módulo Ofertas. Carga el seed del prototipo y replica las acciones
 * de los servicios AppScript (updateOffer, addComment, createClientOffer,
 * createProspectOffer, reassignOffers, searchClients).
 */

import { create } from 'zustand'
import {
  buildOffers, buildClients, buildUsers, buildComments, buildCatalogs,
  type Offer, type Client, type User, type Comment, type Catalogs,
} from '@/data/ofertas-seed'

const CLOSE_RESULT: Record<string, string> = { Timbrado: 'Ganado', Descartado: 'Perdido' }

function todayDmy(): string {
  const d = new Date(); const p = (n: number) => (n < 10 ? '0' + n : '' + n)
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}
function pad(n: number, w: number): string { let s = String(n); while (s.length < w) s = '0' + s; return s }
function nextSeqId(offers: Offer[], col: string, prefix: string, width: number): string {
  const re = new RegExp('^' + prefix + '(\\d+)$')
  let max = 0
  for (const o of offers) { const m = re.exec(String(o.raw[col] || '').trim()); if (m) max = Math.max(max, parseInt(m[1]!, 10)) }
  return prefix + pad(max + 1, width)
}

interface OfertasState {
  offers: Offer[]
  comments: Comment[]
  clientsByRfc: Record<string, Client>
  users: User[]
  catalogs: Catalogs
  promoterNames: Record<string, string>

  updateOffer: (idOferta: string, changes: Record<string, string>) => { ok: boolean; error?: string }
  addComment: (p: { idOferta: string; rfc: string; comentario: string }) => void
  createClientOffer: (p: { rfc: string; idFamilia: string }) => void
  createProspectOffer: (p: { nombre: string; tipoPersona: string; rfc: string; correo: string; telefono: string; idFamilia: string }) => void
  reassignOffers: (ids: string[], idPromotor: string) => void
  searchClients: (q: string) => Client[]
}

function buildPromoterNames(offers: Offer[], users: User[]): Record<string, string> {
  const m: Record<string, string> = {}
  users.forEach((u) => { if (u.idPromotor) m[u.idPromotor] = u.nombre })
  offers.forEach((o) => { const id = o.raw['ID del promotor']; if (id) m[id] = o.ejecutivo })
  return m
}

const seedOffers = buildOffers()
const seedUsers = buildUsers()

export const useOfertasStore = create<OfertasState>((set, get) => ({
  offers: seedOffers,
  comments: buildComments(),
  clientsByRfc: buildClients(),
  users: seedUsers,
  catalogs: buildCatalogs(),
  promoterNames: buildPromoterNames(seedOffers, seedUsers),

  updateOffer: (idOferta, changes) => {
    const { offers, catalogs, promoterNames } = get()
    const idx = offers.findIndex((o) => (o.raw['ID de la oferta'] || '') === idOferta)
    if (idx === -1) return { ok: false, error: 'No se encontró la oferta.' }

    // Validación motivo de descarte (≥20 si viene con texto)
    if (changes['Motivo de descarte'] !== undefined) {
      const mv = String(changes['Motivo de descarte']).trim()
      if (mv && mv.length < 20) return { ok: false, error: 'El motivo de descarte debe tener al menos 20 caracteres.' }
    }

    const offer = offers[idx]!
    const raw = { ...offer.raw }
    const hoy = todayDmy()

    // Cierre por etapa (RN-160)
    if (changes['Etapa'] !== undefined) {
      const resultado = CLOSE_RESULT[String(changes['Etapa']).trim()] || ''
      if (resultado === 'Ganado' && !String(raw['Fecha de ganado'] || '').trim()) raw['Fecha de ganado'] = hoy
      if (resultado === 'Perdido') {
        const motivoFinal = changes['Motivo de descarte'] !== undefined
          ? String(changes['Motivo de descarte']).trim()
          : String(raw['Motivo de descarte'] || '').trim()
        if (motivoFinal.length < 20) return { ok: false, error: 'Para descartar, el Motivo de descarte debe tener al menos 20 caracteres.' }
        if (!String(raw['Fecha de descarte'] || '').trim()) raw['Fecha de descarte'] = hoy
      }
    }

    // Aplicar cambios directos
    Object.keys(changes).forEach((c) => { raw[c] = changes[c]! })

    // Sincronizar columnas-nombre
    if (changes['ID de la familia de producto'] !== undefined) {
      raw['Familia de producto'] = catalogs.families[changes['ID de la familia de producto']!] || raw['Familia de producto'] || ''
    }
    if (changes['Id del producto'] !== undefined) {
      raw['Producto'] = catalogs.products[changes['Id del producto']!] || ''
    }
    if (changes['ID del promotor'] !== undefined) {
      raw['Ejecutivo'] = promoterNames[changes['ID del promotor']!] || raw['Ejecutivo'] || ''
    }

    const updated: Offer = {
      ...offer,
      raw,
      ejecutivo: raw['Ejecutivo'] || offer.ejecutivo,
      familia: raw['Familia de producto'] || offer.familia,
      producto: raw['Producto'] || offer.producto,
      etapa: raw['Etapa'] || offer.etapa,
      monto: changes['Monto de la oferta'] !== undefined ? Number(changes['Monto de la oferta']) || 0 : offer.monto,
      fechaCierre: raw['Fecha de cierre'] || offer.fechaCierre,
    }
    const next = offers.slice(); next[idx] = updated
    set({ offers: next })
    return { ok: true }
  },

  addComment: ({ idOferta, rfc, comentario }) => {
    const { offers, comments } = get()
    const id = 'CMT' + pad(comments.length + 1, 6)
    const nuevo: Comment = { id, rfc, idOferta, idUsuario: 'Usuario', comentario, fecha: todayDmy() }
    set({ comments: [...comments, nuevo] })
    void offers
  },

  createClientOffer: ({ rfc, idFamilia }) => {
    const { offers, clientsByRfc, catalogs } = get()
    const cli = clientsByRfc[rfc]
    const offerId = nextSeqId(offers, 'ID de la oferta', 'OFR', 6)
    const hoy = todayDmy()
    const raw: Record<string, string> = {
      'Ejecutivo': 'Usuario', 'Tipo de oferta': 'Cliente', 'Tipo de persona': cli?.tipoPersona || '',
      'Familia de producto': catalogs.families[idFamilia] || '', 'Producto': '', 'Etapa': 'Identificación',
      'Monto de la oferta': '0', 'Fecha de cierre': hoy, 'RFC': rfc, 'ID de la oferta': offerId,
      'Fecha de creación': hoy, 'SubEtapa': 'Prospección inicial', 'Origen de la oferta': 'Nueva oferta',
      'ID de la familia de producto': idFamilia, 'Descripción de la oferta': '<p>Oferta creada desde Nueva oferta.</p>',
    }
    const nuevo: Offer = { ejecutivo: 'Usuario', tipoOferta: 'Cliente', tipoPersona: cli?.tipoPersona || '', familia: raw['Familia de producto']!, producto: '', etapa: 'Identificación', monto: 0, fechaCierre: hoy, raw }
    set({ offers: [nuevo, ...offers] })
  },

  createProspectOffer: (p) => {
    const { offers, catalogs, clientsByRfc } = get()
    const offerId = nextSeqId(offers, 'ID de la oferta', 'OFR', 6)
    const pofId = nextSeqId(offers, 'ID de la oferta del prospecto', 'POF', 6)
    const hoy = todayDmy()
    const raw: Record<string, string> = {
      'Ejecutivo': 'Usuario', 'Tipo de oferta': 'Prospecto', 'Tipo de persona': p.tipoPersona,
      'Familia de producto': catalogs.families[p.idFamilia] || '', 'Producto': '', 'Etapa': 'Identificación',
      'Monto de la oferta': '0', 'Fecha de cierre': hoy, 'RFC': p.rfc, 'ID de la oferta': offerId,
      'Fecha de creación': hoy, 'ID de la oferta del prospecto': pofId, 'SubEtapa': 'Prospección inicial',
      'Origen de la oferta': 'Nueva oferta', 'ID de la familia de producto': p.idFamilia,
      'Descripción de la oferta': '<p>Oferta creada desde Nueva oferta.</p>',
    }
    const nuevo: Offer = { ejecutivo: 'Usuario', tipoOferta: 'Prospecto', tipoPersona: p.tipoPersona, familia: raw['Familia de producto']!, producto: '', etapa: 'Identificación', monto: 0, fechaCierre: hoy, raw }
    // Registrar contacto mínimo del prospecto para Info del cliente
    const nuevosClientes = { ...clientsByRfc }
    if (!nuevosClientes[p.rfc]) {
      nuevosClientes[p.rfc] = { numero: '', nombre: p.nombre, rfc: p.rfc, telefonos: p.telefono, correo: p.correo, direccion: '', tipoPersona: p.tipoPersona }
    }
    set({ offers: [nuevo, ...offers], clientsByRfc: nuevosClientes })
  },

  reassignOffers: (ids, idPromotor) => {
    const { offers, promoterNames } = get()
    const nombre = promoterNames[idPromotor] || ''
    const idset = new Set(ids)
    const next = offers.map((o) => {
      const oid = o.raw['ID de la oferta'] || ''
      if (!idset.has(oid)) return o
      const raw = { ...o.raw, 'ID del promotor': idPromotor }
      if (nombre) raw['Ejecutivo'] = nombre
      return { ...o, raw, ejecutivo: nombre || o.ejecutivo }
    })
    set({ offers: next })
  },

  searchClients: (q) => {
    const query = q.trim().toLowerCase()
    if (!query) return []
    const { clientsByRfc } = get()
    const out: Client[] = []
    for (const c of Object.values(clientsByRfc)) {
      if ((c.rfc + ' ' + c.nombre).toLowerCase().includes(query)) out.push(c)
      if (out.length >= 25) break
    }
    return out
  },
}))
