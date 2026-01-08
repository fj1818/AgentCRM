/**
 * Tipos para la entidad Promotor
 */

export type BancoPromotor = 'Banregio' | 'Hey'

export type TerritorioPromotor = 
  | 'Noroeste'
  | 'Noreste' 
  | 'Sur'
  | 'Centro'
  | 'Centro Occidente'

export type SucursalBanregio = 'Sucursal 1' | 'Sucursal 2' | 'Sucursal 3'
export type EquipoHey = 'Hey Brokers' | 'Hey Negocios' | 'Hey Pago'
export type SucursalEquipo = SucursalBanregio | EquipoHey

export interface Promotor {
  /** Número de 6 dígitos con padding de ceros (ej: "017577") */
  numeroPromotor: string
  /** Nombre completo del promotor */
  nombre: string
  /** Fecha en formato dd/mm/yyyy */
  fechaAlta: string
  /** Fecha en formato dd/mm/yyyy - opcional */
  fechaBaja?: string
  /** false si tiene fechaBaja */
  activo: boolean
  /** Banregio o Hey */
  banco: BancoPromotor
  /** Región geográfica */
  territorio: TerritorioPromotor
  /** Municipio/Estado */
  region: string
  /** Sucursal (Banregio) o Equipo (Hey) */
  sucursalEquipo: SucursalEquipo
}
