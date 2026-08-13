---
tags: [tecnico, agente, chat, generative-ui, modulo]
created: 2026-08-12
updated: 2026-08-12
---

# Módulo Agente CRM (chat con UI generativa)

Demo reinventada: el CRM completo ocurre dentro de una conversación. El agente no responde solo texto — devuelve **bloques de UI interactivos** (tarjetas, tablas, formularios, confirmaciones, flash cards) que se renderizan en línea en el chat.

Vista por defecto de la app (`nav.store.view = 'agente'`). Convive con [[tecnico/Chat]] (el chat de datos anterior, ahora "Chat de datos").

## Patrón de diseño

Sigue el patrón **static generative UI**: el frontend es dueño del catálogo de componentes y el agente solo elige cuál renderizar y con qué datos. El agente no puede inventar interfaz — si un bloque no está en [[tecnico/Agente-CRM-Chat#Catálogo de bloques]], no se dibuja.

Tres principios tomados de las guías de Agent UX 2026:
1. **Transparencia** — cada turno muestra el plan de pasos y el nombre de la herramienta ejecutada.
2. **Human in the loop** — ninguna escritura ocurre sin formulario o tarjeta de confirmación previa con el detalle de lo que cambia.
3. **Rendición de cuentas** — el rail lateral lleva bitácora de todo lo que el agente modificó.

## Archivos

### Lógica (`src/agentic/`)

| Archivo | Rol |
|---|---|
| `data.ts` | Dataset determinista (PRNG semilla `20260812`): 48 clientes, ~120 ofertas, tareas, actividades, 7 productos, 6 playbooks. `HOY = 12/08/2026` |
| `types.ts` | Contrato de UI generativa: `Block`, `AgentAction`, `FormSpec`, `ConfirmSpec`, `PasoPlan`, `Turno`, `EventoAgente` |
| `tools.ts` | Herramientas de portafolio: `resumenPortafolio`, `ofertasEstancadas`, `ofertasQueCierran`, `ofertasPorEtapa`. Exporta `fichaCliente` / `fichaOferta` |
| `toolsClientes.ts` | Consulta: `buscar`, `abrirCliente`, `abrirOferta`, `clientesEnRiesgo`, `recomendarProducto`, `verProducto`, `verPlaybook`, `verHistorial`, `analizarCierres` |
| `toolsAcciones.ts` | Formularios, confirmaciones y mutaciones: `form*`, `confirmar*`, `crear*`, `aplicar*`, `planDelDia` |
| `engine.ts` | Registro `HERRAMIENTAS`, `interpretar()` (NLU por reglas en español) y generadores `correrAgente` / `ejecutarHerramienta` |
| `sugerencias.ts` | `SUGERENCIAS` (pantalla de bienvenida) y `COMANDOS` (autocompletado con `/`) |

### UI (`src/components/agente/`)

| Archivo | Rol |
|---|---|
| `AgenteContainer.tsx` | Shell: header con estado, lista de turnos, composer y rail |
| `Turno.tsx` | Turno de usuario o de agente (plan de pasos + texto markdown + bloques) |
| `Composer.tsx` | Entrada con autoajuste, comandos `/` navegables con flechas, chip de contexto |
| `Bienvenida.tsx` | Catálogo de capacidades agrupado en Ejecutar / Vender / Analizar / Aprender |
| `RailContexto.tsx` | Entidad activa, bitácora de acciones y atajos (colapsable) |
| `ui.tsx` | Primitivas: `useTema`, `Icono`, `Badge`, `Panel`, `Avatar`, `BotonAccion`, tonos |
| `bloques/Renderizador.tsx` | Catálogo: traduce `Block` → componente |
| `bloques/BloquesDatos.tsx` | `kpis`, `table`, `chart`, `pipeline`, `compare` |
| `bloques/BloquesFicha.tsx` | `record`, `records`, `timeline`, `note` |
| `bloques/BloquesAccion.tsx` | `form`, `confirm`, `choices`, `checklist`, `result`, `flashcards` |

### Estado

`src/stores/agente.store.ts` — consume los eventos del motor y va parchando el turno en curso (plan paso a paso antes de los bloques). Guarda `turnos`, `contexto`, `bitacora` y `consumidos` (bloques de un solo uso ya resueltos).

## Catálogo de bloques

| `kind` | Componente | Uso |
|---|---|---|
| `kpis` | Flash cards métricas | Embudo, pronóstico, tasa de cierre |
| `table` | Tabla ordenable y paginada | Listados de ofertas y clientes, con acción por fila |
| `chart` | Barras / dona | Distribución por familia, monto ganado |
| `pipeline` | Embudo clicable | Ofertas por etapa |
| `compare` | Comparativo por columnas | Tres productos recomendados |
| `record` | Ficha completa con medidor | Cliente u oferta |
| `records` | Rejilla o carrusel de fichas | Resultados múltiples, ofertas calientes |
| `timeline` | Línea de tiempo | Historial de interacciones |
| `note` | Insight con markdown | Alertas y lectura del dato |
| `form` | Formulario dinámico | Alta/edición de oferta, tarea, actividad |
| `confirm` | Confirmación con diff antes/después | Avanzar etapa, marcar perdida, lote de tareas |
| `choices` | Chips de acción | Siguientes pasos sugeridos |
| `checklist` | Lista marcable | Plan del día, requisitos de expediente |
| `result` | Resultado de escritura | Confirmación de lo aplicado |
| `flashcards` | Tarjetas volteables | Playbook de objeciones y cierre |

## Acciones

`AgentAction` tiene dos modos:
- `send` — manda texto al agente como si lo hubiera escrito el usuario (pasa por `interpretar`).
- `run` — ejecuta una herramienta directo por nombre, sin interpretación.

En tablas, `accionFila` soporta plantillas: `{id}` y `{nombre}` se sustituyen con los valores de la fila.

## Enrutado de intención

`interpretar()` en `engine.ts` es una cascada de reglas en orden. Puntos delicados ya resueltos:
- La analítica de cierres va **antes** que la ficha de producto (la frase "cierres por producto" contiene "producto").
- El alta de oferta se detecta con `oferta` + cualquier verbo de alta, no con frases exactas.
- "Registrar…" se excluye si la frase menciona "oferta" (eso es un alta, no una interacción).
- `resolverCliente` reintenta con lo que sigue a la última preposición, para que "abre la ficha de Grupo X" encuentre al cliente.

## Ver también

- [[tecnico/Componentes]]
- [[tecnico/Stores]]
- [[negocio/Ofertas]]
- [[tecnico/Chat]]
