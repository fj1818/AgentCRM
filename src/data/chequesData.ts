/**
 * Generador de datos simulados para productos Cheques (Cuentas de Nómina)
 * 
 * Productos:
 * - NominaFlex: Cuenta flexible
 * - NominaTradicional: Cuenta tradicional
 * - NominaBasica: Cuenta básica
 */


import { clientesData } from './clientesData'

/** Tipo de producto de nómina */
export type NombreProductoCheques = 'NominaFlex' | 'NominaTradicional' | 'NominaBasica'

/** Estructura de un producto Cheques */
export interface ProductoCheques {
  ide: number
  numeroLinea: string
  fechaAlta: string
  fechaBaja?: string
  nombreProducto: NombreProductoCheques
  saldoLinea: number
}

/** Lista de productos disponibles */
export const tiposProductosCheques: NombreProductoCheques[] = [
  'NominaFlex',
  'NominaTradicional',
  'NominaBasica',
]

/** Genera un número de línea único para Cheques (12 dígitos) */
function generarNumeroLinea(): string {
  let numero = ''
  for (let i = 0; i < 12; i++) {
    numero += Math.floor(Math.random() * 10).toString()
  }
  return numero
}

/** Genera una fecha aleatoria en formato dd/mm/yyyy */
function generarFecha(añoInicio: number, añoFin: number): string {
  const año = Math.floor(Math.random() * (añoFin - añoInicio + 1)) + añoInicio
  const mes = Math.floor(Math.random() * 12) + 1
  const dia = Math.floor(Math.random() * 28) + 1
  return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${año}`
}

/** Genera saldo aleatorio según tipo de producto */
function generarSaldo(producto: NombreProductoCheques): number {
  // Rangos de saldo típicos por producto
  const rangos = {
    'NominaFlex': { min: 50000, max: 5000000 },
    'NominaTradicional': { min: 20000, max: 2000000 },
    'NominaBasica': { min: 5000, max: 500000 },
  }
  const rango = rangos[producto]
  return Math.round(Math.random() * (rango.max - rango.min) + rango.min)
}

/** Genera productos de Cheques para todos los clientes */
export function generarProductosCheques(): ProductoCheques[] {
  const productos: ProductoCheques[] = []
  const numerosLineaUsados = new Set<string>()

  for (const cliente of clientesData) {
    // ~60% de clientes tienen cuenta de cheques
    if (Math.random() > 0.6) continue

    // Cada cliente puede tener 1-2 productos de cheques
    const numProductos = Math.random() > 0.7 ? 2 : 1
    const productosAsignados = new Set<NombreProductoCheques>()

    for (let i = 0; i < numProductos; i++) {
      // Seleccionar tipo de producto
      let nombreProducto: NombreProductoCheques
      
      // Personas morales tienden a NominaFlex, físicas a Tradicional/Basica
      if (cliente.tipoPersona === 'Persona Moral') {
        nombreProducto = Math.random() > 0.3 ? 'NominaFlex' : 'NominaTradicional'
      } else if (cliente.tipoPersona === 'Persona Fisica con Actividad Empresarial') {
        const rand = Math.random()
        nombreProducto = rand > 0.6 ? 'NominaFlex' : rand > 0.3 ? 'NominaTradicional' : 'NominaBasica'
      } else {
        nombreProducto = Math.random() > 0.4 ? 'NominaTradicional' : 'NominaBasica'
      }

      // Evitar duplicados de mismo tipo
      if (productosAsignados.has(nombreProducto)) continue
      productosAsignados.add(nombreProducto)

      // Generar número de línea único
      let numeroLinea: string
      do {
        numeroLinea = generarNumeroLinea()
      } while (numerosLineaUsados.has(numeroLinea))
      numerosLineaUsados.add(numeroLinea)

      // ~8% tienen fecha de baja
      const tieneFechaBaja = Math.random() < 0.08
      
      // Si está dado de baja, saldo es 0
      const saldoLinea = tieneFechaBaja ? 0 : generarSaldo(nombreProducto)

      productos.push({
        ide: cliente.ide,
        numeroLinea,
        fechaAlta: generarFecha(2018, 2023),
        fechaBaja: tieneFechaBaja ? generarFecha(2023, 2024) : undefined,
        nombreProducto,
        saldoLinea,
      })
    }
  }

  return productos
}

// Pre-generar datos de Cheques
export const chequesData = generarProductosCheques()

/** Estadísticas rápidas */
export function obtenerEstadisticasCheques() {
  const total = chequesData.length
  const activas = chequesData.filter(p => !p.fechaBaja).length
  const flex = chequesData.filter(p => p.nombreProducto === 'NominaFlex').length
  const tradicional = chequesData.filter(p => p.nombreProducto === 'NominaTradicional').length
  const basica = chequesData.filter(p => p.nombreProducto === 'NominaBasica').length
  const saldoTotal = chequesData.reduce((sum, p) => sum + p.saldoLinea, 0)

  return {
    total,
    activas,
    inactivas: total - activas,
    porTipo: { flex, tradicional, basica },
    saldoTotal,
  }
}
