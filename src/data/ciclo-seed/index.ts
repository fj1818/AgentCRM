/**
 * Seed del Ciclo de vida (vista 360°) — TABLAS NORMALIZADAS.
 *
 * Genera datos simulados DETERMINISTAS por RFC y los expone como tablas planas
 * con llaves foráneas (cruzas), más un accesor que ensambla la vista 360°.
 *
 * Llaves:
 *   personas.rfc  (PK)        ← entidad unificada cliente/prospecto
 *   numeros_cliente.rfc (FK)
 *   contratos.id_contrato (PK), contratos.rfc (FK)
 *   variaciones.id_contrato (FK), timbrado.id_contrato (FK)
 *   tpv.id_contrato (FK), demás tablas.rfc (FK)
 *   ofertas.RFC (FK)  ← vive en ofertas-seed
 *
 * Reglas confirmadas:
 *   - TDC: timbrado = cualquier disposición/movimiento.
 *   - Por vencer ≤ 30 días. Mora: Al corriente · 1-29 · 30-59 · 60-89 · 90+.
 *   - NBA: familia que el cliente no tiene (prioridad).
 *   - Ingresos no financieros = cobros por servicios (no por intereses).
 *   - NPS: 0-10 → Detractor (0-6) · Pasivo (7-8) · Promotor (9-10).
 *   - Un prospecto NO tiene productos contratados (sin contratos/variaciones/
 *     timbrado/TPV/ingresos NF/números de cliente).
 */

import { buildClients, buildOffers, buildCatalogs, type Client } from '@/data/ofertas-seed'

// ── PRNG determinista ───────────────────────────────────────────────────────
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
type RNG = () => number
const pick = <T>(r: RNG, arr: T[]): T => arr[Math.floor(r() * arr.length)]!
const int = (r: RNG, min: number, max: number) => Math.floor(r() * (max - min + 1)) + min
const chance = (r: RNG, p: number) => r() < p
const pad = (n: number, w = 2) => String(n).padStart(w, '0')
function randDate(r: RNG, y0 = 2023, y1 = 2026): string {
  return `${pad(int(r, 1, 28))}/${pad(int(r, 1, 12))}/${int(r, y0, y1)}`
}
function addDays(base: Date, days: number): string {
  const d = new Date(base); d.setDate(d.getDate() + days)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

// ── Familia → tipo de producto ───────────────────────────────────────────────
export type TipoProd = 'TDC' | 'Crédito' | 'Seguros' | 'Cheques' | 'TPV' | 'Nómina' | 'Inversión' | 'Digital' | 'Otro'
function tipoDeFamilia(nombre: string): TipoProd {
  const n = nombre.toLowerCase()
  if (n.includes('tpv')) return 'TPV'
  if (n.includes('tdc') || n.includes('tarjeta de crédito')) return 'TDC'
  if (n.includes('nómina') || n.includes('nomina')) return 'Nómina'
  if (n.includes('seguro')) return 'Seguros'
  if (n.includes('cheques') || n.includes('cuenta')) return 'Cheques'
  if (n.includes('inversión') || n.includes('inversion')) return 'Inversión'
  if (n.includes('banca') || n.includes('digital')) return 'Digital'
  if (n.includes('crédito') || n.includes('credito') || n.includes('hipotec') || n.includes('arrendamiento') || n.includes('factoraje')) return 'Crédito'
  return 'Otro'
}

// ── Tipos de tabla (filas con FKs) ───────────────────────────────────────────
export interface Persona {
  rfc: string; nombre: string; tipoPersona: string
  esCliente: boolean; estatus: 'Activo' | 'Inactivo' | 'Prospecto'
  segmento: string; banco: string
  nacioComoProspecto: boolean; fechaAltaProspecto: string; fechaConversion: string
  telefonos: string; correo: string; direccion: string
}
export interface NumeroCliente { rfc: string; numeroCliente: string; banco: string }
export interface Contrato {
  idContrato: string; rfc: string; numeroCliente: string; familia: string; producto: string; tipo: TipoProd
  numeroCuenta: string; fechaAlta: string; fechaVencimiento: string
  estatus: 'Activo' | 'Cancelado' | 'Vencido'
  lineaAutorizada: number; saldoActual: number; saldoVencido: number
  diasMora: number; bucketMora: string; fechaProximoPago: string; pagoAlCorriente: boolean; porVencer: boolean
}
export interface Variacion { rfc: string; idContrato: string; tipo: 'Cheques' | 'Crédito'; fecha: string; montoAnterior: number; montoActual: number; montoMovimiento: number }
export interface IngresoNoFinanciero { rfc: string; concepto: string; monto: number; operaciones: number; fecha: string }
export interface TimbradoEvento { rfc: string; idContrato: string; familia: string; tipo: TipoProd; evento: string; criterio: string; cumplido: boolean; fecha: string; monto: number }
export interface AclaracionQueja { rfc: string; folio: string; tipo: 'Aclaración' | 'Queja' | 'Comentario'; canal: string; motivo: string; detalle: string; estatus: 'Abierta' | 'En proceso' | 'Cerrada'; fechaApertura: string; fechaCierre: string }
export interface Comunicacion { rfc: string; canal: 'WhatsApp' | 'SMS' | 'Correo' | 'Email' | 'Llamada'; asunto: string; contenido: string; fecha: string; estatus: 'Enviado' | 'Entregado' | 'Leído' | 'Fallido' }
export interface Denuncia { rfc: string; folio: string; tipo: string; autoridad: string; estatus: string; fecha: string }
export interface TpvAfiliacion { rfc: string; idContrato: string; numeroAfiliacion: string; terminalId: string; modelo: string; estatus: 'Activa' | 'Inactiva'; facturacionMensual: number }
export interface Recomendacion { rfc: string; productoRecomendado: string; familia: string; score: number; motivo: string }
export interface NPS { rfc: string; score: number; categoria: 'Detractor' | 'Pasivo' | 'Promotor'; fecha: string; canal: string; comentario: string }

// ── Tablas (se llenan al cargar) ─────────────────────────────────────────────
export const PERSONAS: Persona[] = []
export const NUMEROS_CLIENTE: NumeroCliente[] = []
export const CONTRATOS: Contrato[] = []
export const VARIACIONES: Variacion[] = []
export const INGRESOS_NF: IngresoNoFinanciero[] = []
export const TIMBRADO: TimbradoEvento[] = []
export const ACLARACIONES: AclaracionQueja[] = []
export const COMUNICACIONES: Comunicacion[] = []
export const DENUNCIAS: Denuncia[] = []
export const TPV: TpvAfiliacion[] = []
export const RECOMENDACIONES: Recomendacion[] = []
export const NPS_TBL: NPS[] = []

// ── Catálogos / fuentes ──────────────────────────────────────────────────────
const CLIENTS = buildClients()
const OFFERS = buildOffers()
const CAT = buildCatalogs()
const FAMILIAS = Object.keys(CAT.families).map((id) => ({ id, nombre: CAT.families[id]!, tipo: tipoDeFamilia(CAT.families[id]!) }))

const SERVICIOS_NF = ['Divisas', 'Fiduciario', 'Avalúos', 'Derivados', 'Cartas de crédito', 'Transferencias', 'Banca Electrónica']
const MOTIVOS_QUEJA = ['Cargo no reconocido', 'Cobro de comisión', 'Atención en sucursal', 'Transferencia no aplicada', 'Tarjeta bloqueada', 'Error en estado de cuenta']
const CANALES_COM: Comunicacion['canal'][] = ['WhatsApp', 'SMS', 'Correo', 'Email', 'Llamada']
const ASUNTOS_COM = ['Bienvenida', 'Recordatorio de pago', 'Oferta preaprobada', 'Encuesta de satisfacción', 'Aviso de vencimiento', 'Promoción cross-sell']
const SEGMENTOS = ['Patrimonial', 'Empresarial', 'PyME', 'Personal']
const BANCOS = ['Banco A', 'Banco B']
const PRIORIDAD_NBA: TipoProd[] = ['TDC', 'Crédito', 'Seguros', 'Nómina', 'TPV', 'Inversión']
const HOY = new Date(2026, 5, 1)

function bucketMora(dias: number): string {
  if (dias <= 0) return 'Al corriente'
  if (dias <= 29) return '1-29'
  if (dias <= 59) return '30-59'
  if (dias <= 89) return '60-89'
  return '90+'
}

// ── Generación ───────────────────────────────────────────────────────────────
function generarPersona(rfc: string, cli: Client | undefined, ofertasCli: ReturnType<typeof buildOffers>, esCliente: boolean) {
  const r = mulberry32(hash(rfc))
  const tipoPersona = cli?.tipoPersona || ofertasCli[0]?.tipoPersona || 'PF'
  const nombre = cli?.nombre || ofertasCli[0]?.raw['RFC'] || rfc

  // Persona (cliente o prospecto)
  let estatus: Persona['estatus']
  let nacio = false, fechaAltaProspecto = '', fechaConversion = ''
  if (esCliente) {
    estatus = chance(r, 0.12) ? 'Inactivo' : 'Activo'
    nacio = chance(r, 0.6)
    fechaAltaProspecto = nacio ? randDate(r, 2022, 2024) : ''
    fechaConversion = nacio ? randDate(r, 2024, 2025) : ''
  } else {
    estatus = 'Prospecto'
    nacio = true
    fechaAltaProspecto = randDate(r, 2024, 2026)
  }

  PERSONAS.push({
    rfc, nombre, tipoPersona, esCliente, estatus,
    segmento: pick(r, SEGMENTOS), banco: pick(r, BANCOS),
    nacioComoProspecto: nacio, fechaAltaProspecto, fechaConversion,
    telefonos: cli?.telefonos || '', correo: cli?.correo || '', direccion: cli?.direccion || '',
  })

  // Un prospecto NO tiene productos: solo ofertas, comunicaciones, aclaraciones, NBA.
  if (!esCliente) {
    generarComunicaciones(r, rfc)
    generarAclaraciones(r, rfc)
    generarNBA(r, rfc, new Set())
    return
  }

  // Números de cliente
  const numeros: string[] = [cli!.numero || `CLI-${int(r, 4000001, 4999999)}`]
  if (chance(r, 0.2)) numeros.push(`CLI-${int(r, 5000001, 5999999)}`)
  numeros.forEach((n) => NUMEROS_CLIENTE.push({ rfc, numeroCliente: n, banco: pick(r, BANCOS) }))

  // Familias del cliente (de sus ofertas + base)
  const famSet = new Set<string>()
  ofertasCli.forEach((o) => { const id = o.raw['ID de la familia de producto']; if (id) famSet.add(id) })
  while (famSet.size < int(r, 1, 3)) famSet.add(pick(r, FAMILIAS).id)

  // Contratos
  const tiposCliente = new Set<TipoProd>()
  let cIdx = 1
  for (const famId of famSet) {
    const fam = FAMILIAS.find((f) => f.id === famId) || pick(r, FAMILIAS)
    const prod = pick(r, CAT.productsByFamily[famId] || [{ id: '', nombre: fam.nombre }])
    const cancelado = estatus === 'Inactivo' ? chance(r, 0.7) : chance(r, 0.1)
    const venceDate = new Date(HOY); venceDate.setDate(venceDate.getDate() + int(r, -120, 365))
    const diasAVencer = Math.round((venceDate.getTime() - HOY.getTime()) / 86400000)
    const linea = int(r, 1, 50) * 10000
    const enMora = chance(r, 0.22)
    const diasMora = enMora ? pick(r, [int(r, 1, 29), int(r, 30, 59), int(r, 60, 89), int(r, 90, 180)]) : 0
    const saldoActual = cancelado ? 0 : Math.round(linea * (r() * 0.9))
    const idContrato = `CTR${rfc.slice(0, 4)}${pad(cIdx++, 3)}`
    tiposCliente.add(fam.tipo)
    CONTRATOS.push({
      idContrato, rfc, numeroCliente: numeros[0]!, familia: fam.nombre, producto: prod.nombre, tipo: fam.tipo,
      numeroCuenta: `${fam.tipo === 'TDC' ? '4' : '0'}${int(r, 100000000000000, 999999999999999)}`,
      fechaAlta: randDate(r, 2023, 2025),
      fechaVencimiento: `${pad(venceDate.getDate())}/${pad(venceDate.getMonth() + 1)}/${venceDate.getFullYear()}`,
      estatus: cancelado ? 'Cancelado' : (diasAVencer < 0 ? 'Vencido' : 'Activo'),
      lineaAutorizada: linea, saldoActual, saldoVencido: enMora ? Math.round(saldoActual * (0.1 + r() * 0.4)) : 0,
      diasMora, bucketMora: bucketMora(diasMora), fechaProximoPago: addDays(HOY, int(r, -10, 45)),
      pagoAlCorriente: !enMora, porVencer: diasAVencer >= 0 && diasAVencer <= 30,
    })

    // Variaciones (cheques/crédito)
    if (fam.tipo === 'Cheques' || fam.tipo === 'Crédito') {
      let saldo = saldoActual
      for (let i = 0; i < int(r, 3, 8); i++) {
        const mov = (chance(r, 0.5) ? 1 : -1) * int(r, 1, 200) * 1000
        const anterior = saldo; saldo = Math.max(0, saldo + mov)
        VARIACIONES.push({ rfc, idContrato, tipo: fam.tipo as 'Cheques' | 'Crédito', fecha: randDate(r, 2025, 2026), montoAnterior: anterior, montoActual: saldo, montoMovimiento: mov })
      }
    }

    // Timbrado / activación
    let evento = '', criterio = '', cumplido = false, monto = 0
    switch (fam.tipo) {
      case 'TDC': evento = 'Disposición de TDC'; criterio = 'Cualquier disposición/movimiento'; cumplido = chance(r, 0.7); monto = cumplido ? int(r, 1, 80) * 1000 : 0; break
      case 'Crédito': evento = 'Disposición de la línea'; criterio = 'Dispuso la línea'; cumplido = saldoActual > 0; monto = saldoActual; break
      case 'Seguros': evento = 'Prima cobrada'; criterio = 'La aseguradora cobró la prima'; cumplido = chance(r, 0.6); monto = cumplido ? int(r, 3, 30) * 1000 : 0; break
      case 'Cheques': evento = 'Saldo en cuenta'; criterio = 'Saldo > 0'; cumplido = saldoActual > 0; monto = saldoActual; break
      case 'TPV': { const f = int(r, 5, 200) * 1000; evento = 'Facturación TPV'; criterio = 'Facturó ≥ $50,000/mes'; cumplido = f >= 50000; monto = f; break }
      case 'Nómina': evento = 'Dispersión recibida'; criterio = 'Se recibió dispersión'; cumplido = chance(r, 0.75); monto = cumplido ? int(r, 10, 120) * 1000 : 0; break
      default: evento = 'Activación'; criterio = 'Producto activo'; cumplido = !cancelado
    }
    TIMBRADO.push({ rfc, idContrato, familia: fam.nombre, tipo: fam.tipo, evento, criterio, cumplido, fecha: cumplido ? randDate(r, 2025, 2026) : '', monto })

    // TPV afiliaciones
    if (fam.tipo === 'TPV') {
      for (let i = 0; i < int(r, 1, 3); i++) {
        TPV.push({ rfc, idContrato, numeroAfiliacion: String(int(r, 1000000, 9999999)), terminalId: `TERM${int(r, 10000, 99999)}`, modelo: pick(r, ['Verifone V240m', 'PAX A920', 'Ingenico Move 5000', 'SmartPOS']), estatus: chance(r, 0.8) ? 'Activa' : 'Inactiva', facturacionMensual: int(r, 5, 300) * 1000 })
      }
    }
  }

  // Ingresos no financieros (cobros por servicios)
  SERVICIOS_NF.slice().sort(() => r() - 0.5).slice(0, int(r, 1, 4)).forEach((concepto) => {
    INGRESOS_NF.push({ rfc, concepto, monto: int(r, 1, 80) * 1000, operaciones: int(r, 1, 40), fecha: randDate(r, 2025, 2026) })
  })

  generarComunicaciones(r, rfc)
  generarAclaraciones(r, rfc)

  // Denuncias (raras)
  if (chance(r, 0.06)) DENUNCIAS.push({ rfc, folio: `DEN${int(r, 10000, 99999)}`, tipo: pick(r, ['Fraude', 'Robo de identidad', 'Cargo no reconocido']), autoridad: pick(r, ['CONDUSEF', 'FGR', 'Banca']), estatus: pick(r, ['Presentada', 'En investigación', 'Resuelta']), fecha: randDate(r, 2025, 2026) })

  generarNBA(r, rfc, tiposCliente)

  // NPS (solo clientes)
  const score = int(r, 0, 10)
  NPS_TBL.push({ rfc, score, categoria: score <= 6 ? 'Detractor' : score <= 8 ? 'Pasivo' : 'Promotor', fecha: randDate(r, 2025, 2026), canal: pick(r, ['Email', 'SMS', 'App', 'Llamada']), comentario: score <= 6 ? pick(r, ['Mala atención', 'Comisiones altas', 'Tiempos de espera']) : score <= 8 ? 'Servicio aceptable' : 'Muy satisfecho con el servicio' })
}

const CUERPO_COM: Record<string, string> = {
  'Bienvenida': 'Te damos la bienvenida. Tu ejecutivo está disponible para ayudarte con tus productos.',
  'Recordatorio de pago': 'Te recordamos que tu próximo pago está por vencer. Evita recargos pagando a tiempo.',
  'Oferta preaprobada': 'Tienes una oferta preaprobada esperándote. Consulta con tu ejecutivo los detalles.',
  'Encuesta de satisfacción': '¿Cómo calificarías tu experiencia? Tu opinión nos ayuda a mejorar.',
  'Aviso de vencimiento': 'Uno de tus contratos/líneas está próximo a vencer. Revisa las condiciones de renovación.',
  'Promoción cross-sell': 'Por tu buen historial, puedes acceder a productos con condiciones preferentes.',
}
function generarComunicaciones(r: RNG, rfc: string) {
  for (let i = 0; i < int(r, 2, 6); i++) {
    const asunto = pick(r, ASUNTOS_COM)
    COMUNICACIONES.push({ rfc, canal: pick(r, CANALES_COM), asunto, contenido: CUERPO_COM[asunto] || asunto, fecha: randDate(r, 2025, 2026), estatus: pick(r, ['Enviado', 'Entregado', 'Leído', 'Fallido']) })
  }
}
function generarAclaraciones(r: RNG, rfc: string) {
  for (let i = 0; i < int(r, 0, 3); i++) {
    const cerrada = chance(r, 0.6)
    const motivo = pick(r, MOTIVOS_QUEJA)
    const tipo = pick(r, ['Aclaración', 'Queja', 'Comentario'] as const)
    ACLARACIONES.push({ rfc, folio: `ACL${int(r, 100000, 999999)}`, tipo, canal: pick(r, ['Sucursal', 'Call center', 'App', 'CONDUSEF']), motivo, detalle: `${tipo} por "${motivo.toLowerCase()}". El cliente solicita revisión y seguimiento del caso.`, estatus: cerrada ? 'Cerrada' : pick(r, ['Abierta', 'En proceso']), fechaApertura: randDate(r, 2025, 2026), fechaCierre: cerrada ? randDate(r, 2026, 2026) : '' })
  }
}
function generarNBA(r: RNG, rfc: string, tiposCliente: Set<TipoProd>) {
  const faltante = PRIORIDAD_NBA.find((t) => !tiposCliente.has(t)) || 'Inversión'
  const famReco = FAMILIAS.find((f) => f.tipo === faltante) || pick(r, FAMILIAS)
  const prodReco = pick(r, CAT.productsByFamily[famReco.id] || [{ id: '', nombre: famReco.nombre }])
  RECOMENDACIONES.push({ rfc, productoRecomendado: prodReco.nombre, familia: famReco.nombre, score: int(r, 60, 95), motivo: tiposCliente.has('Nómina') && faltante === 'TDC' ? 'Cliente con nómina sin tarjeta de crédito' : `No cuenta con productos de ${famReco.nombre}` })
}

// ── Carga: construir todas las tablas (clientes + prospectos) ─────────────────
;(function build() {
  const rfcs = new Set<string>()
  Object.keys(CLIENTS).forEach((rfc) => rfcs.add(rfc))
  OFFERS.forEach((o) => { const rfc = o.raw['RFC']; if (rfc) rfcs.add(rfc) })
  Array.from(rfcs).sort().forEach((rfc) => {
    const ofertasCli = OFFERS.filter((o) => (o.raw['RFC'] || '') === rfc)
    // Es cliente si tiene alguna oferta de tipo "Cliente", o si está en el padrón
    // de clientes sin ofertas. Si solo tiene ofertas de "Prospecto" → prospecto.
    const esCliente = ofertasCli.some((o) => o.tipoOferta === 'Cliente') || (!!CLIENTS[rfc] && ofertasCli.length === 0)
    generarPersona(rfc, CLIENTS[rfc], ofertasCli, esCliente)
  })
})()

// ── Vista 360° ensamblada (cruzas) ───────────────────────────────────────────
export interface Ciclo360 {
  persona: Persona
  numerosCliente: NumeroCliente[]
  contratos: Contrato[]
  ofertas: ReturnType<typeof buildOffers>
  variaciones: Variacion[]
  ingresos: IngresoNoFinanciero[]
  timbrado: TimbradoEvento[]
  aclaraciones: AclaracionQueja[]
  comunicaciones: Comunicacion[]
  denuncias: Denuncia[]
  tpv: TpvAfiliacion[]
  recomendacion: Recomendacion | null
  nps: NPS | null
}

export function getCiclo360(rfc: string): Ciclo360 | null {
  const persona = PERSONAS.find((p) => p.rfc === rfc)
  if (!persona) return null
  return {
    persona,
    numerosCliente: NUMEROS_CLIENTE.filter((x) => x.rfc === rfc),
    contratos: CONTRATOS.filter((x) => x.rfc === rfc),
    ofertas: OFFERS.filter((o) => (o.raw['RFC'] || '') === rfc),
    variaciones: VARIACIONES.filter((x) => x.rfc === rfc),
    ingresos: INGRESOS_NF.filter((x) => x.rfc === rfc),
    timbrado: TIMBRADO.filter((x) => x.rfc === rfc),
    aclaraciones: ACLARACIONES.filter((x) => x.rfc === rfc),
    comunicaciones: COMUNICACIONES.filter((x) => x.rfc === rfc),
    denuncias: DENUNCIAS.filter((x) => x.rfc === rfc),
    tpv: TPV.filter((x) => x.rfc === rfc),
    recomendacion: RECOMENDACIONES.find((x) => x.rfc === rfc) || null,
    nps: NPS_TBL.find((x) => x.rfc === rfc) || null,
  }
}

/** Lista de personas para el selector de la vista (cliente/prospecto). */
export function listPersonas(): Persona[] {
  return PERSONAS.slice().sort((a, b) => a.nombre.localeCompare(b.nombre))
}
