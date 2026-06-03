/**
 * Tipos para la entidad OfertaCliente
 */

export type FamiliaProductoCliente = 'TDC' | 'TPV' | 'Cheques' | 'Crédito' | 'Seguros' | 'Nómina'

export type EtapaOfertaCliente = 
  | 'No contactado'
  | 'Interesado'
  | 'Negociación'
  | 'Descartado'
  | 'Fabrica'
  | 'Entregado'
  | 'Timbrado'

export type CampañaOrigenCliente = 
  | 'Referencia Propia'
  | 'Pagina Web'
  | 'App'
  | 'Portal'
  | 'Campaña Clientes Preferentes 2026'
  | 'Campaña Upgrade TDC'
  | 'Campaña Cross-Sell PyMEs'
  | 'Campaña Fidelización Premium'

export interface OfertaCliente {
  /** ID de la oferta: 18 caracteres que inician con "OC" */
  idOferta: string
  /** IDE del cliente (FK a tabla clientes) */
  ide: number
  /** Número de promotor asignado (FK a tabla promotores) */
  numeroPromotor: string
  /** Nombre del promotor asignado (Desnormalizado para visualización) */
  promotorNombre: string
  /** Familia de producto: TDC, TPV, Cheques */
  familiaProducto: FamiliaProductoCliente
  /** Nombre específico del producto según la familia */
  productoInteres: string
  /** Descripción / Script de venta de la oferta */
  descripcionOferta: string
  /** Fecha de alta de la oferta dd/mm/yyyy */
  fechaAlta: string
  /** Fecha de baja/descarte dd/mm/yyyy (opcional) */
  fechaBaja?: string
  /** Etapa actual de la oferta */
  etapa: EtapaOfertaCliente
  /** Campaña de origen */
  campaña: CampañaOrigenCliente
  /** Monto de la oferta */
  montoOferta: number
  /** ID de oportunidad: 18 caracteres que inician con "OP" si aplica */
  idOportunidad?: string
  /** Monto timbrado (solo si etapa = Timbrado) */
  montoTimbrado?: number
  /** Fecha de timbrado dd/mm/yyyy (solo si etapa = Timbrado) */
  fechaTimbrado?: string
}
