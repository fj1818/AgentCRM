/**
 * Tipos para tabla de productos TDC (Tarjeta de Crédito)
 */

/** Nombres de productos TDC disponibles */
export type NombreProductoTDC = 'Tarjeta Clasica' | 'Tarjeta Gold' | 'Tarjeta Empresarial'

/** Límites máximos por tipo de tarjeta */
export const LIMITES_TDC: Record<NombreProductoTDC, number> = {
  'Tarjeta Clasica': 50000,
  'Tarjeta Gold': 200000,
  'Tarjeta Empresarial': 1000000,
}

/** Tabla de productos TDC */
export interface ProductoTDC {
  /** ID del cliente */
  ide: number
  /** Número de línea único */
  numeroLinea: string
  /** Fecha de alta dd/mm/yyyy - obligatorio */
  fechaAlta: string
  /** Fecha de baja dd/mm/yyyy - opcional */
  fechaBaja?: string
  /** Nombre del producto */
  nombreProducto: NombreProductoTDC
  /** Monto total de la línea de crédito */
  montoLineaTotal: number
  /** Monto disponible (no mayor que total) */
  montoLineaDisponible: number
  /** Monto en uso (total - disponible) */
  montoLineaUso: number
}
