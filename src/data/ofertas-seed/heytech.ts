/**
 * Seed conceptual de Hey Tech — equipo de venta de infraestructura y tecnología.
 * Reconfigura los catálogos del módulo Ofertas con los valores de Hey Tech y
 * provee una oferta de ejemplo (Fintech Latam) para mostrar el layout adaptado:
 * nomenclatura propia, campos bancarios ocultos e info de cliente sin datos
 * sensibles. Fuente: contexto_demo_heytech / alcance-heytech-mvp.
 */

import type { Catalogs, Client, Offer, ProductRef } from './index'

export const HEYTECH_ROUTE = 'hey'

// ── Catálogos Hey Tech ───────────────────────────────────────────────────────
const FAMILIAS = [
  'Asistente Virtual Voz', 'Asistente Virtual Texto', 'Cobranza por WhatsApp',
  'Cobranza Inteligente Voz', 'Análisis Documental', 'Plan IA Completo',
  'No definido', 'Hey X', 'Hey SaaS App/web', 'Bio Hey',
]
const PLANES = [
  'Plan IA Base', 'Plan IA Optimizado', 'Plan IA Integral',
  'Plan IA Corporativo', 'Sin plan definido',
]
const ETAPAS = [
  'Alineando Agendas', '1ra Sesión Comercial', 'Sesión Técnica',
  'Elaboración de Propuesta', 'En revisión de propuesta', 'En NDA',
  'En Negociación', 'Elaboración de contrato', 'En firma de contrato',
]
const ESTATUS = [
  'Prospectos', 'Interesado', 'Lead que avanza', 'En Propuesta',
  'Proceso de Contrato', 'Detenido', 'Retomar más adelante',
  'en Pausa momentanea', 'No interesado', 'No es Fit', 'Ganados',
]
const FUENTES = ['Referido', 'LinkedIn', 'Web', 'Evento', 'Outbound', 'Inbound', 'Alianza', 'Otro']

export const HEY_PAISES = [
  'México', 'Colombia', 'Chile', 'Argentina', 'Guatemala', 'El Salvador',
  'Costa Rica', 'Ecuador', 'Bolivia', 'Perú', 'Honduras', 'Panamá',
  'Venezuela', 'España', 'USA', 'Otro',
]
export const HEY_GIROS = [
  'Fintech', 'Banca', 'Cooperativa', 'Cobranza', 'Seguros', 'Retail',
  'Tecnología', 'Finanzas', 'Crédito', 'Telecomunicaciones', 'Gobierno',
  'Salud', 'Educación', 'Otro',
]

function buildHeyCatalogs(): Catalogs {
  const families: Record<string, string> = {}
  const familyRoute: Record<string, string> = {}
  FAMILIAS.forEach((nombre, i) => { const id = 'HFAM' + (i + 1); families[id] = nombre; familyRoute[id] = HEYTECH_ROUTE })

  const products: Record<string, string> = {}
  const planRefs: ProductRef[] = []
  PLANES.forEach((nombre, i) => { const id = 'HPLN' + (i + 1); products[id] = nombre; planRefs.push({ id, nombre }) })

  // Todos los planes están disponibles para cualquier producto (familia).
  const productsByFamily: Record<string, ProductRef[]> = {}
  Object.keys(families).forEach((fid) => { productsByFamily[fid] = planRefs })

  const stagesByRoute = { [HEYTECH_ROUTE]: ETAPAS.map((nombre) => ({ nombre, esCierre: false, resultado: '' })) }

  const subStagesByRoute: Record<string, Record<string, string[]>> = { [HEYTECH_ROUTE]: {} }
  ETAPAS.forEach((et) => { subStagesByRoute[HEYTECH_ROUTE]![et] = ESTATUS })

  return {
    families, products, campaigns: {}, productsByFamily,
    origins: FUENTES, familyRoute, stagesByRoute, subStagesByRoute,
  }
}

export const heyCatalogs: Catalogs = buildHeyCatalogs()

// ── Cliente y oferta de ejemplo (Fintech Latam) ──────────────────────────────
export const HEYTECH_OFFER_ID = 'HEY000001'
const HEYTECH_RFC = 'FINTECHLATAM01'

export const heyTechClient: Client = {
  numero: 'CLI-HEY-001',
  nombre: 'Fintech Latam S.A.',
  rfc: HEYTECH_RFC,
  telefonos: '+57 300 555 0142',
  correo: 'contacto@fintechlatam.co',
  direccion: 'Carrera 7 #71-21, Bogotá, Colombia',
  tipoPersona: 'PM',
  pais: 'Colombia',
  giro: 'Fintech',
}

export const heyTechOffer: Offer = {
  ejecutivo: 'Carlos Mendoza',
  tipoOferta: 'Prospecto',
  tipoPersona: 'PM',
  familia: 'Asistente Virtual Texto',
  producto: 'Plan IA Optimizado',
  etapa: 'En revisión de propuesta',
  monto: 5500,
  fechaCierre: '',
  raw: {
    'Ejecutivo': 'Carlos Mendoza',
    'Tipo de oferta': 'Prospecto',
    'Tipo de persona': 'PM',
    'Familia de producto': 'Asistente Virtual Texto',
    'ID de la familia de producto': 'HFAM2',
    'Producto': 'Plan IA Optimizado',
    'Id del producto': 'HPLN2',
    'Etapa': 'En revisión de propuesta',
    'SubEtapa': 'En Propuesta',
    'Origen de la oferta': 'LinkedIn',
    'Monto de la oferta': '5500',
    'Plazo de la oferta': '3',
    'Folio': 'HEY-2026-00001',
    'Fecha de vencimiento': '15/07/2026',
    'RFC': HEYTECH_RFC,
    'ID de la oferta': HEYTECH_OFFER_ID,
    'ID de la oferta del prospecto': 'POFHEY0001',
    'Fecha de creación': '10/06/2026',
    'ID del promotor': 'PRM-HEY-01',
    'Descripción de la oferta': '<p>Implementación de <b>Asistente Virtual de Texto</b> para atención y calificación de leads de Fintech Latam. Plan IA Optimizado con integración a su canal de WhatsApp.</p>',
  },
}
