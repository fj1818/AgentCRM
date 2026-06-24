# CRM Demo — Apps Script

Versión web del CRM para probar en Google Drive con **Google Apps Script** (sin Node, sin Sheets; datos embebidos en `Data.gs`).

## Archivos
- `appsscript.json` — manifiesto (web app, V8).
- `Code.gs` — `doGet` (sirve la SPA), `include`, `getSeed`, `consultarAgente` (passthrough n8n).
- `Data.gs` — datos semilla (clientes, prospectos, ofertas, contratos, catálogos).
- `Index.html` — layout base (sidebar + contenido + overlay).
- `Styles.html` — estilos.
- `App.html` — lógica de la SPA (Ofertas, Ciclo de vida, Procesos, Tareas).

## Cómo desplegar (opción rápida: pegar a mano)
1. Ve a https://script.google.com → **Nuevo proyecto**.
2. Crea los archivos con estos nombres exactos:
   - `Code.gs` y `Data.gs` (Archivo → Nuevo → Script).
   - `Index.html`, `Styles.html`, `App.html` (Archivo → Nuevo → HTML).
   - Pega el contenido de cada archivo de esta carpeta.
3. Proyecto → ⚙ **Configuración** → activa "Mostrar appsscript.json" y pega el manifiesto, o deja el por defecto.
4. **Implementar → Nueva implementación → Aplicación web**:
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquiera** (o "Cualquiera con la cuenta de Google").
5. Autoriza permisos y abre la **URL /exec**.

## Cómo desplegar (opción recomendada: clasp)
```bash
npm i -g @google/clasp
clasp login
clasp create --type webapp --title "CRM Demo"   # genera .clasp.json
# copia estos archivos a la carpeta del proyecto y:
clasp push
clasp deploy
```

## Qué incluye la demo
- **Ofertas**: tabla con búsqueda + detalle (Info del cliente con botones WhatsApp/Correo/Llamada, Info de la oferta editable —etapa/monto, en memoria—, y Ciclo de vida 360).
- **Ciclo de vida**: lista de clientes/prospectos + detalle en 2 secciones (identidad / 360). Prospecto sin productos.
- **Procesos de contratación**: flash cards → pantalla cascarón del proceso.
- **Tareas**: alta y listado de tareas/reuniones (en memoria).
- **Contacto**: WhatsApp (`wa.me`), Correo (`mailto:`) y Llamada (`tel:`) reales.

## Agentes y chat (funcionando)
`consultarAgente(canal, mensaje, sessionId, contexto)` en `Code.gs` hace el POST a los webhooks n8n (evita CORS). Canales: `datos` (chat), `ofertasCrear`, `ofertasGestion`, `tareas`.

- **Chat de datos** (módulo Chat): usa **sql.js** (CDN) + `getDbSeed()` (tablas ide-based reducidas). El agente n8n (`AgentCRMKPI`) devuelve `{sql, presentacion}`; el cliente ejecuta el SQL localmente y renderiza tabla / KPIs / insight.
- **Asistente de Ofertas (crear)**: panel en la vista Ofertas → intent `CREAR_OFERTA`/`CREAR_PROSPECTO` → crea la oferta.
- **Agente de gestión**: en el detalle de oferta → intent `ACTUALIZAR_OFERTA` → cambia etapa/monto real.
- **Agente de Tareas**: en el módulo Tareas → intent `CREAR_TAREA`/`CREAR_REUNION` → agrega a la lista.

Requisitos: el chat necesita internet (CDN sql.js) y webhooks n8n activos. `ofertas-gestion` usa `webhook-test` (cámbiala a `webhook` al publicar el workflow).

## Notas
- Los datos son **embebidos y en memoria**: los cambios (etapa, monto, tareas) no persisten al recargar. Para persistir, conecta a una hoja de Google Sheets o `PropertiesService`.
- Sin marcas de banco; un solo tema claro.
