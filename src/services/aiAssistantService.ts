/**
 * Servicio del Asistente IA con Arquitectura SQL
 * 
 * Flujo:
 * 1. Usuario hace pregunta en lenguaje natural
 * 2. AGENTE 1: Genera SQL + metadatos de presentación
 * 3. SQL se ejecuta en SQLite local (sql.js)
 * 4. AGENTE 2: Formatea el resultado (opcional)
 * 5. Resultado se presenta como texto/tabla/gráfico
 */

import { ejecutarSQL, inicializarBaseDatos, type SQLResult } from './sqlDatabaseService'

// Webhooks de n8n para arquitectura dual-agent
const WEBHOOK_SQL_GENERATOR = 'https://abrahamnavarrete.app.n8n.cloud/webhook/regio-ia-assistant'
const WEBHOOK_PRESENTATION = 'https://abrahamnavarrete.app.n8n.cloud/webhook/presenter'

/** Respuesta del Agente SQL Generator */
interface SQLGeneratorResponse {
  sql: string
  explicacion: string
  tablas_usadas: string[]
  tipo_consulta: 'agregacion' | 'listado' | 'cruce' | 'tendencia'
  error?: string
}

/** Respuesta del Agente de Presentación */
interface PresentationResponse {
  formato: 'texto' | 'tabla' | 'grafico_bar' | 'grafico_pie' | 'grafico_line' | 'grafico_polar' | 'multi_grafico'
  titulo: string
  subtitulo?: string
  ejeX?: string
  ejeY?: string
  configuracion_adicional?: {
    mostrar_totales?: boolean
    ordenar_por?: string
    limite_registros?: number
    graficos_adicionales?: {
      tipo: string
      ejeX: string
      ejeY: string
      titulo: string
    }[]
  }
  mensaje_interpretacion: string
}

/** Respuesta procesada para el chat */
export interface AIResponse {
  respuesta: string
  tipo: 'texto' | 'tabla' | 'grafico_pie' | 'grafico_bar' | 'grafico_column' | 'grafico_line' | 'grafico_polar' | 'multi_tabla'
  datos?: Record<string, unknown>[]
  columnas?: string[]
  grafico?: {
    tipo: 'pie' | 'bar' | 'line' | 'column' | 'polar'
    titulo: string
    datos: { x: string; value: number }[]
  }
  tabla?: {
    columnas: string[]
    filas: Record<string, unknown>[]
    titulo?: string
    paginate?: boolean
    pageSize?: number
  }
  tablas?: {
    titulo: string
    datos: Record<string, unknown>[]
    columnas: string[]
  }[]
  error?: string
  sql?: string
}

/**
 * Parsea respuesta JSON genérica del agente
 */
function parsearJSON<T>(texto: string): T | null {
  try {
    let jsonStr = texto.trim()
    
    // Remover marcadores de código markdown
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7)
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3)
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3)
    }
    jsonStr = jsonStr.trim()
    
    // Buscar JSON en el texto
    if (!jsonStr.startsWith('{') && !jsonStr.startsWith('[')) {
      const startIdx = jsonStr.indexOf('{')
      const endIdx = jsonStr.lastIndexOf('}')
      
      if (startIdx !== -1 && endIdx > startIdx) {
        jsonStr = jsonStr.slice(startIdx, endIdx + 1)
      }
    }
    
    return JSON.parse(jsonStr) as T
  } catch (error) {
    console.error('Error parseando JSON:', error, '\nTexto:', texto)
    return null
  }
}

/**
 * Envía pregunta al Agente SQL Generator
 */
async function enviarAAgenteSQL(pregunta: string, sessionId: string): Promise<SQLGeneratorResponse | SQLGeneratorResponse[] | null> {
  try {
    console.log('📤 [SQL Generator] Enviando pregunta:', pregunta)
    
    const response = await fetch(WEBHOOK_SQL_GENERATOR, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatInput: pregunta,
        sessionId,
        timestamp: new Date().toISOString(),
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📦 [SQL Generator] Respuesta:', data)
    
    const textoRespuesta = data.output || data.text || data.response || JSON.stringify(data)
    const parsed = parsearJSON<SQLGeneratorResponse>(textoRespuesta)
    
    console.log('✅ [SQL Generator] Parseado:', parsed)
    return parsed
  } catch (error) {
    console.error('❌ [SQL Generator] Error:', error)
    return null
  }
}

/**
 * Envía datos al Agente de Presentación
 */
async function enviarAAgentePresentation(
  preguntaOriginal: string,
  datosSQL: Record<string, unknown>[],
  columnas: string[],
  sessionId: string
): Promise<PresentationResponse | null> {
  try {
    console.log('📤 [Presentation] Enviando datos para análisis')
    console.log('🔗 [Presentation] URL:', WEBHOOK_PRESENTATION)
    console.log('📊 [Presentation] Total registros:', datosSQL.length)
    
    const payload = {
      preguntaOriginal,
      datosSQL,
      columnas,
      sessionId,
    }
    
    console.log('📦 [Presentation] Payload:', JSON.stringify(payload, null, 2).substring(0, 500) + '...')
    
    const response = await fetch(WEBHOOK_PRESENTATION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    
    console.log('📥 [Presentation] Status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Presentation] Error del servidor:', response.status, errorText)
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log('📦 [Presentation] Respuesta completa:', JSON.stringify(data, null, 2))
    
    const textoRespuesta = data.output || data.text || data.response || JSON.stringify(data)
    const parsed = parsearJSON<PresentationResponse>(textoRespuesta)
    
    console.log('✅ [Presentation] Parseado:', parsed)
    return parsed
  } catch (error) {
    console.error('❌ [Presentation] Error completo:', error)
    console.error('❌ [Presentation] Error tipo:', error instanceof Error ? error.message : String(error))
    
    // Si es error de red, ser más específico
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 [Presentation] Error de red - el webhook probablemente no está configurado o no es accesible')
    }
    
    return null
  }
}

/**
 * Aplica reglas de privacidad a los datos según las políticas del banco
 */
function aplicarReglasPrivacidad(
  datos: Record<string, unknown>[],
  columnas: string[]
): { datos: Record<string, unknown>[]; columnas: string[] } {
  if (datos.length === 0) return { datos, columnas }
  
  // 1. Detectar si hay columnas financieras
  const columnasFinancieras = columnas.filter(col => {
    const colLower = col.toLowerCase()
    return colLower.includes('monto') ||
           colLower.includes('saldo') ||
           colLower.includes('valor') ||
           colLower.includes('total') ||
           colLower.includes('cantidad') && datos[0] && typeof datos[0][col] === 'number' && (datos[0][col] as number) > 100 ||
           colLower.includes('linea') && colLower.includes('total') ||
           colLower.includes('credito') ||
           colLower.includes('deuda') ||
           colLower.includes('pago')
  })
  
  const hayDatosFinancieros = columnasFinancieras.length > 0
  
  console.log('🔒 [Privacidad] Columnas financieras detectadas:', columnasFinancieras)
  console.log('🔒 [Privacidad] Hay datos financieros:', hayDatosFinancieros)
  
  // 2. Detectar si hay columna IDE disponible
  const tieneIDE = columnas.some(col => col.toLowerCase() === 'ide' || col.toLowerCase() === 'id')
  
  // 3. Filtrar columnas - Reglas de IDs
  let columnasFilterdas = columnas.filter(col => {
    const colLower = col.toLowerCase()
    
    // Si hay datos financieros y tenemos IDE, MANTENER IDE
    if (hayDatosFinancieros && (colLower === 'ide' || colLower === 'id')) {
      return true
    }
    
    // Si NO hay datos financieros, nunca mostrar IDs
    if (!hayDatosFinancieros && (colLower === 'id' || colLower === 'ide' || colLower === 'idcliente' || colLower === 'idpromotor')) {
      return false
    }
    
    return true
  })
  
  // 4. Si hay datos financieros, ocultar información personal identificable (PII)
  if (hayDatosFinancieros) {
    console.log('🔒 [Privacidad] Ocultando PII por datos financieros')
    columnasFilterdas = columnasFilterdas.filter(col => {
      const colLower = col.toLowerCase()
      
      // Mantener IDE
      if (colLower === 'ide' || colLower === 'id') {
        return true
      }
      
      // Ocultar: nombres, teléfonos, direcciones, correos, RFC
      return !colLower.includes('nombre') &&
             !colLower.includes('telefono') &&
             !colLower.includes('tel') &&
             !colLower.includes('celular') &&
             !colLower.includes('direccion') &&
             !colLower.includes('calle') &&
             !colLower.includes('colonia') &&
             !colLower.includes('ciudad') &&
             !colLower.includes('estado') &&
             !colLower.includes('cp') &&
             !colLower.includes('correo') &&
             !colLower.includes('email') &&
             !colLower.includes('rfc')
    })
  }
  
  // 5. Renombrar "id"/"ide" a "IDE"
  columnasFilterdas = columnasFilterdas.map(col => {
    if (col.toLowerCase() === 'id' || col.toLowerCase() === 'ide') return 'IDE'
    return col
  })
  
  // 6. Filtrar datos para mantener solo las columnas permitidas
  const datosFiltrados = datos.map(row => {
    const newRow: Record<string, unknown> = {}
    columnasFilterdas.forEach(col => {
      // Mapear columna original (puede ser "id", "ide", etc.)
      const colOriginal = columnas.find(c => c.toLowerCase() === col.toLowerCase()) || col
      newRow[col] = row[colOriginal]
    })
    return newRow
  })
  
  console.log('🔒 [Privacidad] Columnas originales:', columnas)
  console.log('🔒 [Privacidad] Columnas filtradas:', columnasFilterdas)
  
  return {
    datos: datosFiltrados,
    columnas: columnasFilterdas
  }
}

/**
 * Formatea el resultado según decisión del Agente de Presentación
 */
function formatearConPresentacion(
  resultado: SQLResult,
  presentation: PresentationResponse
): AIResponse {
  let { datos, columnas } = resultado
  
  // Aplicar reglas de privacidad SOLO para tablas
  // Los gráficos usan datos originales porque ya muestran categorías, no detalles individuales
  const privacyResult = aplicarReglasPrivacidad(datos, columnas)
  const datosTablaPrivados = privacyResult.datos
  const columnasTablaPrivadas = privacyResult.columnas
  
  // Texto simple
  if (presentation.formato === 'texto') {
    return {
      respuesta: presentation.mensaje_interpretacion,
      tipo: 'texto',
      datos,
      sql: resultado.sql,
    }
  }
  
  // Tabla - USA DATOS FILTRADOS
  if (presentation.formato === 'tabla') {
    const PAGINATION_THRESHOLD = 20
    const shouldPaginate = datosTablaPrivados.length > PAGINATION_THRESHOLD
    
    console.log(`📊 [Tabla] Total registros: ${datosTablaPrivados.length}, Paginación: ${shouldPaginate ? 'SÍ' : 'NO'}`)
    
    return {
      respuesta: presentation.mensaje_interpretacion,
      tipo: 'tabla',
      datos: datosTablaPrivados,
      tabla: {
        columnas: columnasTablaPrivadas,
        filas: datosTablaPrivados,
        titulo: presentation.titulo,
        paginate: shouldPaginate,
        pageSize: shouldPaginate ? 20 : undefined,
      },
      sql: resultado.sql,
    }
  }
  
  // Gráfico - USA DATOS ORIGINALES (sin filtro de privacidad)
  if (presentation.formato.startsWith('grafico_')) {
    const tipoGrafico = presentation.formato.replace('grafico_', '') as 'pie' | 'bar' | 'line' | 'polar'
    
    const ejeX = presentation.ejeX || columnas[0] || 'x'
    const ejeY = presentation.ejeY || columnas[1] || 'value'
    
    // Usar datos ORIGINALES para que las etiquetas sean correctas
    const datosGrafico = datos.map(row => ({
      x: String(row[ejeX] ?? 'N/A'),
      value: Number(row[ejeY] ?? 0),
    }))
    
    return {
      respuesta: presentation.mensaje_interpretacion,
      tipo: presentation.formato as AIResponse['tipo'],
      datos,
      grafico: {
        tipo: tipoGrafico,
        titulo: presentation.titulo,
        datos: datosGrafico,
      },
      sql: resultado.sql,
    }
  }
  
  // Fallback
  return {
    respuesta: presentation.mensaje_interpretacion || presentation.titulo,
    tipo: 'texto',
    datos,
    sql: resultado.sql,
  }
}

/**
 * Procesa una pregunta del usuario usando dual-agent architecture
 */
export async function procesarPregunta(pregunta: string): Promise<AIResponse> {
  const sessionId = `session-${Date.now()}`
  
  // 1. Inicializar base de datos
  try {
    await inicializarBaseDatos()
  } catch (error) {
    return {
      respuesta: 'Error inicializando la base de datos. Por favor recarga la página.',
      tipo: 'texto',
      error: String(error),
    }
  }
  
  // 2. AGENTE 1: Generar SQL
  const sqlResponseRaw = await enviarAAgenteSQL(pregunta, sessionId)
  
  console.log('🔍 [DEBUG] sqlResponseRaw completo:', JSON.stringify(sqlResponseRaw, null, 2))
  console.log('🔍 [DEBUG] Es array?', Array.isArray(sqlResponseRaw))
  
  // Manejar si el agente devuelve un array en lugar de un objeto único
  let sqlResponse: SQLGeneratorResponse | null = null
  if (Array.isArray(sqlResponseRaw)) {
    console.log('⚠️ El agente devolvió un array, tomando el primer elemento')
    const firstElement = sqlResponseRaw[0]
    console.log('🔍 [DEBUG] Primer elemento:', JSON.stringify(firstElement, null, 2))
    console.log('🔍 [DEBUG] Tipo de primer elemento:', typeof firstElement)
    console.log('🔍 [DEBUG] Propiedades:', Object.keys(firstElement || {}))
    
    // Si tiene un campo "output" con JSON string, parsear
    if (firstElement && typeof firstElement === 'object' && 'output' in firstElement) {
      console.log('🔄 Detectado campo "output", parseando JSON anidado...')
      try {
        const outputContent = (firstElement as any).output
        sqlResponse = parsearJSON<SQLGeneratorResponse>(outputContent)
        console.log('✅ JSON anidado parseado:', sqlResponse)
      } catch (error) {
        console.error('❌ Error parseando output anidado:', error)
        sqlResponse = null
      }
    } else {
      sqlResponse = firstElement || null
    }
  } else {
    // Si no es array, verificar si tiene "output"
    if (sqlResponseRaw && typeof sqlResponseRaw === 'object' && 'output' in sqlResponseRaw) {
      console.log('🔄 Detectado campo "output" en respuesta única, parseando...')
      const outputContent = (sqlResponseRaw as any).output
      sqlResponse = parsearJSON<SQLGeneratorResponse>(outputContent)
    } else {
      sqlResponse = sqlResponseRaw
    }
  }
  
  console.log('🔍 [DEBUG] sqlResponse final:', sqlResponse)
  console.log('🔍 [DEBUG] sqlResponse.sql:', sqlResponse?.sql)
  
  if (!sqlResponse || !sqlResponse.sql) {
    console.error('❌ No se pudo obtener SQL válido')
    console.error('❌ sqlResponse:', JSON.stringify(sqlResponse, null, 2))
    return {
      respuesta: 'No pude generar una consulta SQL para tu pregunta. Intenta reformularla.',
      tipo: 'texto',
      error: 'El agente SQL no generó una query válida',
    }
  }
  
  console.log('🔍 SQL generado:', sqlResponse.sql)
  console.log('📊 Tipo:', sqlResponse.tipo_consulta)
  console.log('📄 Explicación:', sqlResponse.explicacion)
  
  // 3. Ejecutar SQL localmente
  const resultado = await ejecutarSQL(sqlResponse.sql)
  
  if (!resultado.exito) {
    return {
      respuesta: `Error ejecutando la consulta: ${resultado.error}`,
      tipo: 'texto',
      error: resultado.error,
      sql: sqlResponse.sql,
    }
  }
  
  console.log('✅ Resultados SQL:', resultado.total, 'registros')
  console.log('📦 Datos obtenidos (muestra):', resultado.datos.slice(0, 3))
  console.log('📋 Columnas:', resultado.columnas)
  
  // 4. AGENTE 2: Determinar presentación óptima
  console.log('🎨 [PASO 4] Llamando al Agente de Presentación...')
  console.log('📤 Enviando:', {
    pregunta,
    totalRegistros: resultado.datos.length,
    columnas: resultado.columnas,
    sessionId
  })
  
  let presentationResponse: PresentationResponse | null = null
  
  try {
    const presentationResponseRaw = await enviarAAgentePresentation(
      pregunta,
      resultado.datos,
      resultado.columnas,
      sessionId
    )
    
    console.log('🎯 [PASO 4] Respuesta del Agente de Presentación RAW:', presentationResponseRaw)
    
    // Aplicar misma lógica que con SQL Generator: manejar array y campo "output"
    if (Array.isArray(presentationResponseRaw)) {
      console.log('⚠️ Presentation Agent devolvió array, extrayendo primer elemento')
      const firstElement = presentationResponseRaw[0]
      
      // Si tiene campo "output" con JSON string
      if (firstElement && typeof firstElement === 'object' && 'output' in firstElement) {
        console.log('🔄 Detectado campo "output" en Presentation Agent, parseando...')
        const outputContent = (firstElement as any).output
        presentationResponse = parsearJSON<PresentationResponse>(outputContent)
        console.log('✅ Presentation JSON parseado:', presentationResponse)
      } else {
        presentationResponse = firstElement || null
      }
    } else if (presentationResponseRaw && typeof presentationResponseRaw === 'object' && 'output' in presentationResponseRaw) {
      console.log('🔄 Detectado campo "output" en respuesta única de Presentation')
      const outputContent = (presentationResponseRaw as any).output
      presentationResponse = parsearJSON<PresentationResponse>(outputContent)
    } else {
      presentationResponse = presentationResponseRaw
    }
    
    console.log('🎯 [PASO 4] Respuesta procesada:', presentationResponse)
  } catch (error) {
    console.error('💥 [PASO 4] Error crítico llamando al Agente de Presentación:', error)
    console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'No stack available')
  }
  
  // Si el Agente 2 falla, usar heurísticas simples
  if (!presentationResponse) {
    console.warn('⚠️ Agente de presentación no disponible, usando formato tabla por defecto')
    console.warn('⚠️ Razón: presentationResponse es null o undefined')
    
    return {
      respuesta: `Encontré ${resultado.total} resultados`,
      tipo: 'tabla',
      datos: resultado.datos,
      tabla: {
        columnas: resultado.columnas,
        filas: resultado.datos,
        titulo: pregunta,
      },
      sql: sqlResponse.sql,
    }
  }
  
  console.log('🎨 Formato elegido:', presentationResponse.formato)
  
  // 5. Formatear según decisión del Agente 2
  return formatearConPresentacion(resultado, presentationResponse)
}

export interface Suggestion {
  label: string
  query: string
}

/** Obtiene sugerencias de preguntas */
export function obtenerSugerencias(): Suggestion[] {
  return [
    {
      label: 'Consultar variaciones relevantes',
      query: 'Muestrame el Top 10 de variaciones positivas y el Top 10 de variaciones negativas del mes'
    },
    {
      label: 'Consultar mi portafolio',
      query: 'Consultar mi portafolio'
    },
    {
      label: 'Consultar el listado de oportunidades',
      query: 'Consultar el listado de oportunidades'
    },
    {
      label: 'Consultar el listado de prospectos',
      query: 'Consultar el listado de prospectos'
    },
  ]
}
