/**
 * Generador de datos simulados para tablas de contactabilidad de prospectos
 * - TelefonosProspecto: múltiples por IdProspecto
 * - CorreosProspecto: múltiples por IdProspecto  
 * - DireccionesProspecto: una por IdProspecto
 */

import type { TelefonoProspecto, CorreoProspecto, DireccionProspecto } from '@/types/contactabilidadProspecto.types'
import { prospectosData } from './prospectosData'

// Dominios de correo comunes en México
const dominiosCorreo = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com.mx',
  'live.com.mx',
  'prodigy.net.mx',
  'empresa.com.mx',
  'corporativo.mx',
]

// Colonias comunes por estado
const colonias = [
  'Centro', 'Del Valle', 'Roma Norte', 'Condesa', 'Polanco',
  'Cumbres', 'Mitras', 'Contry', 'San Jerónimo', 'Obispado',
  'Lomas de Chapultepec', 'Santa Fe', 'Satélite', 'Las Águilas',
  'Jardines de la Paz', 'Industrial', 'Tecnológico', 'Universidad',
  'Bosques', 'Residencial', 'Vista Hermosa', 'San Pedro', 'La Purísima',
]

// Estados de México con sus municipios principales
const estadosMunicipios: Record<string, string[]> = {
  'Nuevo León': ['Monterrey', 'San Pedro Garza García', 'San Nicolás de los Garza', 'Guadalupe', 'Apodaca', 'Santa Catarina'],
  'Ciudad de México': ['Álvaro Obregón', 'Benito Juárez', 'Coyoacán', 'Cuauhtémoc', 'Miguel Hidalgo', 'Tlalpan'],
  'Jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá', 'Tlajomulco'],
  'Estado de México': ['Naucalpan', 'Tlalnepantla', 'Ecatepec', 'Huixquilucan', 'Metepec', 'Toluca'],
  'Coahuila': ['Saltillo', 'Torreón', 'Monclova', 'Piedras Negras', 'Ramos Arizpe'],
  'Tamaulipas': ['Tampico', 'Reynosa', 'Matamoros', 'Nuevo Laredo', 'Ciudad Victoria'],
  'Guanajuato': ['León', 'Irapuato', 'Celaya', 'Salamanca', 'Guanajuato'],
  'Querétaro': ['Querétaro', 'San Juan del Río', 'El Marqués', 'Corregidora'],
  'Puebla': ['Puebla', 'Tehuacán', 'San Andrés Cholula', 'San Pedro Cholula'],
  'Veracruz': ['Veracruz', 'Xalapa', 'Coatzacoalcos', 'Córdoba', 'Boca del Río'],
}

// Calles comunes
const calles = [
  'Av. Constitución', 'Av. Juárez', 'Calle Hidalgo', 'Blvd. Díaz Ordaz',
  'Av. Revolución', 'Calle Morelos', 'Av. Universidad', 'Calle 5 de Mayo',
  'Av. Insurgentes', 'Blvd. Adolfo López Mateos', 'Calle Madero', 'Av. Reforma',
  'Calle Zaragoza', 'Av. Venustiano Carranza', 'Blvd. Tecnológico',
  'Calle Allende', 'Av. Lázaro Cárdenas', 'Calle Independencia',
  'Av. Cuauhtémoc', 'Blvd. Antonio L. Rodríguez', 'Calle Guerrero',
]

// Nombres de prospectos para generar correos
const nombresProspectos = [
  'Carlos Mendez', 'Ana Garcia', 'Luis Rodriguez', 'Maria Lopez',
  'Pedro Sanchez', 'Laura Martinez', 'Jorge Hernandez', 'Patricia Gonzalez',
  'Miguel Torres', 'Carmen Flores', 'Jose Ramirez', 'Rosa Diaz',
]

/** Genera un teléfono mexicano aleatorio (10 dígitos) */
function generarTelefono(): string {
  const ladas = ['81', '55', '33', '442', '844', '656', '664', '614', '999', '477']
  const lada = ladas[Math.floor(Math.random() * ladas.length)] as string
  let numero = ''
  for (let i = 0; i < 10 - lada.length; i++) {
    numero += Math.floor(Math.random() * 10).toString()
  }
  return lada + numero
}

/** Genera un correo aleatorio */
function generarCorreo(idx: number): string {
  const nombre = nombresProspectos[idx % nombresProspectos.length]!
  const partes = nombre.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z\s]/g, '')
    .split(' ')
    .filter(p => p.length > 0)
  
  const dominio = dominiosCorreo[Math.floor(Math.random() * dominiosCorreo.length)] as string
  const random = Math.floor(Math.random() * 100)
  
  return `${partes[0]}.${partes[partes.length - 1]}${random}@${dominio}`
}

/** Genera un código postal mexicano (5 dígitos) */
function generarCP(): string {
  const prefijos = ['64', '66', '67', '03', '06', '11', '44', '45', '72', '76']
  const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)] as string
  const sufijo = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return prefijo + sufijo
}

/** Genera una dirección completa para prospecto */
function generarDireccionProspecto(idProspecto: string): DireccionProspecto {
  const estados = Object.keys(estadosMunicipios)
  const estado = estados[Math.floor(Math.random() * estados.length)] as string
  const municipios = estadosMunicipios[estado] as string[]
  const municipio = municipios[Math.floor(Math.random() * municipios.length)] as string
  
  return {
    idProspecto,
    calle: calles[Math.floor(Math.random() * calles.length)] as string,
    numero: Math.floor(Math.random() * 9999 + 1).toString(),
    cp: generarCP(),
    colonia: colonias[Math.floor(Math.random() * colonias.length)] as string,
    municipio,
    estado,
  }
}

/** Genera datos de contactabilidad para todos los prospectos */
export function generarDatosContactabilidadProspectos(): {
  telefonosProspecto: TelefonoProspecto[]
  correosProspecto: CorreoProspecto[]
  direccionesProspecto: DireccionProspecto[]
} {
  const telefonosProspecto: TelefonoProspecto[] = []
  const correosProspecto: CorreoProspecto[] = []
  const direccionesProspecto: DireccionProspecto[] = []

  prospectosData.forEach((prospecto, idx) => {
    // Cada prospecto tiene 1-2 teléfonos
    const numTelefonos = Math.floor(Math.random() * 2) + 1
    for (let i = 0; i < numTelefonos; i++) {
      telefonosProspecto.push({
        idProspecto: prospecto.idProspecto,
        telefono: generarTelefono(),
      })
    }

    // Cada prospecto tiene 1 correo
    correosProspecto.push({
      idProspecto: prospecto.idProspecto,
      correo: generarCorreo(idx),
    })

    // Cada prospecto tiene exactamente 1 dirección
    direccionesProspecto.push(generarDireccionProspecto(prospecto.idProspecto))
  })

  return { telefonosProspecto, correosProspecto, direccionesProspecto }
}

// Pre-generar datos
const datosContactabilidadProspectos = generarDatosContactabilidadProspectos()

export const telefonosProspectoData = datosContactabilidadProspectos.telefonosProspecto
export const correosProspectoData = datosContactabilidadProspectos.correosProspecto
export const direccionesProspectoData = datosContactabilidadProspectos.direccionesProspecto
