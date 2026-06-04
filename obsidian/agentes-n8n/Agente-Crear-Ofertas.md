---
tags: [n8n, agente, ofertas, crear, configuracion]
created: 2026-06-03
updated: 2026-06-03
---

# Agente n8n — Crear Ofertas

Alta de ofertas de **cliente** o **prospecto** por lenguaje natural. Devuelve un **intent**; el frontend (`AsistenteOfertasPanel`) lo ejecuta sobre el store (`createClientOffer` / `createProspectOffer`).

- **Webhook:** `POST /ofertas-crear`
- **Usado por:** panel de Ofertas (tabla)
- **Escribe datos:** NO (el frontend ejecuta el cambio real)

## Flujo de nodos

```mermaid
graph LR
  WH[1. Webhook POST] --> NORM[2. Set: Normalizar]
  NORM --> MEM[(Window Memory por sessionId)]
  MEM --> AG[3. AI Agent + OpenAI]
  AG --> CODE[4. Code: extraer JSON]
  CODE --> RESP[5. Respond to Webhook]
```

### 1. Webhook
- Method `POST` · Path `ofertas-crear`
- Response Mode: **Using 'Respond to Webhook' node**
- Body recibido: `{ mensaje, chatInput, sessionId }`

### 2. Set / Edit Fields — "Normalizar"
| Campo | Valor |
|-------|-------|
| `pregunta` | `{{ $json.body?.mensaje ?? $json.body?.chatInput ?? $json.mensaje ?? '' }}` |
| `sessionId` | `{{ $json.body?.sessionId ?? $json.sessionId ?? 'anon' }}` |

### 3. AI Agent (OpenAI)
- Chat Model: **OpenAI** `gpt-5.1-mini` · temperature **0**
- Memory: **Window Buffer Memory**, key `{{ $json.sessionId }}`, ventana 6
- User message: `{{ $json.pregunta }}`
- System message: (pegar)

```
Eres un asistente de ALTA DE OFERTAS de un CRM bancario. Conviertes la solicitud del
ejecutivo en un intent para crear una oferta. NO ejecutas nada: solo devuelves JSON.

Responde EXCLUSIVAMENTE con JSON válido (sin ```):
{
  "intent": "CREAR_OFERTA" | "CREAR_PROSPECTO",
  "data": {
    "tipo": "Cliente" | "Prospecto",
    "rfc": "RFC si lo dan",
    "nombre": "nombre del cliente/prospecto",
    "familia": "familia de producto (nombre exacto del catálogo)",
    "tipoPersona": "PF | PFAE | PM (solo prospecto)",
    "correo": "(solo prospecto, opcional)",
    "telefono": "(solo prospecto, opcional)"
  },
  "mensaje": "confirmación breve y clara para el ejecutivo"
}

REGLAS:
- Cliente EXISTENTE (dan RFC, número o nombre conocido) -> intent CREAR_OFERTA, tipo "Cliente".
  Requiere identificar al cliente (rfc o nombre) y la familia de producto.
- Cliente NUEVO / prospecto -> intent CREAR_PROSPECTO, tipo "Prospecto".
  Requiere: nombre, tipoPersona (PF/PFAE/PM), rfc, (correo o teléfono) y familia.
- "familia" es el NOMBRE de la familia de producto. Catálogo válido:
  Cuenta de Cheques, Inversión, Banca Electrónica, Tarjeta de Crédito, Crédito Hipotecario,
  Crédito Comercial, Crédito Auto, Crédito Personal, Seguros, Nómina, Servicios,
  TDC Empresarial, TPV, Arrendamiento, Factoraje, Banca Digital.
  Si dicen "TDC" o "tarjeta" -> "Tarjeta de Crédito". Si "terminal" -> "TPV".
- Si falta un dato obligatorio, pídelo en "mensaje" y deja vacío ese campo.
- Solo JSON, nada de texto fuera del objeto.

EJEMPLOS:
"crea una oferta de TDC para el cliente con RFC GARA850101AB1"
{ "intent":"CREAR_OFERTA","data":{"tipo":"Cliente","rfc":"GARA850101AB1","familia":"Tarjeta de Crédito"},"mensaje":"Creando oferta de Tarjeta de Crédito para el cliente." }

"nuevo prospecto Juan Pérez persona física RFC PEXJ900101AB1 correo juan@mail.com interesado en crédito personal"
{ "intent":"CREAR_PROSPECTO","data":{"tipo":"Prospecto","nombre":"Juan Pérez","tipoPersona":"PF","rfc":"PEXJ900101AB1","correo":"juan@mail.com","familia":"Crédito Personal"},"mensaje":"Registrando prospecto Juan Pérez con oferta de Crédito Personal." }
```

### 4. Code — "Extraer JSON"
```javascript
const raw = $input.first().json;
let t = raw.output ?? raw.text ?? raw.response ?? JSON.stringify(raw);
const f = String(t).match(/```(?:json)?\s*([\s\S]*?)\s*```/i); if (f) t = f[1];
let plan; try { plan = JSON.parse(t); } catch { plan = { mensaje: String(t) }; }
return [{ json: plan }];
```

### 5. Respond to Webhook
- Respond With **JSON** · Body `{{ $json }}`

## Ejecución en el frontend
`AsistenteOfertasPanel.ejecutarCrear`: resuelve `familia`→id (`resolverFamiliaId`) y `rfc` (o busca por nombre con `searchClients`), luego llama `createClientOffer({rfc, idFamilia})` o `createProspectOffer({...})`. Errores de validación (RFC inválido, etc.) se muestran al usuario.

## Referencias
- [[Agentes-Gestion]] · [[Agente-Gestion-Ofertas]] · [[Agente-Tareas]]
- `src/services/asistenteN8n.ts`, `src/components/ofertas/AsistenteOfertasPanel.tsx`
