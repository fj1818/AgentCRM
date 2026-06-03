---
tags: [tecnico, agente, funciones, optimizacion]
created: 2026-06-02
updated: 2026-06-02
---

# Catálogo de Funciones del Agente

`src/services/agentFunctions.ts`

## Objetivo

Eliminar el SQL libre y el reenvío de filas al LLM. El **cerebro** (agente n8n) solo elige una función y sus parámetros: `{ funcion, params }`. El código construye el SQL exacto, lo ejecuta en [[Base-de-Datos-SQL]] y lo formatea con la pista de presentación de la función — **sin llamar al [[../agentes-n8n/Agente-Presentacion|Agente de Presentación]]**.

```mermaid
graph LR
    Q[Pregunta] --> Brain[Agente n8n: elige funcion+params]
    Brain --> Cat[construirFuncion]
    Cat --> SQL[(ejecutarSQL local)]
    SQL --> Fmt[formatearConPresentacion + privacidad]
    Fmt --> UI[Render]
```

## Beneficios

- Salida del LLM ~20 tokens (nombre + params) en vez de SQL largo.
- **0 tokens** en presentación (la decide la función).
- Precisión: params validados/whitelist, sin SQL inválido ni inyección.
- 1 sola llamada LLM (antes 2).

## Funciones disponibles

| Función | Params | Presentación |
|---------|--------|--------------|
| `listadoClientes` | soloActivos, limite | tabla |
| `detalleCliente` | ide* | tabla |
| `topClientesPorSaldo` | producto* (tdc/cheques/tpv/creditos), limite | tabla |
| `variacionesRelevantes` | tipo (ingreso/egreso/ambos), limite | tabla |
| `listadoProspectos` | etapa, familia, limite | tabla |
| `listadoOportunidades` | etapa, familia, limite | tabla |
| `conteoPorEtapa` | entidad (oportunidades/prospectos) | gráfico pie |
| `montoPorFamilia` | — | gráfico bar |

\* requerido. Todos los `limite` están acotados (clamp) y los enums en whitelist.

## API del módulo

- `construirFuncion(nombre, params)` → `{ sql, presentacion } | { error }`
- `existeFuncion(nombre)` → boolean
- `descripcionCatalogoParaPrompt()` → texto del catálogo para el pre-prompt n8n

## Integración

En [[Servicios#aiassistantservice]] (`procesarPregunta`): si la respuesta del agente trae `funcion` válida → ruta de catálogo. Si no, **fallback** a la ruta de SQL libre + Agente de Presentación (compatibilidad).

## Cómo agregar una función

Añadir una entrada a `CATALOGO` con `nombre`, `descripcion`, `params` y `construir(params)` que devuelva `{ sql, presentacion }`. Actualizar el pre-prompt de n8n con [[../agentes-n8n/Pre-Prompt-Cerebro]].

## Referencias

- [[../agentes-n8n/Pre-Prompt-Cerebro]] — prompt del agente
- [[../agentes-n8n/Agente-SQL-Generator]]
- [[Servicios#aiassistantservice]]
- [[../negocio/Privacidad-Datos]]
