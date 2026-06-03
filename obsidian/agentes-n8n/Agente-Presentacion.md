---
tags: [n8n, agente, presentacion]
created: 2026-06-02
updated: 2026-06-02
---

# Agente de Presentación

## Propósito

Decide cómo presentar los datos: texto, tabla, multi-tabla o gráfico. Era el **Agente 2** de la arquitectura dual-agent.

> [!warning] Desactivado por defecto
> La presentación ahora se decide **localmente sin tokens** (`decidirPresentacionLocal` en [[../tecnico/Servicios#aiassistantservice]]), para **cualquier** consulta. Este agente solo se llama si `USAR_AGENTE_PRESENTACION = true`, y en ese caso recibe **solo 3 filas de muestra** (no todas). Aplica tanto a consultas del [[../tecnico/Catalogo-Funciones|catálogo]] como a SQL libre.

## Webhook

`https://abrahamnavarrete.app.n8n.cloud/webhook/presenter`

## Request

```json
{
  "preguntaOriginal": "...",
  "datosSQL": [{...}],
  "columnas": ["col1", "col2"],
  "sessionId": "..."
}
```

## Response esperada

```json
{
  "formato": "texto | tabla | multi_tabla | grafico_bar | grafico_pie | grafico_line | grafico_polar | multi_grafico",
  "titulo": "...",
  "subtitulo": "...",
  "ejeX": "columna",
  "ejeY": "columna",
  "mensaje_interpretacion": "...",
  "configuracion_adicional": {
    "mostrar_totales": true,
    "ordenar_por": "...",
    "limite_registros": 100
  },
  "tablas": [{ "titulo": "", "columnas": [], "datos": [] }]
}
```

## Comportamiento en cliente

- Si el agente falla/no responde → fallback a formato `tabla`.
- Tablas con > 20 registros → paginación automática (pageSize 20).
- **Tablas**: aplican [[negocio/Privacidad-Datos|reglas de privacidad PII]].
- **Gráficos**: usan datos originales (sin filtro de privacidad) porque muestran categorías agregadas.

## Referencias

- [[Agente-SQL-Generator]] — Agente 1
- [[tecnico/Servicios#aiassistantservice]]
- [[negocio/Privacidad-Datos]]
