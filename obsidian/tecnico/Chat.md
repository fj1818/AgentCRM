---
tags: [tecnico, chat]
created: 2026-06-02
updated: 2026-06-02
---

# Sistema de Chat

`src/components/chat/` + [[Stores#chat-store]].

## Componentes

| Componente | Rol |
|------------|-----|
| `ChatContainer` | Orquestador principal |
| `ChatHeader` | Encabezado, selector de modo |
| `MessageList` | Lista de mensajes |
| `ChatMessage` | Renderiza un mensaje (texto/tabla/gráfico/multi) |
| `ChatInput` | Entrada de texto |
| `TypingIndicator` | Indicador de "escribiendo" |
| `WelcomeMessage` | Mensaje inicial + sugerencias |
| `PromptLibrary` | Biblioteca de prompts predefinidos |
| `FilterableProductTable` | Tabla de productos filtrable |
| `OfferDetailModal` | Detalle de oferta |

## Modos (`chatMode`)

- **`datos`** → `procesarPregunta` ([[Servicios#aiassistantservice]], dual-agent SQL).
- **`procedimientos`** → `procesarPreguntaProcedimiento` ([[Servicios#procedimientosagentservice]]).

## Flujo de mensaje

```mermaid
sequenceDiagram
    Usuario->>chat.store: sendMessage(content)
    chat.store->>Servicio IA: procesarPregunta / procedimiento
    Servicio IA-->>chat.store: AIResponse {respuesta, grafico?, tabla?, tablas?}
    chat.store->>ChatMessage: addMessage(assistant)
    ChatMessage->>UI: render texto/tabla/grafico
```

El mensaje del asistente lleva `grafico`, `tabla` y/o `tablas` adjuntos. El store también guarda `ultimoGrafico` / `ultimaTabla` para compatibilidad.

## Referencias

- [[Stores#chat-store]]
- [[Servicios]]
- [[../agentes-n8n/Agente-Principal]]
