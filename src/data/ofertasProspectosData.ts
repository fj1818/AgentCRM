/**
 * Datos de ofertas de prospectos pre-generados
 * 
 * Columnas:
 * - IdOferta: 18 caracteres ("OP" + 16 alfanuméricos)
 * - IdProspecto: FK a tabla prospectos
 * - NumeroPromotor: FK a tabla promotores
 * - FamiliaProducto: TDC, TPV, Cheques
 * - ProductoInteres: Nombre específico del producto
 * - FechaAlta: dd/mm/yyyy
 * - FechaBaja: dd/mm/yyyy (opcional)
 * - Etapa: No contactado, En negociación, Interesado, Descartado, Convertido
 * - Campaña: Origen de la oferta
 * - MontoInteres: Monto buscado por el cliente
 * - IdOportunidad: 18 caracteres ("OC" + 16) si se convirtió
 */

import type { 
  OfertaProspecto, 
  FamiliaProducto, 
  EtapaOferta, 
  CampañaOrigen 
} from '@/types/ofertaProspecto.types'
import { prospectosData } from './prospectosData'
import { promotoresData } from './promotoresData'

const familias: FamiliaProducto[] = ['TDC', 'TPV', 'Cheques', 'Crédito', 'Seguros', 'Nómina']

const productosPorFamilia: Record<FamiliaProducto, string[]> = {
  'TDC': ['TDC Clásica', 'TDC Oro', 'TDC Platinum', 'TDC Empresarial'],
  'TPV': ['TPV Básica', 'TPV Plus', 'TPV Móvil', 'TPV eCommerce'],
  'Cheques': ['Cuenta Básica', 'Cuenta Plus', 'Cuenta Empresarial'],
  'Crédito': ['Crédito Personal', 'Crédito Auto', 'Crédito Negocios', 'Crédito Hipotecario', 'Crédito PYME'],
  'Seguros': ['Seguro de Vida', 'Seguro Auto', 'Seguro Hogar', 'Seguro Gastos Médicos', 'Seguro Empresarial'],
  'Nómina': ['Nómina Básica', 'Nómina Plus', 'Nómina Empresarial', 'Dispersión de Nómina'],
}

const campañas: CampañaOrigen[] = [
  'Referencia Propia',
  'Pagina Web',
  'App',
  'Portal',
  'Campaña Prospectos Perfilados 2026',
  'Campaña Navidad 2025',
  'Campaña PyMEs Digital',
  'Campaña Empresarios Hey',
]

function generarScriptVenta(familia: FamiliaProducto, producto: string, monto: number): string {
  const beneficios: Record<FamiliaProducto, string[]> = {
    'TDC': [
      'Sin anualidad de por vida',
      'Meses sin intereses en comercios participantes',
      'Cashback en todas tus compras'
    ],
    'TPV': [
      'Tasa preferencial del 2.5%',
      'Sin renta mensual con facturación mínima',
      'Acepta todas las tarjetas y pagos contactless'
    ],
    'Cheques': [
      'Dispersión de nómina gratuita',
      'Chequera ilimitada',
      'Banca en línea empresarial sin costo'
    ],
    'Crédito': [
      'Tasa preferencial desde 12% anual',
      'Sin penalización por pago anticipado',
      'Plazos flexibles de 12 a 60 meses'
    ],
    'Seguros': [
      'Cobertura amplia a nivel nacional',
      'Sin deducibles en siniestros mayores',
      'Asistencia 24/7 en línea y telefónica'
    ],
    'Nómina': [
      'Dispersión de nómina sin costo',
      'Tarjeta de débito para empleados',
      'Portal de autoservicio para RRHH'
    ]
  }

  const beneficiosList = (beneficios[familia] || []).map(b => `- ${b}`).join('\n')
  const tasas: Record<FamiliaProducto, string> = {
    'TDC': 'Tasa de interés ordinaria anual fija del 45%',
    'TPV': 'Tasa de descuento de 2.5% + IVA',
    'Cheques': 'Rendimiento anual del 5%',
    'Crédito': 'Tasa de interés anual desde el 12%',
    'Seguros': 'Prima anual calculada según cobertura',
    'Nómina': 'Servicio sin costo con mínimo de empleados'
  }
  const tasa = tasas[familia] || 'Consultar condiciones'

  return `Script de Venta Sugerido:

El cliente está interesado en el producto ${producto} con un monto pre-aprobado de $${monto.toLocaleString('es-MX')}.

Tasa / Condiciones:
${tasa}

Mencionale los siguientes beneficios exclusivos:
${beneficiosList}

Recuerda resaltar la facilidad de contratación digital y el soporte 24/7.`
}

function generarAlfanumerico(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generarFecha(añoInicio: number = 2023, añoFin: number = 2025): string {
  const año = Math.floor(Math.random() * (añoFin - añoInicio + 1)) + añoInicio
  const mes = Math.floor(Math.random() * 12) + 1
  const dia = Math.floor(Math.random() * 28) + 1
  return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${año}`
}

function generarFechaPosterior(fechaBase: string): string {
  const partes = fechaBase.split('/')
  const diaBase = parseInt(partes[0]!)
  const mesBase = parseInt(partes[1]!)
  const añoBase = parseInt(partes[2]!)
  
  let nuevoMes = mesBase + Math.floor(Math.random() * 6) + 1
  let nuevoAño = añoBase
  
  while (nuevoMes > 12) {
    nuevoMes -= 12
    nuevoAño++
  }
  
  if (nuevoAño > 2025) {
    nuevoAño = 2025
    nuevoMes = 12
  }
  
  const nuevoDia = Math.min(diaBase, 28)
  return `${nuevoDia.toString().padStart(2, '0')}/${nuevoMes.toString().padStart(2, '0')}/${nuevoAño}`
}

function generarMontoInteres(familia: FamiliaProducto): number {
  switch (familia) {
    case 'TDC':
      return Math.floor(Math.random() * 990000) + 10000
    case 'TPV':
      return Math.floor(Math.random() * 4950000) + 50000
    case 'Cheques':
      return Math.floor(Math.random() * 1980000) + 20000
    case 'Crédito':
      return Math.floor(Math.random() * 2000000) + 50000
    case 'Seguros':
      return Math.floor(Math.random() * 50000) + 5000
    case 'Nómina':
      return Math.floor(Math.random() * 500000) + 10000
    default:
      return 50000
  }
}

export function generarOfertasProspectosSimuladas(cantidad: number = 800): OfertaProspecto[] {
  const ofertas: OfertaProspecto[] = []
  const idsUsados = new Set<string>()
  
  // Obtener IDs de prospectos existentes
  const idsProspectos = prospectosData.map(p => p.idProspecto)
  
  // Obtener números de promotores
  const numerosPromotores = promotoresData.map(p => p.numeroPromotor)
  
  while (ofertas.length < cantidad) {
    // Generar IdOferta único
    let idOferta: string
    do {
      idOferta = 'OP' + generarAlfanumerico(16)
    } while (idsUsados.has(idOferta))
    idsUsados.add(idOferta)
    
    // Seleccionar prospecto aleatorio
    const idxProspecto = Math.floor(Math.random() * idsProspectos.length)
    const idProspecto = idsProspectos[idxProspecto]!
    
    // Asignar promotor aleatorio (simulando asignación de lead)
    const numeroPromotor = numerosPromotores[Math.floor(Math.random() * numerosPromotores.length)]!
    
    // Familia y producto
    const familia = familias[Math.floor(Math.random() * familias.length)]!
    const productos = productosPorFamilia[familia]
    const productoInteres = productos[Math.floor(Math.random() * productos.length)]!
    
    // Fechas
    const fechaAlta = generarFecha(2023, 2025)
    
    // Etapa
    const randEtapa = Math.random()
    let etapa: EtapaOferta
    if (randEtapa < 0.10) etapa = 'No contactado'
    else if (randEtapa < 0.35) etapa = 'En negociación'
    else if (randEtapa < 0.60) etapa = 'Interesado'
    else if (randEtapa < 0.75) etapa = 'Descartado'
    else etapa = 'Convertido'
    
    // Fecha de baja solo para Descartado
    let fechaBaja: string | undefined
    if (etapa === 'Descartado') {
      fechaBaja = generarFechaPosterior(fechaAlta)
    }
    
    // Campaña
    const campaña = campañas[Math.floor(Math.random() * campañas.length)]!
    
    // Monto de interés
    const montoInteres = generarMontoInteres(familia)
    
    // Generar script de venta
    const descripcionOferta = generarScriptVenta(familia, productoInteres, montoInteres)
    
    // IdOportunidad solo si se convirtió
    let idOportunidad: string | undefined
    if (etapa === 'Convertido') {
      idOportunidad = 'OC' + generarAlfanumerico(16)
    }
    
    ofertas.push({
      idOferta,
      idProspecto,
      numeroPromotor,
      familiaProducto: familia,
      productoInteres,
      descripcionOferta,
      fechaAlta,
      fechaBaja,
      etapa,
      campaña,
      montoInteres,
      idOportunidad,
    })
  }
  
  return ofertas
}

// Pre-generar datos
export const ofertasProspectosData = generarOfertasProspectosSimuladas(800)

// Funciones de acceso
export function obtenerOfertasPorProspecto(idProspecto: string): OfertaProspecto[] {
  return ofertasProspectosData.filter(o => o.idProspecto === idProspecto)
}

export function obtenerOfertasPorFamilia(familia: FamiliaProducto): OfertaProspecto[] {
  return ofertasProspectosData.filter(o => o.familiaProducto === familia)
}

export function obtenerOfertasPorEtapa(etapa: EtapaOferta): OfertaProspecto[] {
  return ofertasProspectosData.filter(o => o.etapa === etapa)
}

export function obtenerOfertasConvertidas(): OfertaProspecto[] {
  return ofertasProspectosData.filter(o => o.etapa === 'Convertido')
}

export function obtenerOfertasActivas(): OfertaProspecto[] {
  return ofertasProspectosData.filter(o => !o.fechaBaja && o.etapa !== 'Descartado')
}
