/**
 * Datos de ofertas de clientes pre-generados
 * 
 * Columnas:
 * - IdOferta: 18 caracteres ("OC" + 16 alfanuméricos)
 * - IDE: FK a tabla clientes
 * - NumeroPromotor: FK a tabla promotores
 * - PromotorNombre: Nombre del promotor
 * - FamiliaProducto: TDC, TPV, Cheques
 * - ProductoInteres: Nombre específico del producto
 * - FechaAlta: dd/mm/yyyy
 * - FechaBaja: dd/mm/yyyy (opcional)
 * - Etapa: No contactado, Interesado, Negociación, Descartado, Fabrica, Entregado, Timbrado
 * - Campaña: Origen de la oferta
 * - MontoOferta: Monto ofrecido al cliente
 * - IdOportunidad: 18 caracteres ("OP" + 16) si aplica
 * - MontoTimbrado: Monto final timbrado (solo si Timbrado)
 * - FechaTimbrado: Fecha de timbrado (solo si Timbrado)
 */

import type { 
  OfertaCliente, 
  FamiliaProductoCliente, 
  EtapaOfertaCliente, 
  CampañaOrigenCliente 
} from '@/types/ofertaCliente.types'
import { clientesData } from './clientesData'
import { promotoresData } from './promotoresData'

const familias: FamiliaProductoCliente[] = ['TDC', 'TPV', 'Cheques']

const productosPorFamilia: Record<FamiliaProductoCliente, string[]> = {
  'TDC': ['Tarjeta Clasica', 'Tarjeta Gold', 'Tarjeta Empresarial'],
  'TPV': ['TPV Básico', 'TPV Plus', 'TPV Premium'],
  'Cheques': ['NominaFlex', 'NominaTradicional', 'NominaBasica'],
}

const campañas: CampañaOrigenCliente[] = [
  'Referencia Propia',
  'Pagina Web',
  'App',
  'Portal',
  'Campaña Clientes Preferentes 2026',
  'Campaña Upgrade TDC',
  'Campaña Cross-Sell PyMEs',
  'Campaña Fidelización Hey',
]

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
  
  if (nuevoAño > 2026) {
    nuevoAño = 2026
    nuevoMes = 1
  }
  
  const nuevoDia = Math.min(diaBase, 28)
  return `${nuevoDia.toString().padStart(2, '0')}/${nuevoMes.toString().padStart(2, '0')}/${nuevoAño}`
}

function generarMontoOferta(familia: FamiliaProductoCliente): number {
  switch (familia) {
    case 'TDC':
      return Math.floor(Math.random() * 990000) + 10000
    case 'TPV':
      return Math.floor(Math.random() * 4950000) + 50000
    case 'Cheques':
      return Math.floor(Math.random() * 1980000) + 20000
    default:
      return 50000
  }
}

function generarScriptVenta(familia: FamiliaProductoCliente, producto: string, monto: number): string {
  const beneficios = {
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
    ]
  }

  const beneficiosList = beneficios[familia].map(b => `- ${b}`).join('\n')
  const tasa = familia === 'TDC' ? 'Tasa de interés ordinaria anual fija del 45%' : 
               familia === 'TPV' ? 'Tasa de descuento de 2.5% + IVA' : 'Rendimiento anual del 5%'

  return `El cliente está interesado en el producto ${producto} con un monto pre-aprobado de $${monto.toLocaleString('es-MX')}.

Tasa / Condiciones:
${tasa}

Mencionale los siguientes beneficios exclusivos:
${beneficiosList}

Recuerda resaltar la facilidad de contratación digital y el soporte 24/7.`
}

export function generarOfertasClientesSimuladas(cantidad: number = 600): OfertaCliente[] {
  const ofertas: OfertaCliente[] = []
  const idsUsados = new Set<string>()
  
  // Obtener IDEs de clientes existentes
  const idesClientes = clientesData.map(c => c.ide)
  
  while (ofertas.length < cantidad) {
    // Generar IdOferta único (OC + 16 alfanuméricos)
    let idOferta: string
    do {
      idOferta = 'OC' + generarAlfanumerico(16)
    } while (idsUsados.has(idOferta))
    idsUsados.add(idOferta)
    
    // Seleccionar cliente aleatorio
    const idxCliente = Math.floor(Math.random() * idesClientes.length)
    const ide = idesClientes[idxCliente]!
    
    // Obtener numeroPromotor del cliente
    const cliente = clientesData.find(c => c.ide === ide)
    const numeroPromotor = cliente ? cliente.numeroPromotor : '017577' // fallback default
    
    // Obtener nombre del promotor
    const promotor = promotoresData.find(p => p.numeroPromotor === numeroPromotor)
    const promotorNombre = promotor ? promotor.nombre : 'Promotor Desconocido'
    
    // Familia y producto
    const familia = familias[Math.floor(Math.random() * familias.length)]!
    const productos = productosPorFamilia[familia]
    const productoInteres = productos[Math.floor(Math.random() * productos.length)]!
    
    // Fechas
    const fechaAlta = generarFecha(2023, 2025)
    
    // Etapa (distribución: 5% No contactado, 15% Interesado, 15% Negociación, 10% Descartado, 15% Fabrica, 15% Entregado, 25% Timbrado)
    const randEtapa = Math.random()
    let etapa: EtapaOfertaCliente
    if (randEtapa < 0.05) etapa = 'No contactado'
    else if (randEtapa < 0.20) etapa = 'Interesado'
    else if (randEtapa < 0.35) etapa = 'Negociación'
    else if (randEtapa < 0.45) etapa = 'Descartado'
    else if (randEtapa < 0.60) etapa = 'Fabrica'
    else if (randEtapa < 0.75) etapa = 'Entregado'
    else etapa = 'Timbrado'
    
    // Fecha de baja solo para Descartado
    let fechaBaja: string | undefined
    if (etapa === 'Descartado') {
      fechaBaja = generarFechaPosterior(fechaAlta)
    }
    
    // Campaña
    const campaña = campañas[Math.floor(Math.random() * campañas.length)]!
    
    // Monto de la oferta
    const montoOferta = generarMontoOferta(familia)
    
    // Generar script de venta
    const descripcionOferta = generarScriptVenta(familia, productoInteres, montoOferta)
    
    // IdOportunidad para etapas avanzadas
    let idOportunidad: string | undefined
    if (['Fabrica', 'Entregado', 'Timbrado'].includes(etapa)) {
      idOportunidad = 'OP' + generarAlfanumerico(16)
    }
    
    // MontoTimbrado y FechaTimbrado solo si etapa es Timbrado
    let montoTimbrado: number | undefined
    let fechaTimbrado: string | undefined
    if (etapa === 'Timbrado') {
      // El monto timbrado puede ser igual o ligeramente diferente al monto oferta
      montoTimbrado = Math.floor(montoOferta * (0.9 + Math.random() * 0.2))
      fechaTimbrado = generarFechaPosterior(fechaAlta)
    }
    
    ofertas.push({
      idOferta,
      ide,
      numeroPromotor,
      promotorNombre,
      familiaProducto: familia,
      productoInteres,
      descripcionOferta,
      fechaAlta,
      fechaBaja,
      etapa,
      campaña,
      montoOferta,
      idOportunidad,
      montoTimbrado,
      fechaTimbrado,
    })
  }
  
  return ofertas
}

// Pre-generar datos
export const ofertasClientesData = generarOfertasClientesSimuladas(600)

// Funciones de acceso
export function obtenerOfertasClientePorIde(ide: number): OfertaCliente[] {
  return ofertasClientesData.filter(o => o.ide === ide)
}

export function obtenerOfertasClientePorFamilia(familia: FamiliaProductoCliente): OfertaCliente[] {
  return ofertasClientesData.filter(o => o.familiaProducto === familia)
}

export function obtenerOfertasClientePorEtapa(etapa: EtapaOfertaCliente): OfertaCliente[] {
  return ofertasClientesData.filter(o => o.etapa === etapa)
}

export function obtenerOfertasClienteTimbradas(): OfertaCliente[] {
  return ofertasClientesData.filter(o => o.etapa === 'Timbrado')
}

export function obtenerOfertasClienteActivas(): OfertaCliente[] {
  return ofertasClientesData.filter(o => !o.fechaBaja && o.etapa !== 'Descartado')
}
