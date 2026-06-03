---
tags: [n8n, agente, configuracion, openai, gpt-5.1-mini]
created: 2026-06-03
updated: 2026-06-03
modelo: gpt-5.1-mini
---

# Configuración del nodo n8n (paso a paso) — GPT 5.1 mini

Guía completa para dejar el **Cerebro** del CRM funcionando con el nuevo prompt experto y el modelo **`gpt-5.1-mini`**. Aplica al workflow del webhook `/AgentCRMKPI` (ver [[Flujo-n8n-Cerebro]]).

> [!tip] Resumen en 1 línea
> Cambia el modelo a `gpt-5.1-mini`, pega el nuevo **System Prompt** de [[Pre-Prompt-Cerebro]], deja `temperature 0`, y verifica que el nodo Code reenvíe `presentacion` (con `kpis`/`insight`).

---

## Paso 0 — Antes de empezar
- Ten a la mano tu **API key de OpenAI** con acceso a `gpt-5.1-mini`.
- Abre el workflow que contiene el Webhook `AgentCRMKPI`.
- Frontend ya actualizado: acepta `presentacion.kpis` y `presentacion.insight`, y el nuevo formato `kpi`. No hay que tocar URLs (`aiAssistantService.ts` ya apunta a ese webhook).

---

## Paso 1 — Webhook (entrada)
1. Nodo **Webhook**.
2. **HTTP Method:** `POST`.
3. **Path:** `AgentCRMKPI`.
4. **Respond:** `Using 'Respond to Webhook' Node`.
5. Guarda. El frontend envía: `{ chatInput, sessionId, timestamp }`.

---

## Paso 2 — Set / Edit Fields ("Normalizar entrada")
Agrega un nodo **Edit Fields (Set)** después del Webhook con 3 campos (modo *Manual Mapping*, tipo String):

| Nombre | Valor (expresión) |
|--------|-------------------|
| `pregunta` | `{{ $json.body?.chatInput ?? $json.chatInput ?? $json.body?.pregunta ?? $json.pregunta ?? '' }}` |
| `sessionId` | `{{ $json.body?.sessionId ?? $json.sessionId ?? $json.body?.conversationId ?? 'anon' }}` |
| `fecha` | `{{ $json.body?.timestamp ?? $json.timestamp ?? $now }}` |

> [!note]
> Según la versión del Webhook, los datos llegan en `$json.body.*` o directo en `$json.*`. Las expresiones de arriba cubren ambos casos con `?.` y `??`. Cada celda debe empezar con `{{` y cerrar con `}}` (modo *Expression*, no *Fixed*). Tipo de los 3 campos: **String**.

---

## Paso 3 — AI Agent + modelo GPT 5.1 mini  ⭐ (lo importante)

### 3.1 Nodo del modelo
1. Agrega el sub-nodo **OpenAI Chat Model** (el que se conecta al AI Agent por la entrada *Chat Model*).
2. **Credential:** selecciona/crea tu credencial de OpenAI (pega la API key).
3. **Model:** escribe/selecciona **`gpt-5.1-mini`**.
   - Si no aparece en la lista, escríbelo manualmente en el campo (n8n acepta texto libre) o actualiza el nodo de OpenAI a la última versión.
4. **Options → Temperature:** `0` (SQL estable y reproducible).
5. *(Opcional)* **Response Format:** `JSON Object` si tu versión del nodo lo ofrece — fuerza JSON válido. Si no, no pasa nada: el nodo Code limpia y parsea igual.

### 3.2 Nodo AI Agent
1. **Agent type:** *Tools Agent* (o *Conversational*). No necesita herramientas; solo razonará.
2. **Prompt / User Message:** `{{ $json.pregunta }}`.
3. **System Message:** pega COMPLETO el bloque "System Prompt" de [[Pre-Prompt-Cerebro]] (incluye esquema, fórmula de rentabilidad, reglas de KPIs/insight y ejemplos).
4. **Memory:** conecta **Window Buffer Memory**.
   - **Session Key:** `{{ $json.sessionId }}`.
   - **Context Window Length:** 6–10.
   - Esto habilita el seguimiento: "ahora agrúpalo por estado", "y de esos los de Monterrey".

> [!warning] Sobre `gpt-5.1-mini`
> Es un modelo de razonamiento. Mantén `temperature 0`. Si tu nodo expone **Reasoning effort**, usa `low` o `medium` (para SQL no hace falta `high`; ahorras latencia/tokens). El prompt ya exige "responde solo JSON", así que no necesitas más.

---

## Paso 4 — Code ("Extraer y validar JSON")
Nodo **Code** (JavaScript) después del AI Agent. Limpia el markdown, parsea y revalida que sea solo lectura. **Reenvía `presentacion` completa** (con `kpis`/`insight`):

```javascript
const raw = $input.first().json;
let texto = raw.output ?? raw.text ?? raw.response ?? '';
if (typeof texto !== 'string') texto = JSON.stringify(texto);

// Extraer JSON de un bloque ```json o entre llaves
const fence = texto.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
if (fence) texto = fence[1];
else {
  const a = texto.indexOf('{'), b = texto.lastIndexOf('}');
  if (a !== -1 && b > a) texto = texto.slice(a, b + 1);
}

let plan;
try { plan = JSON.parse(texto); }
catch (e) { return [{ json: { error: 'JSON inválido del agente', raw: texto } }]; }

// Seguridad: solo SELECT/WITH (el frontend revalida igual)
if (plan.sql) {
  const s = plan.sql.trim().toUpperCase();
  const prohibidas = ['INSERT','UPDATE','DELETE','DROP','CREATE','ALTER','TRUNCATE','EXEC'];
  if (prohibidas.some(p => s.startsWith(p)) || !(s.startsWith('SELECT') || s.startsWith('WITH'))) {
    return [{ json: { error: 'Solo se permiten consultas SELECT' } }];
  }
}

// Conservar presentacion (incluye kpis e insight si vienen)
plan.presentacion = plan.presentacion || null;
return [{ json: plan }];
```

---

## Paso 5 — Respond to Webhook
1. Nodo **Respond to Webhook**.
2. **Respond With:** `JSON`.
3. **Response Body:** `{{ $json }}`.

---

## Paso 6 — Probar
1. Activa el workflow (toggle **Active**).
2. En el CRM, abre el chat y prueba estas consultas (de menor a mayor complejidad):
   - "¿cuántos clientes activos tengo?" → formato `texto`.
   - "distribución de oportunidades por etapa" → `grafico_pie`.
   - "¿quién es mi cliente más rentable y por qué?" → **`kpi`** (tarjetas + tabla + insight).
   - "top 5 con TDC pero sin nómina con su línea y vencimiento" → tabla + KPIs.
   - "contratos por vencer en 90 días" → tabla + KPIs (monto en riesgo).
3. Si algo falla, abre **Executions** en n8n y revisa la salida del AI Agent y del Code.

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| "JSON inválido del agente" | El modelo devolvió texto con explicación | Refuerza en el System Prompt "Responde SOLO JSON, sin ```"; activa Response Format = JSON Object. |
| Salen IDs/teléfonos que no deberían | — | El frontend ya aplica privacidad; no expongas PII junto a montos. |
| Los KPIs no aparecen | `columna` del KPI no existe en el SELECT | Asegúrate de que cada `kpis[].columna` coincida con un alias del `SELECT`. |
| "por vencer" sale vacío | Ventana de días corta o sin datos | Usa date('now','+N days'); revisa que el producto tenga `fechaVencimiento`. |
| Respuestas lentas | Reasoning effort alto | Baja a `low`/`medium`. |
| No mantiene contexto multi-turno | Memory mal configurada | Session Key = `{{ $json.sessionId }}`. |

---

## Qué cambió respecto a la versión anterior
- **Modelo:** `gpt-4.1-mini`/`gpt-4o-mini` → **`gpt-5.1-mini`**.
- **Persona:** ahora "analista senior experto en banca, CRM e indicadores".
- **Contrato:** `presentacion` admite **`kpis`** (tarjetas calculadas en el frontend, sin ver datos) y **`insight`** (el "porqué", en markdown).
- **Nuevo formato `kpi`:** tarjetas + tabla de desglose + insight (ideal para "quién es / por qué").
- **Esquema:** se añadió `fechaVencimiento` a `tdc`, `creditos` y `seguros` para "contratos/líneas por vencer".
- **Rentabilidad:** fórmula de margen anual por cliente embebida en el prompt.

## Referencias
- [[Pre-Prompt-Cerebro]] — system prompt a pegar
- [[Flujo-n8n-Cerebro]] — diagrama del workflow
- [[../tecnico/Catalogo-Funciones]] — atajo `{funcion, params}`
- [[../tecnico/Servicios#aiassistantservice]]
