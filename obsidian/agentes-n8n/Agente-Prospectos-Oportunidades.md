---
tags: [n8n, agente, prospectos, oportunidades]
created: 2026-06-02
updated: 2026-06-02
---

# Agente de Prospectos / Oportunidades

## Propósito

Interpreta solicitudes para **crear** y **actualizar** prospectos y ofertas (oportunidades). Implementado en `prospectosAgentService.ts` con función `enviarAlAgente(mensaje, sessionId, contexto)`.

## Webhooks

| Contexto | Webhook |
|----------|---------|
| `prospectos` (default) | `.../webhook/prospect` |
| `oportunidades` | `.../webhook/Register` |

## Request

```json
{
  "mensaje": "texto (+ instrucción de sistema en oportunidades)",
  "sessionId": "...",
  "fechaActual": "YYYY-MM-DD",
  "horaActual": "HH:mm",
  "contexto": "prospectos | oportunidades"
}
```

En contexto `oportunidades` se inyecta instrucción del sistema con las familias válidas y extracción de `montoOferta`.

## Response — Intents

```json
{
  "intent": "CREAR_PROSPECTO | ACTUALIZAR_PROSPECTO | CREAR_OFERTA | ACTUALIZAR_OFERTA",
  "data": {
    "nombre": "...", "rfc": "...", "contacto": "...",
    "producto": "...",
    "campo": "etapa | monto | producto | contacto | montoOferta",
    "valor": "...",
    "idOferta": "..."
  },
  "mensaje": "..."
}
```

Si no hay intent, devuelve texto plano (`output` / `text` / `message`).

## Familias de producto válidas

`TDC`, `TPV`, `Cheques`, `Crédito`, `Seguros`, `Nóminas`.
Si el usuario dice "TDC Oro" → familia `TDC`, producto `TDC Oro`.

## Reglas de negocio

Ver [[negocio/Oportunidades]] y [[negocio/Prospectos]] para etapas y validaciones.

## Referencias

- [[tecnico/Servicios#prospectosagentservice]]
- [[negocio/Oportunidades]]
- [[negocio/Prospectos]]
