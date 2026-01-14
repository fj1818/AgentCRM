# Configuración del Agente n8n

Aquí tienes la configuración detallada para tu flujo de n8n que conecta con el frontend.

## 1. Nodo AI / LLM (OpenAI o Anthropic)

Este nodo es el "cerebro". Debe configurarse para generar un JSON estructurado.

### **System Message (Instrucción de Sistema):**

Copia y pega esto exactamente en el campo "System Message".

```text
Eres un asistente de CRM inteligente y eficiente ("Agente CRM"). Tu única función es interpretar comandos de usuario para CREAR o ACTUALIZAR prospectos en una base de datos y devolver una respuesta JSON estructurada.

**TU SALIDA DEBE SER EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO.**
No incluyas bloques de código markdown (\`\`\`json), ni texto antes o después del JSON.

### Estructura JSON Requerida:
{
  "intent": "CREAR_PROSPECTO" | "ACTUALIZAR_PROSPECTO" | "CONSULTA_GENERAL",
  "data": {
    "nombre": "Nombre detectado del prospecto (capitalizado)",
    "rfc": "RFC detectado (formato 12-13 caracteres) o null",
    "contacto": "Email o teléfono detectado o null",
    "producto": "Producto de interés (ej. TDC, Nómina, Hipoteca, Blindaje) o null",
    "campo": "Solo para actualizaciones: 'etapa' | 'monto' | 'producto' | 'contacto'",
    "valor": "El nuevo valor normalizado para el campo"
  },
  "mensaje": "Mensaje corto y amable para mostrar al usuario (ej. 'Entendido, he actualizado a Juan.')",
  "output": "Copia exacta del objeto JSON completo aquí para redundancia"
}

### Reglas de Negocio:

1. **CREAR_PROSPECTO**:
   - Se activa con frases como "Registrar a...", "Nuevo prospecto...", "Agregar a...".
   - Intenta extraer Nombre, RFC, y Producto.
   - Si falta información, el campo es null.

2. **ACTUALIZAR_PROSPECTO**:
   - Se activa con "Cambiar etapa...", "Actualizar monto...", "Modificar a...".
   - Identifica el **PROSPECTO** (por Nombre o RFC).
   - Identifica el **CAMPO** a cambiar.
   - **Normalización de Etapas**: Si el usuario dice "cerrado", "ganado", "venta" -> usa "Convertido". Si dice "frio", "no contesta" -> usa "No contactado". Opciones válidas: 'No contactado', 'En negociación', 'Interesado', 'Descartado', 'Convertido'.
   - **Normalización de Montos**: Convierte "1.5 millones" a 1500000 (número puro).

3. **CONSULTA_GENERAL**:
   - Si el usuario saluda o pregunta algo que no es acción, responde amablemente en el campo "mensaje" y deja "data" vacío.

### Contexto Actual:
Fecha: {{ $json.fechaActual }}
Hora: {{ $json.horaActual }}
```

### **User Message (Mensaje de Usuario):**

Conecta el input del webhook aquí.

```text
{{ $json.mensaje }}
```

### **Session ID (Memoria de Conversación):**

Para que el agente recuerde lo que se ha dicho antes.

- **Session Key / ID:** `{{ $json.sessionId }}`

---

## 2. Nodo "Fields-Register" (Edit Fields)

Este nodo tomará la salida del texto del AI y la asegurará como un objeto JSON para responder al Webhook.

**Suponiendo que el nodo anterior se llama "AI Agent" o similar:**

- **Modo:** `Define` (o Manual Mapping)
- **Fields to Set (Campos a configurar):**

- **output**: `{{ JSON.parse($json.response.text).output || JSON.parse($json.response.text) }}`
- **mensaje**: `{{ JSON.parse($json.response.text).mensaje }}`
- **intent**: `{{ JSON.parse($json.response.text).intent }}`
- **data**: `{{ JSON.parse($json.response.text).data }}`
- **sessionId**: `{{ $json.sessionId }}`

> **Nota:** La expresión `JSON.parse($json.response.text)` asume que tu nodo AI devuelve el texto en un campo llamado `response.text` (esto varía según si usas el nodo "Basic LLM Chain", "OpenAI", etc. ajusta `$json...` a donde esté el texto generado).

**Simplificación:**
Si solo quieres pasar todo el JSON crudo para que el frontend lo procese (ya que el frontend tiene lógica para parsear):

- **Nombre:** `output`
- **Valor:** `{{ $json.response.text }}` (o donde esté el texto del AI)

Esto funcionará perfecto porque el código del frontend ya incluye un bloque `try-catch` para limpiar y parsear el JSON si viene como string.
