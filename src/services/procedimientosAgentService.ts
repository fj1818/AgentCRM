/**
 * Servicio del Agente de Procedimientos
 * 
 * Envía la pregunta del usuario junto con el contexto de procedimientos
 * a un webhook de n8n dedicado para guiar al ejecutivo paso a paso.
 */

import { generarTextoProcedimientos } from '@/data/procedimientosData'
import type { AIResponse } from './aiAssistantService'

// Webhook dedicado para el agente de procedimientos
const WEBHOOK_PROCEDIMIENTOS = 'https://abrahamnavarrete.app.n8n.cloud/webhook/procedimientos'

/** Respuesta esperada del agente de procedimientos */
interface ProcedimientosAgentResponse {
  output?: string
  respuesta?: string
  error?: string
}

/**
 * Parsea la respuesta del agente de procedimientos de forma flexible
 */
function parsearRespuesta(data: unknown): string | null {
  if (!data) return null

  // Si es string directo
  if (typeof data === 'string') return data

  // Si es array, tomar el primer elemento
  if (Array.isArray(data)) {
    const first = data[0]
    if (typeof first === 'string') return first
    if (first && typeof first === 'object') {
      const obj = first as ProcedimientosAgentResponse
      return obj.output || obj.respuesta || JSON.stringify(first)
    }
    return null
  }

  // Si es objeto
  if (typeof data === 'object') {
    const obj = data as ProcedimientosAgentResponse
    
    // Intentar campo 'output' (formato común de n8n)
    if (obj.output) {
      // Puede ser un JSON stringificado dentro de output
      try {
        const parsed = JSON.parse(obj.output)
        if (typeof parsed === 'string') return parsed
        if (parsed.respuesta) return parsed.respuesta
        if (parsed.output) return parsed.output
        return obj.output
      } catch {
        return obj.output
      }
    }
    
    if (obj.respuesta) return obj.respuesta
    if (obj.error) return `Error del agente: ${obj.error}`
  }

  return null
}

/**
 * Procesa una pregunta de procedimientos enviándola al webhook de n8n
 */
export async function procesarPreguntaProcedimiento(
  pregunta: string,
): Promise<AIResponse> {
  console.log('📋 [Procedimientos] Procesando pregunta:', pregunta)
  
  // Generar contexto con todos los procedimientos
  const contextoProcedimientos = generarTextoProcedimientos()
  
  try {
    console.log('📋 [Procedimientos] Enviando al agente...')
    
    const response = await fetch(WEBHOOK_PROCEDIMIENTOS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pregunta,
        contexto: contextoProcedimientos,
        sessionId: `proc-${Date.now()}`,
      }),
    })

    if (!response.ok) {
      console.error(`📋 [Procedimientos] Error HTTP: ${response.status}`)
      
      // Si el webhook no está configurado aún, dar respuesta local de ejemplo
      if (response.status === 404 || response.status === 500) {
        return generarRespuestaLocal(pregunta)
      }
      
      return {
        respuesta: `Error al consultar el agente de procedimientos (HTTP ${response.status}). Verifica que el webhook esté activo en n8n.`,
        tipo: 'texto',
        error: `HTTP ${response.status}`,
      }
    }

    const data = await response.json()
    console.log('📋 [Procedimientos] Respuesta RAW:', data)

    const respuestaTexto = parsearRespuesta(data)
    
    if (respuestaTexto) {
      return {
        respuesta: respuestaTexto,
        tipo: 'texto',
      }
    }

    // Fallback: si no pudimos parsear la respuesta
    console.warn('📋 [Procedimientos] No se pudo parsear la respuesta, usando respuesta local')
    return generarRespuestaLocal(pregunta)

  } catch (error) {
    console.error('📋 [Procedimientos] Error de red:', error)
    
    // Si hay error de red (webhook no accesible), usar respuesta local
    return generarRespuestaLocal(pregunta)
  }
}

/**
 * Genera una respuesta local cuando el webhook no está disponible
 * Usa los datos de procedimientos directamente
 */
function generarRespuestaLocal(pregunta: string): AIResponse {
  console.log('📋 [Procedimientos] Generando respuesta local para:', pregunta)
  
  const preguntaLower = pregunta.toLowerCase()
  
  // Respuestas básicas basadas en palabras clave
  if (preguntaLower.includes('documento') || preguntaLower.includes('requisito')) {
    return {
      respuesta: `📋 **Documentos Requeridos para Contratación de TDC:**\n\n` +
        `1. ✅ Identificación oficial vigente (INE/IFE o Pasaporte)\n` +
        `2. ✅ Comprobante de domicilio no mayor a 3 meses\n` +
        `3. ✅ Últimos 3 recibos de nómina o estados de cuenta\n` +
        `4. ✅ RFC con homoclave\n` +
        `5. ✅ CURP\n` +
        `6. ✅ Solicitud de crédito firmada\n` +
        `7. ✅ Autorización de consulta a Buró de Crédito\n` +
        `8. ✅ Carátula de estado de cuenta bancario\n\n` +
        `⚠️ **Para trabajadores independientes:** últimas 2 declaraciones anuales + 6 meses de estados de cuenta.\n` +
        `⚠️ **Para extranjeros:** pasaporte vigente + FM2/FM3 o tarjeta de residente.`,
      tipo: 'texto',
    }
  }
  
  if (preguntaLower.includes('rechazo') || preguntaLower.includes('riesgo') || preguntaLower.includes('negar') || preguntaLower.includes('no aprob')) {
    return {
      respuesta: `🔄 **Procedimiento ante Rechazo del Modelo Paramétrico:**\n\n` +
        `**¿Se puede escalar?** Sí, EXCEPTO si:\n` +
        `- ❌ Cliente en listas negras PLD\n` +
        `- ❌ Créditos en litigio activos\n` +
        `- ❌ Score de Buró < 500 puntos\n\n` +
        `**Pasos para escalar a Riesgos:**\n` +
        `1. Verificar motivo específico del rechazo\n` +
        `2. Enviar correo a riesgos.credito@banco.com con:\n` +
        `   - Folio de solicitud\n` +
        `   - Justificación comercial\n` +
        `   - Propuesta de mitigación\n` +
        `3. Esperar respuesta (máx 48 hrs hábiles)\n\n` +
        `**Posibles respuestas de Riesgos:**\n` +
        `- ✅ Aprobación con tasa condicionada (+5 a +15 pp)\n` +
        `- ✅ Aprobación con línea reducida (50-70%)\n` +
        `- ✅ Aprobación con depósito en garantía (10-30%)\n` +
        `- ❌ Rechazo definitivo (re-solicitud en 6 meses)\n\n` +
        `💡 **Tip:** Clientes con >5 años de antigüedad sin atrasos pueden ser aprobados por el Director de Sucursal para líneas hasta $50,000 MXN.`,
      tipo: 'texto',
    }
  }

  if (preguntaLower.includes('tasa') || preguntaLower.includes('condicion')) {
    return {
      respuesta: `💰 **Tasa Condicionada por Nivel de Riesgo:**\n\n` +
        `| Nivel de Riesgo | Sobreprecio | Ejemplo (base 28%) |\n` +
        `|:-:|:-:|:-:|\n` +
        `| Bajo-Medio | +5 pp | 33% |\n` +
        `| Medio | +10 pp | 38% |\n` +
        `| Alto | +15 pp | 43% |\n\n` +
        `**📅 Revisión a 12 meses si cumple:**\n` +
        `- 0 atrasos en pagos\n` +
        `- Uso promedio < 70% de la línea\n` +
        `- Al menos 6 MSI realizados\n\n` +
        `⏰ El cliente tiene **5 días hábiles** para aceptar o rechazar las condiciones.\n\n` +
        `💡 Si tiene inversión vigente > $100,000, puede solicitar tasa preferencial.`,
      tipo: 'texto',
    }
  }

  if (preguntaLower.includes('paso') || preguntaLower.includes('proceso') || preguntaLower.includes('cómo') || preguntaLower.includes('como') || preguntaLower.includes('contratar') || preguntaLower.includes('tdc') || preguntaLower.includes('tarjeta')) {
    return {
      respuesta: `📋 **Proceso de Contratación de TDC - Resumen:**\n\n` +
        `**Paso 1:** 🔍 Identificar y perfilar al cliente (edad 18-69, ingreso mín $8,000)\n` +
        `**Paso 2:** 📄 Solicitar documentos (INE, domicilio, nómina, RFC, CURP)\n` +
        `**Paso 3:** 💻 Dar de alta en Fábrica de Créditos (capturar datos y adjuntar docs)\n` +
        `**Paso 4:** ⚙️ Esperar evaluación del Modelo Paramétrico (15 min - 2 hrs)\n` +
        `**Paso 5:** 🔄 Si rechaza → Escalar a Riesgos (si procede)\n` +
        `**Paso 6:** 💰 Gestionar condiciones especiales (tasa condicionada si aplica)\n` +
        `**Paso 7:** ✍️ Formalización y firma de contrato\n` +
        `**Paso 8:** 💳 Entrega de tarjeta y activación (3-5 días hábiles)\n\n` +
        `⏱️ **Tiempo total estimado:** 3-7 días hábiles\n\n` +
        `¿Necesitas más detalle sobre algún paso en particular? Pregúntame specifícamente.`,
      tipo: 'texto',
    }
  }

  if (preguntaLower.includes('excepcion') || preguntaLower.includes('especial') || preguntaLower.includes('pep') || preguntaLower.includes('buró') || preguntaLower.includes('buro')) {
    return {
      respuesta: `⚠️ **Excepciones y Casos Especiales:**\n\n` +
        `1. **Cliente menor de 21 años:** Requiere aval/cotitular >25 años\n` +
        `2. **Zona rural/difícil acceso:** Verificación domiciliaria presencial (+5 días)\n` +
        `3. **Ingreso variable:** 6 estados de cuenta + 2 declaraciones, ingreso = promedio × 70%\n` +
        `4. **Reestructura previa (<24 meses):** Carta de no adeudo + Comité de Crédito, máx $30,000\n` +
        `5. **PEP (Persona Políticamente Expuesta):** Aprobación del Oficial de Cumplimiento\n` +
        `6. **Error en Buró:** Solicitud en espera hasta 30 días mientras se resuelve reclamación\n\n` +
        `¿Necesitas más detalle sobre alguna excepción?`,
      tipo: 'texto',
    }
  }

  // Respuesta genérica: enviar todo el contexto resumido
  return {
    respuesta: `📋 **Modo Consulta de Procedimientos**\n\n` +
      `Tengo disponible el procedimiento completo de **Contratación de TDC**. Puedo ayudarte con:\n\n` +
      `- 📄 **Documentos requeridos** → "¿Qué documentos necesito?"\n` +
      `- 🔍 **Pasos del proceso** → "¿Cuál es el proceso para contratar TDC?"\n` +
      `- 🔄 **Manejo de rechazos** → "¿Qué hago si el modelo paramétrico rechaza?"\n` +
      `- 💰 **Tasas condicionadas** → "¿Cómo funciona la tasa condicionada?"\n` +
      `- ⚠️ **Excepciones** → "¿Cuáles son los casos especiales?"\n\n` +
      `Pregúntame lo que necesites sobre el procedimiento. Cuando configuremos el agente en n8n, las respuestas serán aún más detalladas y contextuales.`,
    tipo: 'texto',
  }
}
