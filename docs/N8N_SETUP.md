# Configuración del Webhook n8n

## Requisitos

1. Instancia de n8n ejecutándose
2. Credenciales de OpenAI configuradas en n8n

## Crear el Workflow

### 1. Webhook Trigger

Crear un nodo **Webhook** con:
- Method: POST
- Path: `/agent-crm`
- Response Mode: Last Node

### 2. Procesar Mensaje

El payload que recibirás:

```json
{
  "message": "Muéstrame los contactos activos",
  "conversationId": "conv_123456",
  "context": {
    "previousMessages": [
      { "role": "user", "content": "..." },
      { "role": "assistant", "content": "..." }
    ],
    "activeEntity": {
      "type": "contact",
      "id": "123",
      "data": {}
    }
  }
}
```

### 3. Nodo OpenAI

Configurar con:
- Model: gpt-4 o gpt-3.5-turbo
- System Prompt: Ver abajo
- Messages: Construir desde el contexto

#### System Prompt Sugerido

```
Eres un asistente de CRM inteligente. Tu trabajo es:

1. Responder preguntas sobre datos del CRM
2. Mostrar tablas de datos cuando sea apropiado
3. Generar gráficos cuando el usuario lo pida
4. Ayudar a actualizar registros

Cuando necesites mostrar datos estructurados, responde en formato JSON:

Para tablas:
{
  "action": "show_table",
  "entityType": "contact",
  "message": "Aquí están los contactos activos:",
  "data": {
    "headers": ["Nombre", "Email", "Estado"],
    "rows": [...]
  }
}

Para gráficos:
{
  "action": "show_chart",
  "chartType": "bar",
  "message": "Gráfico de ventas por mes:",
  "data": [...]
}

Para actualizaciones:
{
  "action": "show_form",
  "entityType": "contact",
  "entityId": "123",
  "message": "¿Quieres actualizar este contacto?",
  "fields": [...]
}

Si es solo texto, responde normalmente sin JSON.
```

### 4. Formatear Respuesta

Crear un nodo **Code** para estructurar la respuesta:

```javascript
const response = $input.first().json;

// Si es JSON, parsear
try {
  const parsed = JSON.parse(response.text);
  return {
    message: parsed.message,
    action: {
      type: parsed.action,
      entityType: parsed.entityType,
      payload: parsed.data
    }
  };
} catch {
  // Si es texto plano
  return {
    message: response.text,
    action: null
  };
}
```

### 5. Respond to Webhook

Configurar para devolver el resultado del nodo anterior.

## Variables de Entorno

En el frontend, configurar `.env`:

```env
VITE_WEBHOOK_URL=https://tu-n8n.com/webhook/agent-crm
```

## Testear

1. Iniciar n8n
2. Activar el workflow
3. Iniciar el frontend con `npm run dev`
4. Enviar un mensaje en el chat

