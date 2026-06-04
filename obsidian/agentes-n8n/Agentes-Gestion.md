---
tags: [n8n, agente, ofertas, tareas, gestion]
created: 2026-06-03
updated: 2026-06-03
---

# Agentes de Gestión (n8n) — Ofertas y Tareas

Tres agentes que devuelven un **INTENT estructurado**; el frontend lo **ejecuta sobre el store** (cambio real). Cliente: `src/services/asistenteN8n.ts` (`consultarAgente`). Cada uno = nodo Webhook → AI Agent (OpenAI) → Code (extraer JSON) → Respond. Mismo patrón que [[Flujo-n8n-Cerebro]].

> [!important]
> El frontend resuelve acciones simples **localmente**; lo que no entiende va al agente. El agente NO escribe datos: devuelve el intent y el frontend ejecuta `createClientOffer` / `createProspectOffer` / `updateOffer` / `agregarEvento`.

## 1. Crear Ofertas — webhook `/ofertas-crear`

Usado por `AsistenteOfertasPanel` (tabla de Ofertas).

Contrato de salida:
```json
{ "intent": "CREAR_OFERTA | CREAR_PROSPECTO",
  "data": { "tipo": "Cliente|Prospecto", "rfc": "", "nombre": "", "familia": "Tarjeta de Crédito",
            "tipoPersona": "PF|PFAE|PM", "correo": "", "telefono": "" },
  "mensaje": "Confirmación breve para el usuario" }
```
System prompt (resumen): "Eres asistente de alta de ofertas. Si es cliente existente → CREAR_OFERTA con rfc (o nombre) + familia. Si es nuevo prospecto → CREAR_PROSPECTO con nombre, tipoPersona, rfc, correo o teléfono, y familia. `familia` es el nombre de la familia de producto. Responde SOLO JSON."

Ejecución (frontend): resuelve `familia`→id, `rfc` (o busca por nombre) y llama `createClientOffer`/`createProspectOffer`.

## 2. Gestión de Ofertas — webhook `/ofertas-gestion`

Usado por `OfertaAgentePanel` (detalle). Recibe contexto `{ idOferta, etapa, tipoOferta }`.

Contrato de salida:
```json
{ "intent": "ACTUALIZAR_OFERTA",
  "data": { "campo": "etapa|monto|producto|motivo", "valor": "Negociación" },
  "mensaje": "Listo, actualicé la etapa a Negociación." }
```
(También acepta `data: { etapa, monto, producto, motivo }`.)

Validaciones que el agente debe respetar (el frontend revalida):
- `etapa` ∈ etapas permitidas según `tipoOferta` (oportunidad vs prospecto).
- `monto` > 0.
- Para etapa **Descartado**: `motivo` de descarte ≥ 20 caracteres.

Ejecución (frontend): `updateOffer(idOferta, mapGestionChanges(data))` → cambia el valor real en la gestión.

## 3. Tareas/Agenda — webhook `/tareas`

Usado por `AsistenteTareasPanel`. Recibe `{ fechaActual }` (para "hoy/mañana").

Contrato de salida:
```json
{ "intent": "CREAR_TAREA | CREAR_REUNION",
  "data": { "nombre": "", "fecha": "YYYY-MM-DD", "hora": "HH:MM", "duracion": 60 },
  "mensaje": "Agendado." }
```
System prompt (resumen): "Interpreta la solicitud y devuelve fecha en YYYY-MM-DD (resuelve hoy/mañana/día de semana con `fechaActual`). `hora` solo para reuniones. Responde SOLO JSON."

Ejecución (frontend): `agregarEvento({ tipo, nombre, fecha, hora, duracion })`.

## Nodo Code (extraer intent) — común

```javascript
const raw = $input.first().json;
let t = raw.output ?? raw.text ?? raw.response ?? JSON.stringify(raw);
const f = String(t).match(/```(?:json)?\s*([\s\S]*?)\s*```/i); if (f) t = f[1];
let plan; try { plan = JSON.parse(t); } catch { plan = { mensaje: String(t) }; }
return [{ json: plan }];
```

## Referencias

- [[../tecnico/Ofertas-Modulo]] · [[../negocio/Tareas]]
- `src/services/asistenteN8n.ts`, `src/components/ofertas/asistente.ts`
