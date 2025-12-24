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

// Webhooks de n8n
const WEBHOOK_SQL_AGENT = 'https://abrahamnavarrete.app.n8n.cloud/webhook/regio-ia-assistant'
const WEBHOOK_PRESENTER = 'https://abrahamnavarrete.app.n8n.cloud/webhook/presenter'

/** Respuesta del Agente SQL */
interface SQLAgentResponse {
  sql: string
  presentacion: 'texto' | 'tabla' | 'grafico_bar' | 'grafico_pie' | 'grafico_column' | 'grafico_polar'
  titulo: string
  ejeX?: string
  ejeY?: string
  error?: string
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
 * Parsea la respuesta del Agente SQL - maneja objetos individuales y arrays
 */
function parsearRespuestaAgente(texto: string): SQLAgentResponse | SQLAgentResponse[] | null {
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
    
    // Buscar JSON en el texto - puede ser objeto {} o array []
    if (!jsonStr.startsWith('{') && !jsonStr.startsWith('[')) {
      // Buscar array primero
      let startIdx = jsonStr.indexOf('[')
      let endIdx = jsonStr.lastIndexOf(']')
      
      // Si no hay array, buscar objeto
      if (startIdx === -1 || endIdx === -1) {
        startIdx = jsonStr.indexOf('{')
        endIdx = jsonStr.lastIndexOf('}')
      }
      
      if (startIdx !== -1 && endIdx > startIdx) {
        jsonStr = jsonStr.slice(startIdx, endIdx + 1)
      }
    }
    
    const parsed = JSON.parse(jsonStr)
    
    // Si es un array, retornarlo como tal
    if (Array.isArray(parsed)) {
      return parsed as SQLAgentResponse[]
    }
    
    return parsed as SQLAgentResponse
  } catch (error) {
    console.error('Error parseando respuesta del agente:', error)
    return null
  }
}

/**
 * Envía la pregunta al Agente SQL en n8n
 */
async function enviarAAgente(pregunta: string): Promise<SQLAgentResponse | SQLAgentResponse[] | null> {
  try {
    console.log('📤 Enviando pregunta al agente:', pregunta)
    console.log('📡 Webhook URL:', WEBHOOK_SQL_AGENT)
    
    const response = await fetch(WEBHOOK_SQL_AGENT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatInput: pregunta,
        timestamp: new Date().toISOString(),
      }),
    })
    
    console.log('📥 Status de respuesta:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error del servidor:', response.status, errorText)
      throw new Error(`Error del servidor: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📦 Respuesta completa del Agente:', JSON.stringify(data, null, 2))
    
    // Extraer texto de la respuesta - probar múltiples formatos
    let textoRespuesta = ''
    
    if (typeof data === 'string') {
      textoRespuesta = data
    } else if (data.output) {
      textoRespuesta = data.output
    } else if (data.text) {
      textoRespuesta = data.text
    } else if (data.response) {
      textoRespuesta = data.response
    } else if (data.message) {
      textoRespuesta = data.message
    } else if (Array.isArray(data) && data[0]) {
      textoRespuesta = data[0].output || data[0].text || data[0].message || JSON.stringify(data[0])
    } else {
      textoRespuesta = JSON.stringify(data)
    }
    
    console.log('📝 Texto extraído:', textoRespuesta)
    
    const parsed = parsearRespuestaAgente(textoRespuesta)
    console.log('✅ Respuesta parseada:', parsed)
    
    return parsed
  } catch (error) {
    console.error('❌ Error llamando al agente:', error)
    return null
  }
}

/**
 * Envía resultado al Agente Presenter para formatear
 */
async function enviarAPresenter(
  resultado: SQLResult,
  metadatos: SQLAgentResponse
): Promise<string | null> {
  try {
    const response = await fetch(WEBHOOK_PRESENTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resultado: JSON.stringify(resultado.datos.slice(0, 30)),
        titulo: metadatos.titulo,
        presentacion: metadatos.presentacion,
        total: resultado.total,
        columnas: resultado.columnas,
      }),
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    const texto = data.output || data.text || data.mensaje
    
    if (!texto) return null
    
    // Intentar parsear JSON del presenter
    try {
      const parsed = JSON.parse(texto.replace(/```json|```/g, '').trim())
      return parsed.mensaje || texto
    } catch {
      return texto
    }
  } catch {
    return null
  }
}

/**
 * Formatea el resultado SQL para presentación
 */
function formatearResultado(
  resultado: SQLResult,
  metadatos: SQLAgentResponse,
  mensaje?: string | null
): AIResponse {
  const { datos, columnas, total } = resultado
  
  // Presentación de texto
  if (metadatos.presentacion === 'texto') {
    let respuesta = mensaje || metadatos.titulo
    
    if (datos.length === 1 && columnas.length === 1 && columnas[0]) {
      // Resultado escalar (COUNT, SUM, etc.)
      const valor = datos[0]?.[columnas[0]]
      const valorNum = Number(valor)
      if (valorNum > 1000) {
        respuesta = `${metadatos.titulo}: $${valorNum.toLocaleString('es-MX')}`
      } else {
        respuesta = `${metadatos.titulo}: ${valorNum.toLocaleString('es-MX')}`
      }
    }
    
    return {
      respuesta,
      tipo: 'texto',
      datos,
      sql: resultado.sql,
    }
  }
  
  // Presentación de tabla
  if (metadatos.presentacion === 'tabla') {
    return {
      respuesta: mensaje || metadatos.titulo,
      tipo: 'tabla',
      datos,
      tabla: {
        columnas,
        filas: datos,
        titulo: metadatos.titulo,
      },
      sql: resultado.sql,
    }
  }
  
  // Presentación de gráfico
  if (metadatos.presentacion.startsWith('grafico_')) {
    const tipoGrafico = metadatos.presentacion.replace('grafico_', '') as 'pie' | 'bar' | 'line' | 'column' | 'polar'
    
    // Preparar datos del gráfico
    const ejeX = metadatos.ejeX || columnas[0] || 'x'
    const ejeY = metadatos.ejeY || columnas[1] || columnas[0] || 'value'
    
    const datosGrafico = datos.map(row => ({
      x: String(row[ejeX] ?? 'N/A'),
      value: Number(row[ejeY] ?? 0),
    }))
    
    return {
      respuesta: mensaje || metadatos.titulo,
      tipo: metadatos.presentacion as AIResponse['tipo'],
      datos,
      grafico: {
        tipo: tipoGrafico,
        titulo: metadatos.titulo,
        datos: datosGrafico,
      },
      sql: resultado.sql,
    }
  }
  
  // Fallback
  return {
    respuesta: mensaje || `Encontré ${total} resultados`,
    tipo: 'texto',
    datos,
    sql: resultado.sql,
  }
}

/**
 * Procesa una pregunta del usuario usando SQL
 */
export async function procesarPregunta(pregunta: string): Promise<AIResponse> {
  // 1. Inicializar base de datos si no está lista
  try {
    await inicializarBaseDatos()
  } catch (error) {
    return {
      respuesta: 'Error inicializando la base de datos. Por favor recarga la página.',
      tipo: 'texto',
      error: String(error),
    }
  }
  
  // 2. Enviar pregunta al Agente SQL
  const agentResponse = await enviarAAgente(pregunta)
  
  if (!agentResponse) {
    return {
      respuesta: 'No pude generar una consulta para tu pregunta. Intenta reformularla.',
      tipo: 'texto',
      error: 'El agente no generó SQL válido',
    }
  }
  
  // 3. Manejar respuesta individual o múltiple (array)
  const responses = Array.isArray(agentResponse) ? agentResponse : [agentResponse]
  
  // Detectar si el usuario pidió gráfico polar y corregir si el agente devolvió pie
  const preguntaLower = pregunta.toLowerCase()
  const pidePolar = preguntaLower.includes('polar') || preguntaLower.includes('polararea')
  
  if (pidePolar) {
    for (const resp of responses) {
      if (resp.presentacion === 'grafico_pie') {
        console.log('🔄 Corrigiendo presentación de grafico_pie a grafico_polar por petición del usuario')
        resp.presentacion = 'grafico_polar'
      }
    }
  }
  
  // Si ninguna respuesta tiene SQL, error
  if (!responses.length || !responses[0].sql) {
    return {
      respuesta: 'No pude generar una consulta para tu pregunta. Intenta reformularla.',
      tipo: 'texto',
      error: 'El agente no generó SQL válido',
    }
  }
  
  // 4. Ejecutar cada SQL y combinar resultados
  const allResults: AIResponse[] = []
  
  for (const resp of responses) {
    if (!resp.sql) continue
    
    console.log('SQL generado:', resp.sql)
    
    const resultado = await ejecutarSQL(resp.sql)
    
    if (!resultado.exito) {
      allResults.push({
        respuesta: `Error: ${resultado.error}`,
        tipo: 'texto',
        error: resultado.error,
        sql: resultado.sql,
      })
      continue
    }
    
    console.log('✅ Resultados SQL:', resultado.datos.slice(0, 5))
    
    // Formatear resultado individual
    const formatted = formatearResultado(resultado, resp, null)
    allResults.push(formatted)
  }
  
  // 5. Si hay múltiples resultados, combinarlos
  if (allResults.length === 1) {
    return allResults[0]!
  }
  
  // Si no hay resultados, error
  if (allResults.length === 0) {
    return {
      respuesta: 'No se encontraron resultados para tu consulta.',
      tipo: 'texto',
    }
  }
  
  // Combinar múltiples tablas en un solo resultado
  const combinedDatos: Record<string, unknown>[] = []
  const combinedText: string[] = []
  
  for (const result of allResults) {
    if (result.datos && Array.isArray(result.datos)) {
      // Añadir separador con título
      combinedDatos.push({ __section__: result.respuesta })
      combinedDatos.push(...result.datos)
    }
    combinedText.push(result.respuesta)
  }
  
  return {
    respuesta: combinedText.join('\n\n---\n\n'),
    tipo: 'multi_tabla',
    datos: combinedDatos,
    tablas: allResults.map(r => ({
      titulo: r.respuesta,
      datos: r.datos || [],
      columnas: r.columnas || [],
    })),
  }
}

/** Obtiene sugerencias de preguntas */
export function obtenerSugerencias(): string[] {
  return [
    'Consultar variaciones relevantes por periodos',
    'Consultar mi portafolio',
    'Consultar mi cartera de crédito',
    'Consultar mi tubería de ventas',
  ]
}
