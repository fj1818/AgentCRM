/**
 * Generador de datos simulados para productos TPV (Terminal Punto de Venta)
 * 
 * Productos:
 * - TPV Básico: Para pequeños negocios
 * - TPV Plus: Para negocios medianos
 * - TPV Premium: Para grandes comercios
 */

import type { Cliente } from '@/types'
import { clientesData } from './clientesData'

/** Tipo de producto TPV */
export type NombreProductoTPV = 'TPV Básico' | 'TPV Plus' | 'TPV Premium'

/** Estructura de un producto TPV */
export interface ProductoTPV {
  ide: number
  numeroLinea: string
  fechaAlta: string
  fechaBaja?: string
  nombreProducto: NombreProductoTPV
  saldoFacturacion: number
}

/** Lista de productos disponibles */
export const tiposProductosTPV: NombreProductoTPV[] = [
  'TPV Básico',
  'TPV Plus',
  'TPV Premium',
]

/** Genera un número de línea único para TPV (12 dígitos) */
function generarNumeroLinea(): string {
  // Prefijo TPV para distinguir
  let numero = '6'
  for (let i = 0; i < 11; i++) {
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

/** Genera saldo de facturación según tipo de producto */
function generarSaldoFacturacion(producto: NombreProductoTPV): number {
  // Rangos de facturación típicos por producto (mensual)
  const rangos = {
    'TPV Básico': { min: 10000, max: 500000 },
    'TPV Plus': { min: 200000, max: 2000000 },
    'TPV Premium': { min: 500000, max: 10000000 },
  }
  const rango = rangos[producto]
  return Math.round(Math.random() * (rango.max - rango.min) + rango.min)
}

/** Genera productos TPV para clientes con actividad empresarial */
export function generarProductosTPV(): ProductoTPV[] {
  const productos: ProductoTPV[] = []
  const numerosLineaUsados = new Set<string>()

  for (const cliente of clientesData) {
    // Solo clientes empresariales tienen TPV (~40% de PM y PFAE)
    if (cliente.tipoPersona === 'Persona Fisica') continue
    if (Math.random() > 0.4) continue

    // Cada cliente puede tener 1-3 TPV
    const numProductos = Math.floor(Math.random() * 3) + 1

    for (let i = 0; i < numProductos; i++) {
      // Seleccionar tipo de producto
      let nombreProducto: NombreProductoTPV
      
      // Personas morales tienden a TPV Premium/Plus
      if (cliente.tipoPersona === 'Persona Moral') {
        const rand = Math.random()
        nombreProducto = rand > 0.5 ? 'TPV Premium' : rand > 0.2 ? 'TPV Plus' : 'TPV Básico'
      } else {
        // PFAE tienden a TPV Básico/Plus
        nombreProducto = Math.random() > 0.6 ? 'TPV Plus' : 'TPV Básico'
      }

      // Generar número de línea único
      let numeroLinea: string
      do {
        numeroLinea = generarNumeroLinea()
      } while (numerosLineaUsados.has(numeroLinea))
      numerosLineaUsados.add(numeroLinea)

      // ~5% tienen fecha de baja
      const tieneFechaBaja = Math.random() < 0.05
      
      // Si está dado de baja, saldo es 0
      const saldoFacturacion = tieneFechaBaja ? 0 : generarSaldoFacturacion(nombreProducto)

      productos.push({
        ide: cliente.ide,
        numeroLinea,
        fechaAlta: generarFecha(2019, 2023),
        fechaBaja: tieneFechaBaja ? generarFecha(2023, 2024) : undefined,
        nombreProducto,
        saldoFacturacion,
      })
    }
  }

  return productos
}

// Pre-generar datos de TPV
export const tpvData = generarProductosTPV()

/** Estadísticas rápidas */
export function obtenerEstadisticasTPV() {
  const total = tpvData.length
  const activas = tpvData.filter(p => !p.fechaBaja).length
  const basico = tpvData.filter(p => p.nombreProducto === 'TPV Básico').length
  const plus = tpvData.filter(p => p.nombreProducto === 'TPV Plus').length
  const premium = tpvData.filter(p => p.nombreProducto === 'TPV Premium').length
  const facturacionTotal = tpvData.reduce((sum, p) => sum + p.saldoFacturacion, 0)

  return {
    total,
    activas,
    inactivas: total - activas,
    porTipo: { basico, plus, premium },
    facturacionTotal,
  }
}
