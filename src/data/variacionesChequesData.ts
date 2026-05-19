/**
 * Generador de datos simulados para Variaciones de Cheques (Movimientos)
 * 
 * Esta tabla registra los movimientos de entrada/salida en cuentas de cheques
 * para análisis de variaciones:
 * - Clientes con ingresos > 2,000,000
 * - Clientes con egresos > 50,000 en una semana
 * - Patrones de movimientos
 */

import { chequesData } from './chequesData'

/** Estructura de un movimiento de cheques */
export interface VariacionCheque {
  ide: number
  numeroLinea: string
  fechaMovimiento: string
  montoAnterior: number
  montoActual: number
  montoMovimiento: number
}

/** Genera una fecha aleatoria en un rango de días desde hoy - formato ISO yyyy-mm-dd */
function generarFechaReciente(diasAtras: number): string {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - Math.floor(Math.random() * diasAtras))
  const año = fecha.getFullYear()
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0')
  const dia = fecha.getDate().toString().padStart(2, '0')
  // Formato ISO para SQL: yyyy-mm-dd
  return `${año}-${mes}-${dia}`
}

/** Genera variaciones/movimientos para las cuentas de cheques activas */
export function generarVariacionesCheques(): VariacionCheque[] {
  const variaciones: VariacionCheque[] = []
  
  // Solo cuentas activas
  const cuentasActivas = chequesData.filter(c => !c.fechaBaja)
  
  for (const cuenta of cuentasActivas) {
    // Cada cuenta tiene entre 5-30 movimientos en los últimos 90 días
    const numMovimientos = Math.floor(Math.random() * 26) + 5
    
    // Saldo inicial (mayor que el actual para permitir movimientos)
    let saldoActual = cuenta.saldoLinea * (1 + Math.random() * 0.5)
    
    // Generar movimientos ordenados por fecha (más reciente primero)
    const fechasUsadas: string[] = []
    
    for (let i = 0; i < numMovimientos; i++) {
      // Generar fecha única de movimiento (últimos 90 días)
      let fechaMovimiento: string
      do {
        fechaMovimiento = generarFechaReciente(90)
      } while (fechasUsadas.includes(fechaMovimiento) && fechasUsadas.length < 80)
      fechasUsadas.push(fechaMovimiento)
      
      // Decidir si es ingreso o egreso
      const esIngreso = Math.random() > 0.45
      
      // Generar monto del movimiento
      let montoMovimiento: number
      
      if (esIngreso) {
        // Ingresos: algunos muy grandes (>2M) para consultas de variación
        if (Math.random() < 0.05) {
          // 5% de movimientos son ingresos grandes (>2M)
          montoMovimiento = Math.round(Math.random() * 8000000 + 2000000)
        } else if (Math.random() < 0.15) {
          // 15% ingresos medianos (500K - 2M)
          montoMovimiento = Math.round(Math.random() * 1500000 + 500000)
        } else {
          // Resto ingresos pequeños (1K - 500K)
          montoMovimiento = Math.round(Math.random() * 499000 + 1000)
        }
      } else {
        // Egresos: algunos grandes (>50K) para consultas de variación
        if (Math.random() < 0.2) {
          // 20% de egresos son grandes (>50K)
          montoMovimiento = -Math.round(Math.random() * 450000 + 50000)
        } else {
          // Resto egresos pequeños (100 - 50K)
          montoMovimiento = -Math.round(Math.random() * 49900 + 100)
        }
      }
      
      // Calcular saldos
      const montoAnterior = saldoActual
      const montoActualNuevo = Math.max(0, montoAnterior + montoMovimiento)
      
      variaciones.push({
        ide: cuenta.ide,
        numeroLinea: cuenta.numeroLinea,
        fechaMovimiento,
        montoAnterior: Math.round(montoAnterior),
        montoActual: Math.round(montoActualNuevo),
        montoMovimiento: Math.round(montoMovimiento),
      })
      
      // Actualizar saldo para siguiente movimiento
      saldoActual = montoActualNuevo
    }
  }
  
  return variaciones
}

// Pre-generar datos de variaciones
export const variacionesChequesData = generarVariacionesCheques()

/** Estadísticas rápidas */
export function obtenerEstadisticasVariaciones() {
  const total = variacionesChequesData.length
  const ingresos = variacionesChequesData.filter(v => v.montoMovimiento > 0)
  const egresos = variacionesChequesData.filter(v => v.montoMovimiento < 0)
  const ingresosGrandes = ingresos.filter(v => v.montoMovimiento >= 2000000)
  const egresosGrandes = egresos.filter(v => v.montoMovimiento <= -50000)
  
  return {
    totalMovimientos: total,
    totalIngresos: ingresos.length,
    totalEgresos: egresos.length,
    ingresosGrandes2M: ingresosGrandes.length,
    egresosGrandes50K: egresosGrandes.length,
    montoTotalIngresos: ingresos.reduce((sum, v) => sum + v.montoMovimiento, 0),
    montoTotalEgresos: Math.abs(egresos.reduce((sum, v) => sum + v.montoMovimiento, 0)),
  }
}
