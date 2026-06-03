---
tags: [n8n, agente, procedimientos]
created: 2026-06-02
updated: 2026-06-02
---

# Agente de Procedimientos

## Propósito

Guía al ejecutivo paso a paso en procedimientos operativos (ej. contratación de TDC). Activo cuando `chatMode === 'procedimientos'`.

## Webhook

`https://abrahamnavarrete.app.n8n.cloud/webhook/procedimientos`

## Request

```json
{
  "pregunta": "...",
  "contexto": "<texto generado por generarTextoProcedimientos()>",
  "sessionId": "proc-<timestamp>"
}
```

El contexto se arma desde `@/data/procedimientosData`.

## Response

```json
{ "output": "texto markdown" }
```

También acepta `respuesta`, string directo o array.

## Fallback local

Si el webhook responde 404/500 o falla la red, el cliente genera respuestas locales (`generarRespuestaLocal`) basadas en palabras clave: documentos, rechazo/riesgo, tasa, pasos, excepciones/PEP/buró.

## Contenido cubierto

Ver [[negocio/Procedimiento-Contratacion-TDC]] para las reglas de negocio documentadas en el fallback.

## Referencias

- [[tecnico/Servicios#procedimientosagentservice]]
- [[negocio/Procedimiento-Contratacion-TDC]]
