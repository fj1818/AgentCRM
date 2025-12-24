/**
 * Tipos para tablas de contactabilidad
 */

/** Tabla de Teléfonos - Un IDE puede tener múltiples teléfonos */
export interface Telefono {
  ide: number
  telefono: string
}

/** Tabla de Correos - Un IDE puede tener múltiples correos */
export interface Correo {
  ide: number
  correo: string
}

/** Tabla de Direcciones - Un IDE solo puede tener UNA dirección */
export interface Direccion {
  ide: number
  calle: string
  numero: string
  cp: string
  colonia: string
  municipio: string
  estado: string
}

/** Estado de las tablas de contactabilidad */
export interface ContactabilidadState {
  telefonos: Telefono[]
  correos: Correo[]
  direcciones: Direccion[]
}
