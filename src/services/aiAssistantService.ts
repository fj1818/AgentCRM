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
const WEBHOOK_SQL_GENERATOR = 'https://fjrv1818.app.n8n.cloud/webhook/regio-ia-assistant'
const WEBHOOK_PRESENTATION = 'https://fjrv1818.app.n8n.cloud/webhook/presenter'

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
  formato: 'texto' | 'tabla' | 'multi_tabla' | 'grafico_bar' | 'grafico_pie' | 'grafico_line' | 'grafico_polar' | 'multi_grafico'
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
  tablas?: {
    titulo: string
    columnas: string[]
    datos: Record<string, unknown>[]
  }[]
}

/** Respuesta procesada para el chat */
export interface AIResponse {
  respuesta: string
  tipo: 'texto' | 'tabla' | 'multi_tabla' | 'grafico_pie' | 'grafico_bar' | 'grafico_column' | 'grafico_line' | 'grafico_polar' | 'multi_tabla'
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
  
  // 2. Filtrar columnas - Reglas de IDs
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
  
  // Multi-Tabla
  if (presentation.formato === 'multi_tabla' && presentation.tablas) {
    console.log(`📊 [Multi-Tabla] Procesando ${presentation.tablas.length} tablas`)
    
    // Procesar cada tabla individualmente con reglas de privacidad
    const tablasProcesadas = presentation.tablas.map(tabla => {
      const privacyResult = aplicarReglasPrivacidad(tabla.datos, tabla.columnas)
      return {
        titulo: tabla.titulo,
        datos: privacyResult.datos,
        columnas: privacyResult.columnas
      }
    })

    return {
      respuesta: presentation.mensaje_interpretacion,
      tipo: 'multi_tabla',
      tablas: tablasProcesadas,
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
  
  // Detectar consultas que NO requieren SQL (estrategias, metas, contenido generativo)
  const preguntaLower = pregunta.toLowerCase()
  const esConsultaGenerativa = 
    preguntaLower.includes('estrategia') ||
    preguntaLower.includes('planifica') ||
    preguntaLower.includes('redacta') ||
    preguntaLower.includes('tablero de metas') ||
    preguntaLower.includes('cumplimiento de objetivos') ||
    preguntaLower.includes('sin consultar') ||
    preguntaLower.includes('valores de ejemplo') ||
    preguntaLower.includes('genera un tablero')
  
  if (esConsultaGenerativa) {
    console.log('📝 [Generativo] Detectada consulta generativa, generando contenido localmente')
    
    // Generar contenido localmente según el tipo de consulta
    if (preguntaLower.includes('estrategia')) {
      return {
        respuesta: `📋 ESTRATEGIA DE VENTAS - Plan Trimestral

---

1. 🔄 Estrategia de Venta Cruzada (Cross-Selling)

Objetivo: Incrementar la penetración de productos en la base actual de clientes.

Público Meta: Clientes con saldo alto en cheques (>$500,000) pero sin TDC activa.

Acciones Específicas:
• Identificar clientes con alto saldo en captación pero baja tenencia de productos de crédito
• Contactar a los 50 clientes top con oferta de TDC Gold pre-aprobada
• Ofrecer TPV a clientes con negocio propio sin terminal activa

Métricas de Éxito:
• Colocar 25 TDC nuevas en el trimestre
• Activar 15 TPV nuevas
• Incrementar productos por cliente de 1.8 a 2.3 promedio

Plazo: 3 meses

---

2. 💳 Estrategia de Colocación de Créditos

Objetivo: Aumentar la colocación de créditos en un 20%.

Público Meta: Clientes con buen historial de pago y uso de TDC >60%.

Acciones Específicas:
• Campaña de upgrade de línea para clientes con uso alto
• Ofrecer créditos personales a clientes con nómina activa
• Pre-aprobar créditos PYME a clientes TPV con facturación >$100,000/mes

Métricas de Éxito:
• Colocar $5,000,000 en créditos nuevos
• Mantener morosidad <2%
• 30 créditos nuevos en el trimestre

Plazo: 3 meses

---

3. 📈 Estrategia de Incremento de Facturación TPV

Objetivo: Incrementar la facturación mensual promedio en TPV un 15%.

Público Meta: Clientes con TPV activa pero facturación baja (<$50,000/mes).

Acciones Específicas:
• Programa de incentivos: reducción de comisión por volumen
• Capacitación en punto de venta para maximizar uso
• Campaña de referidos entre comercios

Métricas de Éxito:
• Facturación promedio de $80,000 a $92,000/mes
• Activación de 10 TPV dormidas
• Retención del 95% de clientes TPV

Plazo: 3 meses`,
        tipo: 'texto',
      }
    }
    
    if (preguntaLower.includes('tablero') || (preguntaLower.includes('metas') && !preguntaLower.includes('estrategia')) || (preguntaLower.includes('resultado') && preguntaLower.includes('metas'))) {
      return {
        respuesta: '📊 Tablero de Metas Generado',
        tipo: 'tabla',
        tabla: {
          columnas: ['Indicador', 'Meta Mensual', 'Avance Actual', '% Cumplimiento', 'Delta'],
          filas: [
            { Indicador: 'Captación', 'Meta Mensual': 1500000, 'Avance Actual': 1200000, '% Cumplimiento': '80%', Delta: '🔴 ↓ -$300,000' },
            { Indicador: 'Colocación', 'Meta Mensual': 2000000, 'Avance Actual': 2150000, '% Cumplimiento': '108%', Delta: '🟢 ↑ +$150,000' },
            { Indicador: 'Facturación TPV', 'Meta Mensual': 800000, 'Avance Actual': 720000, '% Cumplimiento': '90%', Delta: '🔴 ↓ -$80,000' },
            { Indicador: 'Seguros', 'Meta Mensual': 300000, 'Avance Actual': 350000, '% Cumplimiento': '117%', Delta: '🟢 ↑ +$50,000' },
            { Indicador: 'Créditos', 'Meta Mensual': 1000000, 'Avance Actual': 850000, '% Cumplimiento': '85%', Delta: '🔴 ↓ -$150,000' },
          ],
          titulo: 'Tablero de Metas - Enero 2026',
        },
      }
    }
    
    // Fallback para otras consultas generativas
    return {
      respuesta: 'Procesando tu solicitud. Por favor reformula tu pregunta o selecciona un prompt de la biblioteca.',
      tipo: 'texto',
    }
  }
  
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
  
  // Enriquecer pregunta para asegurar que se incluyan productos en listado de prospectos
  if (preguntaLower.includes('listado de prospectos') || preguntaLower.includes('lista de prospectos')) {
    console.log('🔄 Enriqueciendo pregunta de prospectos para incluir productos...')
    pregunta = 'Genera un listado de prospectos mostrando: Nombre, RFC, Familia de Producto (hacer JOIN con ofertas_prospectos), Producto Específico, Etapa y Fecha de Alta. Oculta IDs internos.'
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
    }
  }

  // Lógica específica para Prospectos: Ocultar ID y reordenar columnas
  if (preguntaLower.includes('prospectos') && resultado.datos.length > 0) {
    console.log('🔄 Aplicando formato específico para Prospectos...')
    
    // 1. Filtrar columnas no deseadas (idProspecto)
    const columnasOcultas = ['idProspecto', 'numeroPromotor', 'idOferta']
    resultado.columnas = resultado.columnas.filter(col => !columnasOcultas.includes(col))
    
    // 2. Reordenar columnas: Poner producto antes de fechas
    // Orden deseado: Nombre, RFC, Producto, Etapa, Fecha Alta, ...
    const ordenPreferido = ['nombre', 'rfc', 'familiaProducto', 'productoInteres', 'etapa', 'fechaAlta']
    
    resultado.columnas.sort((a, b) => {
      const idxA = ordenPreferido.indexOf(a)
      const idxB = ordenPreferido.indexOf(b)
      
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      return 0
    })
    
    // 3. Limpiar datos
    resultado.datos = resultado.datos.map(fila => {
      const nuevaFila: Record<string, unknown> = {}
      resultado.columnas.forEach(col => {
        nuevaFila[col] = fila[col]
      })
      return nuevaFila
    })
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
      query: 'Muestrame las 15 variaciones más grandes del último mes (ingresos y egresos) ordenadas por magnitud'
    },
    {
      label: 'Cumplimiento de Objetivos',
      query: 'Genera un tablero de metas SIN consultar la base de datos. Crea una tabla con estos indicadores: Captación, Colocación, Facturación TPV, Seguros, Créditos. Columnas: Meta Mensual, Avance Actual, % Cumplimiento, Delta. Usa valores de ejemplo donde el Avance sea entre 50% y 120% de la Meta. En la columna Delta agrega un indicador: si el avance supera la meta usa "🟢 ↑" y si falta para llegar usa "🔴 ↓". Delta = Avance - Meta.'
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
