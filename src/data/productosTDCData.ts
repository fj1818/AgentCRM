/**
 * Generador de datos simulados para productos TDC (Tarjeta de Crédito)
 * 
 * Productos:
 * - Tarjeta Clasica: Límite máximo $50,000
 * - Tarjeta Gold: Límite máximo $200,000
 * - Tarjeta Empresarial: Límite máximo $1,000,000
 */

import type { ProductoTDC, NombreProductoTDC } from '@/types'
import { LIMITES_TDC } from '@/types/productoTDC.types'
import { clientesData } from './clientesData'

/** Lista de tipos de productos TDC disponibles */
export const tiposProductosTDC: NombreProductoTDC[] = [
  'Tarjeta Clasica',
  'Tarjeta Gold',
  'Tarjeta Empresarial',
]

/** Genera un número de línea único para TDC */
function generarNumeroLinea(): string {
  const prefijo = '4' + Math.floor(Math.random() * 9 + 1).toString() // 41-49
  let numero = ''
  for (let i = 0; i < 14; i++) {
    numero += Math.floor(Math.random() * 10).toString()
  }
  return prefijo + numero
}

/** Genera una fecha aleatoria en formato dd/mm/yyyy */
function generarFecha(añoInicio: number = 2018, añoFin: number = 2024): string {
  const año = Math.floor(Math.random() * (añoFin - añoInicio + 1)) + añoInicio
  const mes = Math.floor(Math.random() * 12) + 1
  const dia = Math.floor(Math.random() * 28) + 1
  return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${año}`
}

/** Genera datos de TDC para los clientes */
export function generarProductosTDC(): ProductoTDC[] {
  const productos: ProductoTDC[] = []
  const numerosLineaUsados = new Set<string>()

  for (const cliente of clientesData) {
    // 70% de los clientes tienen al menos una TDC
    if (Math.random() > 0.70) continue

    // Cada cliente puede tener 1-2 tarjetas
    const numTarjetas = Math.floor(Math.random() * 2) + 1
    const tarjetasAsignadas = new Set<NombreProductoTDC>()

    for (let i = 0; i < numTarjetas; i++) {
      // Seleccionar tipo de tarjeta (no repetir para mismo cliente)
      let nombreProducto: NombreProductoTDC
      
      // Personas morales tienden a empresarial, físicas a clasica/gold
      if (cliente.tipoPersona === 'Persona Moral') {
        nombreProducto = Math.random() > 0.3 ? 'Tarjeta Empresarial' : 'Tarjeta Gold'
      } else if (cliente.tipoPersona === 'Persona Fisica con Actividad Empresarial') {
        const rand = Math.random()
        nombreProducto = rand > 0.6 ? 'Tarjeta Empresarial' : rand > 0.3 ? 'Tarjeta Gold' : 'Tarjeta Clasica'
      } else {
        nombreProducto = Math.random() > 0.4 ? 'Tarjeta Gold' : 'Tarjeta Clasica'
      }

      // Evitar duplicados de mismo tipo para el cliente
      if (tarjetasAsignadas.has(nombreProducto)) continue
      tarjetasAsignadas.add(nombreProducto)

      // Generar número de línea único
      let numeroLinea: string
      do {
        numeroLinea = generarNumeroLinea()
      } while (numerosLineaUsados.has(numeroLinea))
      numerosLineaUsados.add(numeroLinea)

      // Calcular montos
      const limiteMaximo = LIMITES_TDC[nombreProducto]
      // El monto total asignado es entre 30% y 100% del límite máximo
      const montoLineaTotal = Math.round((Math.random() * 0.7 + 0.3) * limiteMaximo)
      // El monto disponible es entre 0% y 100% del total
      const porcentajeUso = Math.random() * 0.85 // Hasta 85% de uso
      const montoLineaUso = Math.round(montoLineaTotal * porcentajeUso)
      const montoLineaDisponible = montoLineaTotal - montoLineaUso

      // ~10% tienen fecha de baja
      const tieneFechaBaja = Math.random() < 0.10

      productos.push({
        ide: cliente.ide,
        numeroLinea,
        fechaAlta: generarFecha(2018, 2023),
        fechaBaja: tieneFechaBaja ? generarFecha(2023, 2024) : undefined,
        nombreProducto,
        montoLineaTotal,
        montoLineaDisponible,
        montoLineaUso,
      })
    }
  }

  return productos
}

// Pre-generar datos de TDC
export const productosTDCData = generarProductosTDC()

// Funciones de acceso
export function obtenerTDCPorIde(ide: number): ProductoTDC[] {
  return productosTDCData.filter(p => p.ide === ide)
}

export function obtenerTDCActivas(): ProductoTDC[] {
  return productosTDCData.filter(p => !p.fechaBaja)
}

export function obtenerEstadisticasTDC() {
  const total = productosTDCData.length
  const activas = productosTDCData.filter(p => !p.fechaBaja).length
  const clasica = productosTDCData.filter(p => p.nombreProducto === 'Tarjeta Clasica').length
  const gold = productosTDCData.filter(p => p.nombreProducto === 'Tarjeta Gold').length
  const empresarial = productosTDCData.filter(p => p.nombreProducto === 'Tarjeta Empresarial').length
  const montoTotalLineas = productosTDCData.reduce((sum, p) => sum + p.montoLineaTotal, 0)
  const montoTotalUso = productosTDCData.reduce((sum, p) => sum + p.montoLineaUso, 0)

  return {
    total,
    activas,
    inactivas: total - activas,
    porTipo: { clasica, gold, empresarial },
    montoTotalLineas,
    montoTotalUso,
    montoTotalDisponible: montoTotalLineas - montoTotalUso,
    porcentajeUsoPromedio: ((montoTotalUso / montoTotalLineas) * 100).toFixed(2) + '%',
  }
}
