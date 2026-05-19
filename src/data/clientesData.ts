/**
 * Datos de clientes pre-generados (1000 registros)
 * Esta tabla permanece oculta de la UI
 * 
 * Columnas:
 * - IDE: Número de 8 cifras
 * - RFC: 12 dígitos (PM) o 13 dígitos (PF/PFAE)
 * - NombreRazonSocial: Texto hasta 500 caracteres
 * - FechaAlta: dd/mm/yyyy (obligatorio)
 * - FechaBaja: dd/mm/yyyy (opcional, ~15% tienen)
 * - TipoPersona: PM, PFAE, PF
 * - IdProspecto: 18 caracteres, inicia con "Pr"
 * - IdCliente: 18 caracteres, inicia con "Cl"
 */

import type { Cliente, TipoPersona } from '@/types'

// Nombres de empresas únicos (50+)
const nombresEmpresas = [
  'Grupo Industrial del Norte S.A. de C.V.',
  'Comercializadora Azteca S.A. de C.V.',
  'Desarrollos Inmobiliarios del Golfo S.A.P.I.',
  'Tecnología Avanzada Mexicana S.A. de C.V.',
  'Distribuidora Nacional de Alimentos S. de R.L.',
  'Constructora y Edificadora Nacional S.A.',
  'Servicios Financieros del Bajío S.A. de C.V.',
  'Importadora y Exportadora Frontera S.A.',
  'Productos Químicos Industriales S.A. de C.V.',
  'Farmacéutica Nacional S.A. de C.V.',
  'Automotriz del Pacífico S.A. de C.V.',
  'Textiles y Confecciones Monterrey S.A.',
  'Agroindustrias del Valle S.A. de C.V.',
  'Telecomunicaciones Digitales S.A.P.I.',
  'Energía Renovable México S.A. de C.V.',
  'Logística y Transporte Express S.A.',
  'Plásticos y Empaques del Norte S.A.',
  'Consultoría Empresarial Integral S.C.',
  'Alimentos Procesados del Sureste S.A.',
  'Maquinaria y Equipos Industriales S.A.',
  'Software Solutions México S.A. de C.V.',
  'Hoteles y Resorts Premium S.A.',
  'Laboratorios Clínicos Avanzados S.A.',
  'Minería y Extracción Nacional S.A.',
  'Publicidad y Marketing Digital S.A.',
]

// Nombres de personas físicas únicos (100+)
const nombresFisicos = [
  'Juan Carlos Hernández López', 'María Guadalupe Martínez García',
  'Roberto Carlos González Pérez', 'Ana Patricia Rodríguez Sánchez',
  'José Luis Ramírez Flores', 'Laura Elena Torres Morales',
  'Francisco Javier Díaz Ortiz', 'Sandra Patricia Vázquez Cruz',
  'Miguel Ángel Castro Reyes', 'Patricia Elena Ruiz Mendoza',
  'Claudia Beatriz Soto Hernández', 'Mariana Isabel Guerrero Santos',
  'Adriana Lucía Paredes Ávila', 'Carlos Eduardo Mendoza Rivas',
  'Diana Carolina Estrada Luna', 'Fernando Antonio Núñez Valdez',
  'Gabriela Alejandra Moreno Jiménez', 'Héctor Manuel Delgado Ríos',
  'Irma Yolanda Cervantes Ochoa', 'Jorge Alberto Medina Campos',
  'Karla Vanessa Aguirre Trejo', 'Luis Fernando Vargas Montes',
  'Martha Alicia Rosales Peña', 'Nicolás Arturo Salazar Ibarra',
  'Olga Lidia Fuentes Navarro', 'Pedro Ignacio Contreras Solís',
  'Raquel Adriana Guzmán Lara', 'Sergio Daniel Herrera Vega',
  'Teresa Margarita Villanueva Ramos', 'Ulises Alejandro Ponce Silva',
  'Verónica Susana Camacho León', 'Wilfrido Enrique Barrera Sandoval',
  'Ximena Paola Acosta Monroy', 'Yosef Abraham Valencia Correa',
  'Zaira Fernanda Quintero Mejía', 'Aarón Rodrigo Espinoza Duarte',
  'Beatriz Eugenia Maldonado Franco', 'César Augusto Pacheco Lozano',
  'Daniela Estefanía Bautista Márquez', 'Eduardo Rafael Cabrera Orozco',
  'Fabiola Cristina Rojas Aguilar', 'Gustavo Adolfo Miranda Santana',
  'Hilda Gabriela Téllez Cordero', 'Iván Alexander Luna Macías',
  'Jessica Paola Rangel Domínguez', 'Kevin Andrés Osorio Huerta',
  'Liliana Marisol Becerra Zamora', 'Marco Antonio Juárez Gallegos',
  'Nayeli Alejandra Olvera Cisneros', 'Omar Alejandro Cortés Benítez',
]

const tiposPersona: TipoPersona[] = [
  'Persona Moral',
  'Persona Fisica con Actividad Empresarial',
  'Persona Fisica',
]

function generarNumero(digitos: number): number {
  const min = Math.pow(10, digitos - 1)
  const max = Math.pow(10, digitos) - 1
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generarAlfanumerico(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generarRFC(tipoPersona: TipoPersona): string {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numeros = '0123456789'
  let rfc = ''
  const longitud = tipoPersona === 'Persona Moral' ? 3 : 4
  for (let i = 0; i < longitud; i++) rfc += letras.charAt(Math.floor(Math.random() * letras.length))
  for (let i = 0; i < 6; i++) rfc += numeros.charAt(Math.floor(Math.random() * numeros.length))
  for (let i = 0; i < 3; i++) rfc += (Math.random() > 0.5 ? letras : numeros).charAt(Math.floor(Math.random() * 10))
  return rfc
}

function generarFecha(añoInicio: number = 2015, añoFin: number = 2024): string {
  const año = Math.floor(Math.random() * (añoFin - añoInicio + 1)) + añoInicio
  const mes = Math.floor(Math.random() * 12) + 1
  const dia = Math.floor(Math.random() * 28) + 1
  return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${año}`
}

export function generarClientesSimulados(cantidad: number = 1000): Cliente[] {
  const clientes: Cliente[] = []
  const idsUsados = new Set<number>()
  const nombresUsados = new Set<string>()
  
  // Lista de promotores disponibles para distribución
  const promotoresDisponibles = ['023145', '034892', '045123', '056789', '067890']
  
  // Crear nombres combinados para tener suficientes nombres únicos
  const nombresBase = [...nombresFisicos]
  const apellidosExtra = ['García', 'López', 'Martínez', 'Hernández', 'González', 
    'Rodríguez', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera',
    'Gómez', 'Díaz', 'Cruz', 'Morales', 'Ortiz', 'Reyes', 'Vázquez', 'Castillo']
  
  // Generar nombres adicionales combinando base + apellido
  nombresBase.forEach(nombre => {
    apellidosExtra.forEach(apellido => {
      const nombreCompleto = nombre.split(' ').slice(0, 2).join(' ') + ' ' + apellido
      if (!nombresUsados.has(nombreCompleto)) {
        nombresBase.push(nombreCompleto)
      }
    })
  })
  
  let idxNombreFisico = 0
  let idxNombreEmpresa = 0
  
  while (clientes.length < cantidad) {
    const tipoIndex = Math.floor(Math.random() * tiposPersona.length)
    const tipoPersona = tiposPersona[tipoIndex]!
    const esMoral = tipoPersona === 'Persona Moral'
    
    // Seleccionar nombre único
    let nombreRazonSocial: string
    if (esMoral) {
      if (idxNombreEmpresa < nombresEmpresas.length) {
        nombreRazonSocial = nombresEmpresas[idxNombreEmpresa]!
        idxNombreEmpresa++
      } else {
        // Generar nombre de empresa único
        nombreRazonSocial = `Empresa ${clientes.length + 1} S.A. de C.V.`
      }
    } else {
      if (idxNombreFisico < nombresBase.length) {
        nombreRazonSocial = nombresBase[idxNombreFisico]!
        idxNombreFisico++
      } else {
        // Generar nombre único
        nombreRazonSocial = `Cliente ${clientes.length + 1}`
      }
    }
    
    // Verificar nombre único
    if (nombresUsados.has(nombreRazonSocial)) continue
    nombresUsados.add(nombreRazonSocial)
    
    const tieneFechaBaja = Math.random() < 0.15
    
    const ide = generarNumero(8)
    if (idsUsados.has(ide)) continue
    idsUsados.add(ide)
    
    // Asignar promotor: solo los primeros 20 clientes al promotor 017577
    // El resto a otros promotores aleatorios
    let numeroPromotor: string
    if (clientes.length < 20) {
      numeroPromotor = '017577'
    } else {
      // Otros promotores aleatorios para el resto
      const idxPromotor = Math.floor(Math.random() * promotoresDisponibles.length)
      numeroPromotor = promotoresDisponibles[idxPromotor]!
    }
    
    clientes.push({
      ide,
      rfc: generarRFC(tipoPersona),
      nombreRazonSocial,
      fechaAlta: generarFecha(2015, 2023),
      fechaBaja: tieneFechaBaja ? generarFecha(2023, 2024) : undefined,
      tipoPersona,
      idProspecto: 'Pr' + generarAlfanumerico(16),
      idCliente: 'Cl' + generarAlfanumerico(16),
      numeroPromotor,
    })
  }
  
  return clientes
}

// Generar 1000 clientes al cargar el módulo
export const clientesData: Cliente[] = generarClientesSimulados(1000)

// Agregar cliente específico solicitado
clientesData.unshift({
  ide: 99999999,
  rfc: 'ROVF9107314B3',
  nombreRazonSocial: 'Francisco Javier Rodríguez Valenzuela',
  fechaAlta: '16/12/2025',
  tipoPersona: 'Persona Fisica',
  idProspecto: 'Pr' + generarAlfanumerico(16),
  idCliente: 'Cl' + generarAlfanumerico(16),
  numeroPromotor: '017577'
})

// Funciones de acceso
export function obtenerTodosLosClientes(): Cliente[] {
  return clientesData
}

export function obtenerClientePorIde(ide: number): Cliente | undefined {
  return clientesData.find(c => c.ide === ide)
}

export function obtenerClientePorRfc(rfc: string): Cliente | undefined {
  return clientesData.find(c => c.rfc === rfc)
}

export function obtenerClientesPorTipo(tipo: string): Cliente[] {
  return clientesData.filter(c => c.tipoPersona === tipo)
}

export function obtenerClientesActivos(): Cliente[] {
  return clientesData.filter(c => !c.fechaBaja)
}

export function buscarClientes(termino: string): Cliente[] {
  const busqueda = termino.toLowerCase()
  return clientesData.filter(c => 
    c.nombreRazonSocial.toLowerCase().includes(busqueda) ||
    c.rfc.toLowerCase().includes(busqueda) ||
    c.ide.toString().includes(busqueda)
  )
}

export function obtenerEstadisticasClientes() {
  const total = clientesData.length
  const activos = clientesData.filter(c => !c.fechaBaja).length
  const inactivos = total - activos
  const personasMorales = clientesData.filter(c => c.tipoPersona === 'Persona Moral').length
  const personasFisicas = clientesData.filter(c => c.tipoPersona === 'Persona Fisica').length
  const pfae = clientesData.filter(c => c.tipoPersona === 'Persona Fisica con Actividad Empresarial').length

  return { total, activos, inactivos, personasMorales, personasFisicas, pfae }
}

