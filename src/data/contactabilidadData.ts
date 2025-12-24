/**
 * Generador de datos simulados para tablas de contactabilidad
 * - Telefonos: múltiples por IDE
 * - Correos: múltiples por IDE  
 * - Direcciones: una por IDE
 */

import type { Telefono, Correo, Direccion } from '@/types'
import { clientesData } from './clientesData'

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
  'banregio.com',
  'hey.inc',
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

/** Genera un correo aleatorio basado en nombre */
function generarCorreo(nombreCompleto: string): string {
  const partes = nombreCompleto.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z\s]/g, '')
    .split(' ')
    .filter(p => p.length > 0)
  
  const dominio = dominiosCorreo[Math.floor(Math.random() * dominiosCorreo.length)] as string
  const random = Math.floor(Math.random() * 100)
  
  // Diferentes formatos de correo
  const formatos = [
    () => `${partes[0]}.${partes[partes.length - 1]}@${dominio}`,
    () => `${partes[0]}${partes[partes.length - 1]}${random}@${dominio}`,
    () => `${partes[0]?.charAt(0) || 'u'}${partes[partes.length - 1]}@${dominio}`,
    () => `${partes[0]}${random}@${dominio}`,
  ]
  
  const formato = formatos[Math.floor(Math.random() * formatos.length)] as () => string
  return formato()
}

/** Genera un código postal mexicano (5 dígitos) */
function generarCP(): string {
  const prefijos = ['64', '66', '67', '03', '06', '11', '44', '45', '72', '76']
  const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)] as string
  const sufijo = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return prefijo + sufijo
}

/** Genera una dirección completa */
function generarDireccion(ide: number): Direccion {
  const estados = Object.keys(estadosMunicipios)
  const estado = estados[Math.floor(Math.random() * estados.length)] as string
  const municipios = estadosMunicipios[estado] as string[]
  const municipio = municipios[Math.floor(Math.random() * municipios.length)] as string
  
  return {
    ide,
    calle: calles[Math.floor(Math.random() * calles.length)] as string,
    numero: Math.floor(Math.random() * 9999 + 1).toString(),
    cp: generarCP(),
    colonia: colonias[Math.floor(Math.random() * colonias.length)] as string,
    municipio,
    estado,
  }
}

/** Genera datos de contactabilidad para todos los clientes */
export function generarDatosContactabilidad(): {
  telefonos: Telefono[]
  correos: Correo[]
  direcciones: Direccion[]
} {
  const telefonos: Telefono[] = []
  const correos: Correo[] = []
  const direcciones: Direccion[] = []

  for (const cliente of clientesData) {
    // Cada cliente tiene 1-3 teléfonos
    const numTelefonos = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numTelefonos; i++) {
      telefonos.push({
        ide: cliente.ide,
        telefono: generarTelefono(),
      })
    }

    // Cada cliente tiene 1-2 correos
    const numCorreos = Math.floor(Math.random() * 2) + 1
    for (let i = 0; i < numCorreos; i++) {
      correos.push({
        ide: cliente.ide,
        correo: generarCorreo(cliente.nombreRazonSocial),
      })
    }

    // Cada cliente tiene exactamente 1 dirección
    direcciones.push(generarDireccion(cliente.ide))
  }

  return { telefonos, correos, direcciones }
}

// Pre-generar datos
const datosContactabilidad = generarDatosContactabilidad()

export const telefonosData = datosContactabilidad.telefonos
export const correosData = datosContactabilidad.correos
export const direccionesData = datosContactabilidad.direcciones
