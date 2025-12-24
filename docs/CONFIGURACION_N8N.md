# Configuración de n8n para el Asistente IA

## Estructura del Flujo

```
[Webhook] → [Edit Fields] → [AI Agent] → [Respond to Webhook]
                              ↓
                     [OpenAI Chat Model]
```

---

## 1. Nodo Webhook (Entrada)

El webhook recibe datos con esta estructura:

```json
{
  "chatInput": "Pregunta del usuario",
  "context": {
    "totalClientes": 1000,
    "totalTDC": 750,
    "promptSistema": "El prompt del sistema completo...",
    "fechaConsulta": "2024-12-22T17:30:00.000Z"
  },
  "timestamp": "2024-12-22T17:30:00.000Z"
}
```

---

## 2. Nodo Edit Fields - CONFIGURACIÓN CORRECTA

### Opción A: Acceso Directo (Recomendado)

Si el webhook pasa los datos directamente:

| Campo          | Tipo   | Valor                                  |
| -------------- | ------ | -------------------------------------- |
| `chatInput`    | String | `{{$json.body.chatInput}}`             |
| `context`      | Object | `{{$json.body.context}}`               |
| `systemPrompt` | String | `{{$json.body.context.promptSistema}}` |

### Opción B: Si los datos vienen anidados

Si ves que llegan en `body.body`:

| Campo          | Tipo   | Valor                                       |
| -------------- | ------ | ------------------------------------------- |
| `chatInput`    | String | `{{$json.body.body.chatInput}}`             |
| `context`      | Object | `{{$json.body.body.context}}`               |
| `systemPrompt` | String | `{{$json.body.body.context.promptSistema}}` |

### ⚠️ Solución para null

Si recibes `[null]`, prueba usar una expresión JavaScript:

```javascript
// En el campo chatInput:
{
  {
    $json.body?.chatInput ||
      $json.chatInput ||
      $json.body?.body?.chatInput ||
      "Sin mensaje";
  }
}

// En el campo context:
{
  {
    $json.body?.context || $json.context || $json.body?.body?.context || {};
  }
}
```

---

## 3. Nodo AI Agent - CONFIGURACIÓN CRÍTICA ⚠️

### El problema actual:

El AI Agent recibe el `promptSistema` pero NO lo está usando como System Message. Por eso responde genéricamente en lugar de usar los datos.

### Configuración del AI Agent:

#### Pestaña "Options":

| Campo              | Valor                                        |
| ------------------ | -------------------------------------------- |
| **System Message** | `{{$node["Edit Fields"].json.systemPrompt}}` |

#### Pestaña Principal:

| Campo      | Valor                                     |
| ---------- | ----------------------------------------- |
| **Prompt** | `{{$node["Edit Fields"].json.chatInput}}` |

### ⚠️ MUY IMPORTANTE:

El System Message DEBE contener el `promptSistema` para que el AI tenga acceso a los datos. Si no lo configuras, el AI no sabe qué datos hay disponibles.

### Alternativa: System Message estático con datos dinámicos

Si prefieres tener un System Message más controlado, puedes usar una expresión:

```
Eres un asistente de Banregio/Hey CRM.

DATOS ACTUALES:
- Total TDC: {{$node["Edit Fields"].json.context.totalTDC}}
- TDC Activas: {{$node["Edit Fields"].json.context.tdcActivas}}
- Total Clientes: {{$node["Edit Fields"].json.context.totalClientes}}

USA ESTOS DATOS para responder las preguntas del usuario.
Responde en español y de forma concisa.
Si te piden gráficos, incluye [GRAFICO:tipo:titulo] en tu respuesta.
```

---

## 3.1 Agregar más datos al contexto

Para que el AI pueda responder preguntas como "¿Cuántas TDC activas tengo?", necesitamos enviar esos datos en el contexto.

### Actualización necesaria en Edit Fields:

Agrega estos campos adicionales:

| Campo        | Tipo   | Valor                                         |
| ------------ | ------ | --------------------------------------------- |
| `tdcActivas` | Number | Extraer de `context.promptSistema` o calcular |
| `tdcPorTipo` | Object | `{ clasica: X, gold: Y, empresarial: Z }`     |

### O mejor: Usar el promptSistema completo

El `promptSistema` YA contiene todo:

- TDC Activas: 784
- Por tipo: Clasica: 199, Gold: 346, Empresarial: 304
- Montos, etc.

El AI DEBE leer el System Message para encontrar esta información.

---

## 4. Nodo Respond to Webhook - CRÍTICO

Este nodo DEBE devolver la respuesta en un formato que el frontend pueda leer.

### Configuración:

**Response Code:** 200

**Response Headers:**

```
Content-Type: application/json
```

**Response Body (Expression):**

```json
{
  "output": "{{$json.output}}",
  "text": "{{$json.output}}",
  "respuesta": "{{$json.output}}"
}
```

### Expresión completa para el body:

```javascript
={{
  JSON.stringify({
    output: $json.output || $json.text || "",
    respuesta: $json.output || $json.text || "",
    success: true
  })
}}
```

---

## 5. Verificación - Debug

### En el nodo Webhook, verifica qué estructura real llega:

1. Haz una petición de prueba desde el chat
2. En n8n, ve al log del nodo Webhook
3. Verifica la estructura exacta de `$json`

### Estructura esperada en el OUTPUT del Webhook:

```json
{
  "headers": { ... },
  "params": { ... },
  "query": { ... },
  "body": {
    "chatInput": "¿Cuál es el cliente con la TDC más alta?",
    "context": {
      "totalClientes": 1000,
      "totalTDC": 750,
      "promptSistema": "...",
      "fechaConsulta": "..."
    },
    "timestamp": "..."
  }
}
```

Si ves `body.body`, entonces el frontend envía datos anidados y debes usar `$json.body.body.chatInput`.

---

## 6. Ejemplo de Flujo Completo

### Edit Fields (Configuración óptima):

```
Mode: Manual Mapping

Fields:
┌─────────────────┬────────┬─────────────────────────────────────────┐
│ Field Name      │ Type   │ Value                                   │
├─────────────────┼────────┼─────────────────────────────────────────┤
│ chatInput       │ String │ {{$json.body.chatInput}}                │
│ context         │ Object │ {{$json.body.context}}                  │
│ systemPrompt    │ String │ {{$json.body.context.promptSistema}}    │
└─────────────────┴────────┴─────────────────────────────────────────┘
```

### AI Agent:

- **Prompt:** `{{$node["Edit Fields"].json.chatInput}}`
- **System Message:** (Copiar prompt del sistema completo)

### Respond to Webhook:

- **Respond With:** JSON
- **Response Body:**

```json
{
  "output": "={{$json.output}}",
  "success": true
}
```

---

## 7. Instrucciones para Gráficos

El AI debe incluir en su respuesta la instrucción:

```
[GRAFICO:tipo:titulo]
```

Donde `tipo` puede ser:

- `pie` - Gráfico circular
- `bar` - Barras horizontales
- `column` - Barras verticales
- `line` - Línea

Ejemplo de respuesta del AI:

```
📊 Aquí está la distribución de TDC por tipo:

[GRAFICO:pie:Distribución de Tipos de TDC]

- Tarjeta Clásica: 35%
- Tarjeta Gold: 45%
- Tarjeta Empresarial: 20%
```

El frontend procesará automáticamente esta instrucción y generará el gráfico.

---

## 8. Troubleshooting

### Problema: Recibo `[null]` en Edit Fields

**Causa:** La ruta de acceso a los datos es incorrecta.

**Solución:**

1. Ejecuta el workflow manualmente
2. Ve a los logs del Webhook
3. Copia la estructura real del JSON
4. Ajusta las rutas en Edit Fields

### Problema: El chat muestra "Respuesta recibida del asistente."

**Causa:** El nodo Respond to Webhook no está enviando el campo correcto.

**Solución:**
Asegúrate de que el Response Body incluya:

```json
{ "output": "{{$json.output}}" }
```

### Problema: El gráfico no aparece

**Causa:** El AI no incluyó la instrucción `[GRAFICO:...]` en su respuesta.

**Solución:**
Incluye en el prompt del sistema ejemplos claros de cuándo y cómo usar la instrucción de gráfico.
