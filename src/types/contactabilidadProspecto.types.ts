/**
 * Tipos para contactabilidad de prospectos
 */

export interface TelefonoProspecto {
  idProspecto: string
  telefono: string
}

export interface CorreoProspecto {
  idProspecto: string
  correo: string
}

export interface DireccionProspecto {
  idProspecto: string
  calle: string
  numero: string
  cp: string
  colonia: string
  municipio: string
  estado: string
}
