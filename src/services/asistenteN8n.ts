/**
 * Conexión a los agentes n8n de los asistentes.
 * El agente devuelve un INTENT estructurado; el frontend lo ejecuta sobre el
 * store (cambio real en la gestión). Si no hay intent, devuelve texto.
 *
 * Agentes (webhooks):
 *  - ofertasCrear   → crea ofertas (CREAR_OFERTA / CREAR_PROSPECTO)
 *  - ofertasGestion → edita gestión (ACTUALIZAR_OFERTA: etapa, monto, etc.)
 *  - tareas         → crea tareas/reuniones (CREAR_TAREA / CREAR_REUNION)
 */

export const WEBHOOKS: Record<string, string> = {
  ofertasCrear: 'https://abrahamnavarrete.app.n8n.cloud/webhook/ofertas-crear',
  // URL de prueba (solo activa mientras el workflow está en modo "Listen" en n8n).
  // En producción cambia "webhook-test" por "webhook".
  ofertasGestion: 'https://abrahamnavarrete.app.n8n.cloud/webhook-test/ofertas-gestion',
  tareas: 'https://abrahamnavarrete.app.n8n.cloud/webhook/tareas',
}

export interface RespuestaAgente {
  intent?: string
  data?: Record<string, unknown>
  mensaje?: string
}

function parseJSON(texto: string): RespuestaAgente | null {
  try {
    let s = texto.trim()
    const fence = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    if (fence) s = fence[1]!.trim()
    else { const a = s.indexOf('{'), b = s.lastIndexOf('}'); if (a !== -1 && b > a) s = s.slice(a, b + 1) }
    const o = JSON.parse(s)
    return (o && typeof o === 'object') ? o as RespuestaAgente : null
  } catch { return null }
}

function extraer(data: unknown): RespuestaAgente {
  let d: unknown = data
  if (Array.isArray(d) && d.length) d = d[0]
  if (d && typeof d === 'object') {
    const o = d as Record<string, unknown>
    if ('intent' in o) return o as RespuestaAgente
    const out = o.output ?? o.text ?? o.mensaje ?? o.response ?? o.message
    if (typeof out === 'string') return parseJSON(out) ?? { mensaje: out }
    if (out && typeof out === 'object' && 'intent' in (out as object)) return out as RespuestaAgente
  }
  if (typeof d === 'string') return parseJSON(d) ?? { mensaje: d }
  return { mensaje: 'No obtuve respuesta del agente.' }
}

export async function consultarAgente(
  canal: keyof typeof WEBHOOKS,
  mensaje: string,
  sessionId: string,
  contexto: Record<string, unknown> = {}
): Promise<RespuestaAgente> {
  try {
    const res = await fetch(WEBHOOKS[canal]!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje, chatInput: mensaje, sessionId, ...contexto }),
    })
    if (!res.ok) throw new Error(String(res.status))
    return extraer(await res.json())
  } catch {
    return { mensaje: '⚠ No pude consultar al agente n8n (revisa el webhook). Usa las opciones rápidas mientras tanto.' }
  }
}
