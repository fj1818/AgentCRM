/**
 * Datos de prospectos pre-generados
 * 
 * Columnas:
 * - IdProspecto: 18 caracteres ("Pr" + 16 alfanuméricos)
 * - FechaAlta: dd/mm/yyyy
 * - FechaConversion: dd/mm/yyyy (opcional, cuando se convierte a cliente)
 * - IDE: número de 8 cifras (solo si se convirtió a cliente)
 */

import type { Prospecto, TipoPersonaProspecto } from '@/types/prospecto.types'
import { clientesData } from './clientesData'

const tiposPersona: TipoPersonaProspecto[] = [
  'Persona Moral',
  'Persona Fisica con Actividad Empresarial',
  'Persona Fisica',
]

function generarAlfanumerico(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generarRFC(tipoPersona: TipoPersonaProspecto): string {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numeros = '0123456789'
  let rfc = ''
  
  // Persona Moral: 12 caracteres (3 letras + 6 números + 3 alfanuméricos)
  // Persona Física: 13 caracteres (4 letras + 6 números + 3 alfanuméricos)
  const longitud = tipoPersona === 'Persona Moral' ? 3 : 4
  
  for (let i = 0; i < longitud; i++) {
    rfc += letras.charAt(Math.floor(Math.random() * letras.length))
  }
  for (let i = 0; i < 6; i++) {
    rfc += numeros.charAt(Math.floor(Math.random() * numeros.length))
  }
  for (let i = 0; i < 3; i++) {
    rfc += (Math.random() > 0.5 ? letras : numeros).charAt(Math.floor(Math.random() * 10))
  }
  return rfc
}

function generarFecha(añoInicio: number = 2015, añoFin: number = 2024): string {
  const año = Math.floor(Math.random() * (añoFin - añoInicio + 1)) + añoInicio
  const mes = Math.floor(Math.random() * 12) + 1
  const dia = Math.floor(Math.random() * 28) + 1
  return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${año}`
}

function generarFechaPosterior(fechaBase: string): string {
  // Parsear fecha base
  const partes = fechaBase.split('/')
  const diaBase = parseInt(partes[0]!)
  const mesBase = parseInt(partes[1]!)
  const añoBase = parseInt(partes[2]!)
  
  // Agregar entre 1 y 12 meses
  let nuevoMes = mesBase + Math.floor(Math.random() * 12) + 1
  let nuevoAño = añoBase
  
  while (nuevoMes > 12) {
    nuevoMes -= 12
    nuevoAño++
  }
  
  // Limitar a 2024
  if (nuevoAño > 2024) {
    nuevoAño = 2024
    nuevoMes = 12
  }
  
  const nuevoDia = Math.min(diaBase, 28)
  return `${nuevoDia.toString().padStart(2, '0')}/${nuevoMes.toString().padStart(2, '0')}/${nuevoAño}`
}

export function generarProspectosSimulados(cantidad: number = 500): Prospecto[] {
  const prospectos: Prospecto[] = []
  const idsUsados = new Set<string>()
  
  // Obtener IDEs de clientes existentes para vincular
  const idesClientes = clientesData.map(c => c.ide)
  let idxCliente = 0
  
  while (prospectos.length < cantidad) {
    // Generar IdProspecto único
    let idProspecto: string
    do {
      idProspecto = 'Pr' + generarAlfanumerico(16)
    } while (idsUsados.has(idProspecto))
    idsUsados.add(idProspecto)
    
    // Tipo de persona aleatorio
    const tipoPersona = tiposPersona[Math.floor(Math.random() * tiposPersona.length)]!
    const rfc = generarRFC(tipoPersona)
    
    const fechaAlta = generarFecha(2015, 2023)
    
    // ~70% de los prospectos se convierten a clientes
    const seConvierte = Math.random() < 0.70
    
    let fechaConversion: string | undefined
    let ide: number | undefined
    
    if (seConvierte && idxCliente < idesClientes.length) {
      fechaConversion = generarFechaPosterior(fechaAlta)
      ide = idesClientes[idxCliente]
      idxCliente++
    }
    
    prospectos.push({
      idProspecto,
      rfc,
      tipoPersona,
      fechaAlta,
      fechaConversion,
      ide,
    })
  }
  
  return prospectos
}

// Pre-generar datos de prospectos
export const prospectosData = generarProspectosSimulados(500)

// Funciones de acceso
export function obtenerProspectoPorId(idProspecto: string): Prospecto | undefined {
  return prospectosData.find(p => p.idProspecto === idProspecto)
}

export function obtenerProspectosConvertidos(): Prospecto[] {
  return prospectosData.filter(p => p.ide !== undefined)
}

export function obtenerProspectosPendientes(): Prospecto[] {
  return prospectosData.filter(p => p.ide === undefined)
}

export function obtenerProspectoPorIde(ide: number): Prospecto | undefined {
  return prospectosData.find(p => p.ide === ide)
}
