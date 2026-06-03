/**
 * Seed del módulo Ofertas — datos del prototipo DiseñoNuevoCRM.
 * Importa los CSV originales (?raw) y reconstruye las mismas estructuras que
 * los servicios AppScript: listOffers, getClients, getUsers, listComments,
 * getCatalogs (CatalogsService.gs / ClientsService.gs / etc.).
 */

import ofertasCsv from './ofertas.csv?raw'
import clientesCsv from './clientes.csv?raw'
import usuariosCsv from './usuarios.csv?raw'
import comentariosCsv from './comentarios.csv?raw'
import familiaCsv from './familia_producto.csv?raw'
import productosCsv from './productos.csv?raw'
import campanasCsv from './campanas.csv?raw'
import origenesCsv from './origenes.csv?raw'
import etapasCsv from './etapas.csv?raw'
import subetapasCsv from './subetapas.csv?raw'

// ── Parser CSV (soporta comillas con comas internas) ────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter((l) => l.length > 0)
  if (lines.length < 2) return []
  const headers = splitLine(lines[0]!)
  const out: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i]!)
    const row: Record<string, string> = {}
    headers.forEach((h, j) => { row[h.trim()] = (cells[j] ?? '').trim() })
    out.push(row)
  }
  return out
}

function splitLine(line: string): string[] {
  const cells: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      cells.push(cur); cur = ''
    } else {
      cur += ch
    }
  }
  cells.push(cur)
  return cells
}

// ── Tipos ───────────────────────────────────────────────────────────────────
export interface Offer {
  ejecutivo: string
  tipoOferta: string
  tipoPersona: string
  familia: string
  producto: string
  etapa: string
  monto: number
  fechaCierre: string
  raw: Record<string, string>
}
export interface Client {
  numero: string; nombre: string; rfc: string
  telefonos: string; correo: string; direccion: string; tipoPersona: string
}
export interface User { idUsuario: string; numero: string; idPromotor: string; nombre: string }
export interface Comment { id: string; rfc: string; idOferta: string; idUsuario: string; comentario: string; fecha: string }
export interface ProductRef { id: string; nombre: string }
export interface Stage { nombre: string; esCierre: boolean; resultado: string }
export interface Catalogs {
  families: Record<string, string>
  products: Record<string, string>
  campaigns: Record<string, string>
  productsByFamily: Record<string, ProductRef[]>
  origins: string[]
  familyRoute: Record<string, string>
  stagesByRoute: Record<string, Stage[]>
  subStagesByRoute: Record<string, Record<string, string[]>>
}

// ── Construcción (equivale a los servicios .gs) ──────────────────────────────
const num = (v: string) => Number(String(v).replace(/[^0-9.-]/g, '')) || 0

export function buildOffers(): Offer[] {
  return parseCSV(ofertasCsv)
    .filter((r) => r['Ejecutivo'] || r['Producto'])
    .map((r) => ({
      ejecutivo: r['Ejecutivo'] || '',
      tipoOferta: r['Tipo de oferta'] || '',
      tipoPersona: r['Tipo de persona'] || '',
      familia: r['Familia de producto'] || '',
      producto: r['Producto'] || '',
      etapa: r['Etapa'] || '',
      monto: num(r['Monto de la oferta'] || '0'),
      fechaCierre: r['Fecha de cierre'] || '',
      raw: { ...r },
    }))
}

export function buildClients(): Record<string, Client> {
  const map: Record<string, Client> = {}
  for (const r of parseCSV(clientesCsv)) {
    const rfc = r['RFC'] || ''
    if (!rfc) continue
    map[rfc] = {
      numero: r['Número de cliente'] || '',
      nombre: r['Nombre'] || '',
      rfc,
      telefonos: r['Teléfonos'] || '',
      correo: r['Correo'] || '',
      direccion: r['Dirección'] || '',
      tipoPersona: r['Tipo de persona'] || '',
    }
  }
  return map
}

export function buildUsers(): User[] {
  return parseCSV(usuariosCsv)
    .filter((r) => r['Nombre'] || r['Número de promotor'])
    .map((r) => {
      const numero = r['Número de promotor'] || ''
      return { idUsuario: r['Id del usuario'] || '', numero, idPromotor: numero ? 'PRM' + numero : '', nombre: r['Nombre'] || '' }
    })
}

export function buildComments(): Comment[] {
  return parseCSV(comentariosCsv)
    .filter((r) => r['Id de la oferta'] || r['Comentario'])
    .map((r) => ({
      id: r['Id del registro'] || '',
      rfc: r['RFC'] || '',
      idOferta: r['Id de la oferta'] || '',
      idUsuario: r['Id de usuario'] || '',
      comentario: r['Comentario'] || '',
      fecha: r['Fecha'] || '',
    }))
}

export function buildCatalogs(): Catalogs {
  const fam = parseCSV(familiaCsv)
  const prod = parseCSV(productosCsv)
  const camp = parseCSV(campanasCsv)
  const orig = parseCSV(origenesCsv)
  const etapas = parseCSV(etapasCsv)
  const subs = parseCSV(subetapasCsv)

  const families: Record<string, string> = {}
  const familyRoute: Record<string, string> = {}
  for (const r of fam) {
    const id = r['ID familia producto']
    if (!id) continue
    families[id] = r['Nombre'] || ''
    familyRoute[id] = r['Ruta'] || ''
  }

  const products: Record<string, string> = {}
  const productsByFamily: Record<string, ProductRef[]> = {}
  for (const r of prod) {
    const id = r['ID del producto']; const f = r['ID de la familia de producto']
    if (!id) continue
    products[id] = r['Nombre del producto'] || ''
    if (f) (productsByFamily[f] ||= []).push({ id, nombre: r['Nombre del producto'] || '' })
  }

  const campaigns: Record<string, string> = {}
  for (const r of camp) {
    const id = r['Id de la campaña']
    if (id) campaigns[id] = r['Nombre de la campaña'] || ''
  }

  const origins: string[] = []
  for (const r of orig) {
    const v = r['Origen']
    if (v && !origins.includes(v)) origins.push(v)
  }

  const stagesByRoute: Record<string, Stage[]> = {}
  for (const r of etapas) {
    const ruta = r['Ruta']; const nombre = r['Etapa']
    if (!ruta || !nombre) continue
    ;(stagesByRoute[ruta] ||= []).push({
      nombre,
      esCierre: String(r['Es cierre']).toUpperCase() === 'TRUE',
      resultado: r['Resultado'] || '',
    })
  }

  const subStagesByRoute: Record<string, Record<string, string[]>> = {}
  for (const r of subs) {
    const ruta = r['Ruta']; const et = r['Etapa']; const su = r['SubEtapa']
    if (!ruta || !et || !su) continue
    const byEt = (subStagesByRoute[ruta] ||= {})
    const list = (byEt[et] ||= [])
    if (!list.includes(su)) list.push(su)
  }

  return { families, products, campaigns, productsByFamily, origins, familyRoute, stagesByRoute, subStagesByRoute }
}
