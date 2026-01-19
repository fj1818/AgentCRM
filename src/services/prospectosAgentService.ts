
// Webhook URLs
const WEBHOOK_PROSPECTOS = 'https://abrahamnavarrete.app.n8n.cloud/webhook/Register'
const WEBHOOK_OPORTUNIDADES = 'https://abrahamnavarrete.app.n8n.cloud/webhook/Register'

export interface AgenteResponse {
  intent?: 'CREAR_PROSPECTO' | 'ACTUALIZAR_PROSPECTO' | 'ACTUALIZAR_OFERTA' | 'CREAR_OFERTA'
  data?: {
    nombre?: string
    rfc?: string
    contacto?: string
    producto?: string
    campo?: 'etapa' | 'monto' | 'producto' | 'contacto' | 'montoOferta'
    valor?: any
    idOferta?: string
  }
  mensaje?: string
  output?: string
  text?: string
  message?: string
}

export async function enviarAlAgente(
  mensaje: string, 
  sessionId: string, 
  contexto: 'prospectos' | 'oportunidades' = 'prospectos'
): Promise<AgenteResponse | string> {
  try {
    const fechaActual = new Date().toISOString().split('T')[0]
    const horaActual = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
    
    const url = contexto === 'oportunidades' ? WEBHOOK_OPORTUNIDADES : WEBHOOK_PROSPECTOS
    
    // Inyectar contexto de productos válidos para oportunidades
    let mensajeFinal = mensaje
    if (contexto === 'oportunidades') {
        mensajeFinal += `\n\n[Instrucción del Sistema: Las familias de productos válidas son ÚNICAMENTE: TDC, TPV, Cheques. Si el usuario menciona un producto específico (ej. TDC Oro), extrae 'TDC' como familia y 'TDC Oro' como producto. Si menciona un monto, extráelo como 'montoOferta'. IMPORTANTE: Para crear una oferta, intenta obtener el NOMBRE, RFC o IDE del cliente para buscarlo en la base de datos.]`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        mensaje: mensajeFinal, 
        sessionId,
        fechaActual,
        horaActual,
        contexto
      })
    })
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Respuesta Agente Debug:', data)

    // Intentar parsear si viene como objeto directo o array
    let rawOutput: any = data
    if (Array.isArray(data) && data.length > 0) {
      rawOutput = data[0]
    }

    // Verificar si el output es JSON string o ya es objeto
    if (rawOutput.output && typeof rawOutput.output === 'string') {
        try {
            let cleanOutput = rawOutput.output.trim();
            
            // 1. Intentar extraer bloque de código markdown
            const jsonMatch = cleanOutput.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            if (jsonMatch) {
                cleanOutput = jsonMatch[1].trim();
            } else {
                // 2. Fallback: buscar primer { y último }
                const firstOpen = cleanOutput.indexOf('{');
                const lastClose = cleanOutput.lastIndexOf('}');
                if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
                    cleanOutput = cleanOutput.substring(firstOpen, lastClose + 1);
                }
            }
            
            // Intentar parsear el output string a JSON
            const parsed = JSON.parse(cleanOutput)
            return parsed as AgenteResponse
        } catch (e) {
            console.error('Error parseando JSON del agente:', e)
            console.log('Output original:', rawOutput.output)
            // Si falla, es texto normal
        }
        return rawOutput.output
    } else if (rawOutput.output) {
      // Si output ya es objeto
      return rawOutput.output as unknown as AgenteResponse
    } else if (rawOutput.mensaje) {
        return rawOutput as AgenteResponse
    }

    // Fallback general para respuestas simples de texto
    if (typeof rawOutput === 'string') return rawOutput
    if (rawOutput.text) return rawOutput.text
    if (rawOutput.message) return rawOutput.message

    return JSON.stringify(rawOutput)
    
  } catch (error) {
    console.error('Error enviando al agente:', error)
    return '❌ Error de conexión. Por favor intenta de nuevo.'
  }
}
