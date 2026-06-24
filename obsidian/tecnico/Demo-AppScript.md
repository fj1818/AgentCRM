---
tags: [tecnico, appscript, demo]
created: 2026-06-03
updated: 2026-06-04
---

# Demo AppScript (Google Drive)

Versión web del CRM en **Google Apps Script** para probar en Drive, sin Node ni Sheets (datos embebidos). Carpeta: `demoAppscript/`.

## Archivos
- `appsscript.json` — manifiesto (web app V8).
- `Code.gs` — `doGet`, `include`, `getSeed`, `consultarAgente` (passthrough n8n vía `UrlFetchApp`).
- `Data.gs` — `getSeedData()` genera clientes/prospectos, ofertas, contratos y catálogos (determinista).
- `Index.html` · `Styles.html` · `App.html` — SPA (sidebar + secciones + overlay).

## Cubre
**Chat de datos** (sql.js + n8n `AgentCRMKPI` → SQL local → tabla/KPIs/insight; `getDbSeed()` tablas ide-based) · Ofertas (tabla + **filtros multiselect en cascada + paginación + reasignar**; detalle: Info cliente con contacto, Info oferta editable + **agente de gestión n8n**, Ciclo 360) + **asistente de creación n8n** · Ciclo de vida (lista + **detalle 360° por pestañas**) · Procesos (flash cards → cascarón) · **Tareas y Agenda** (Mi Día + Agenda calendario + Asistente) · **Cotizador funcional** (chat + cálculo local + amortización + PDF).

## Ofertas — pantalla completa (réplica OfertasContainer)
`renderOfertas()` (App.html) usa el **layout split de React**: `.of-wrap` con columna principal (header naranja "Cartera de Ofertas" / "Gestiona y analiza tus clientes y prospectos" + `.of-body` scrollable con buscador, filtros y tabla) y **panel lateral derecho** (380px) `montarAsistenteOfertas` con estilo `.asx` (igual que el de Tareas): chips (➕ Oferta de cliente/prospecto, 🔎 Ofertas de un cliente, 🏷️ Campañas) + consulta libre; resuelve local (crear → wizard, RFC/número → ofertas/campañas vía `resolverRfcOf`/`resumenOfertasOf`/`campanasDeOf`) o cae al agente n8n `ofertasCrear` (`ejecutarCrear`). `OF_REFRESH` re-renderiza la tabla al crear. El wizard `abrirNuevaOferta(tipoInicial)` abre directo en Cliente/Prospecto desde los chips.

### Filtros y reasignar
`renderOfertas()` (App.html) replica `OfertasFiltros`/`OfertasContainer`:
- **Filtros multiselect en cascada** `OF_FILTERS` = Tipo de persona, Tipo de oferta, Familia, Producto, Etapa. Cada dropdown muestra solo opciones válidas según los filtros activados antes (`upstream`/`optionsFor`); `prune` depura selecciones inválidas al cambiar la cascada. `order` lleva el nivel (L1, L2…). Buscador por panel.
- **Paginación** `OF_PAGE = 10` con `‹ Anterior / Siguiente ›`.
- **Selección + Reasignar**: checkbox por fila → `abrirReasignar(ids, done)` abre modal `#modal` con lista de ejecutivos (buscable); al elegir reasigna `o.ejecutivo` en memoria.
- Helpers nuevos: `distinct`, `abrirModal`/`cerrarModal`. Estilos en `Styles.html` (`.filtros`, `.fpanel`, `.tbar`, `.pager`, `.modal-card`). Contenedor `#modal` en `Index.html`.

## Detalle de oferta + Nueva oferta (paridad React, fase 2)
- **Nueva oferta (wizard 2 pasos)** `abrirNuevaOferta(done)` en modal: paso 1 Cliente/Prospecto; paso 2 Cliente = búsqueda en `CLIENTES` (esCliente) + familia; paso 2 Prospecto = nombre, tipo de persona (PF/PFAE/PM), RFC (valida alfanumérico y longitud 13/13/12), correo/teléfono (al menos uno), familia. Crea cliente prospecto si aplica y antepone la oferta con `nuevaOfertaObj()`.
- **Info de la oferta — 5 subsecciones editables** (`OFFER_SECCIONES`): Información administrativa, Gestión, Condiciones de la oferta, Descripción. Selects dependientes: **familia → producto** y **etapa → subEtapa** (al cambiar, resetea el dependiente vía `redibujaCampos`). Edición en buffer `of.__form`, se aplica al **Guardar** (`valOf`/`campoOferta`/`selectOferta`/`attachOferta`). Valida monto > 0 y motivo de descarte ≥ 20 caracteres si etapa = Descartado.
- **Notas** (`vistaNotas`/`attachNotas`): pestaña nueva en el detalle; alta de comentarios (autor/fecha) sobre `of.notas`.
- `nuevaOfertaObj()` unifica el shape (incluye `subEtapa`, `campana`, `folio`, `origen`, montos, tasa/CAT, plazo, `descripcion`, `notas`); también lo usa el asistente n8n `ejecutarCrear`.
- **Catálogos** en `Data.gs` (`getSeedData().catalogos`): `productosPorFamilia`, `subEtapasPorEtapa`, `campanas`, `origenes`. Ofertas semilla enriquecidas con los campos del detalle.

## Ciclo de vida 360 por pestañas (paridad React, fase 3)
`montarCiclo360(host, cli)` (App.html) replica `Ciclo360View`; renderer autocontenido (estado interno de pestaña, filtros y acordeones). Reemplaza el antiguo `vista360`/`bloquesComunes`; lo usan el detalle de oferta (pestaña Ciclo) y el detalle del módulo Ciclo de vida.
- **Pestañas**: Resumen (KPIs + **donut** `conic-gradient` de saldo por tipo + **barras** ingresos/egresos 6 meses), Productos (tarjetas con barra de uso de línea), Saldos y mora (KPIs + barras por bucket + tabla), Líneas por vencer, Movimientos (timbrado + variaciones), Ingresos NF (+ TPV), Ofertas (clic → abre detalle), Comunicaciones (filtro por canal + acordeón), Aclaraciones (filtros tipo/estatus + acordeón), Denuncias (si existen). Pestañas `soloCliente` ocultas para prospectos.
- **Agregar método de contacto**: en Info del cliente, `attachContacto` ahora permite añadir teléfono/correo (valida formato) que se concatena en `cli.telefonos`/`cli.correo`.
- **Seed enriquecido** (`Data.gs`): por cliente se generan `variaciones`, `ingresos`, `timbrado`, `tpv`, `denuncias` y los contratos llevan `tipo`, `saldoActual`, `lineaAutorizada`, `saldoVencido`, `diasMora`, `fechaVencimiento`, `fechaProximoPago`; comunicaciones con `contenido` y aclaraciones con `canal`/`fechaApertura`/`fechaCierre`/`detalle`.
- Estilos nuevos en `Styles.html`: `.tabn`, `.donut`/`.donut-hole`, `.bars`/`.bar`, `.prog`, `.trk`, `.acc`/`.acc-h`/`.acc-b`.

## Tareas y Agenda (réplica de TareasContainer)
`renderTareas()` (App.html) recrea la pantalla completa de React (`TareasContainer`/`CronogramaDiario`/`AgendaCalendar`/`AsistenteTareasPanel`/`TimeReportModal`), tema claro. Layout split: izquierda con título + 2 acordeones; derecha panel asistente (420px). Store en memoria `AGENDA_EVENTOS` compartido por las 3 vistas; `refrescarTareas()` re-renderiza los acordeones abiertos.
- **Mi Día** (`montarMiDia`): barra de tiempo (planeado/no programado/total 540 min, libres/extra, % completado, "Jornada 9:00-18:00"); navegación de día saltando fines de semana (`saltarFinSemana`); cronograma 9:00-18:00 desde `TAREAS_TEMPLATE` (5 días, generado desde hoy con `generarCronograma`) + eventos del store; toggle de completado (`TAREAS_DONE`); badges Planeada/No Programada; "Resumen del Día" (cumplimiento planeado + no planeadas); botón **Informe de tiempo**.
- **Agenda Semanal** (`montarAgenda`): vistas Día/Semana/Mes, navegación, `EVENTOS_EJEMPLO` (14, enero 2026) + reuniones del store; popup de evento (`popupEvento`) en `#modal` con color por tipo.
- **Asistente de Agenda** (`montarAsistenteAgenda`): chips + captura guiada por pasos (nombre→fecha→hora→duración) con parsers locales (`parseFechaAg`/`parseHoraAg`/`parseDurAg`) + consultas (hoy/pendientes/reuniones); fallback al agente n8n `tareas`. Crea eventos en `AGENDA_EVENTOS` y refresca.
- **Informe de tiempo** (`abrirInformeTiempo`): modal ancho (`.modal-card.wide`) con KPIs (eficiencia/captación/colocación/ranking), tabla comparativa de equipo (`MOCK_TEAM` + categorías) y **PDF** imprimible (`imprimirInforme`).
- Estilos en `Styles.html`: `.tareas-*`, `.acc2*`, `.td-*` (Mi Día), `.ag-*`/`.evp-*` (agenda), `.asx-*` (asistente), `.tr-*`/`.cat-*` (informe).

## Pantalla de chat réplica (ChatContainer + Biblioteca de Prompts)
`montarChat(cfg)` (App.html) es la pantalla de chat reutilizable que replica `ChatContainer`/`ChatHeader`/`WelcomeMessage`/`ChatInput`/`PromptLibrary` de React (tema claro). La usan **Chat principal** (`renderChat`) y **Cotizador** (`renderCotizador`).
- **Layout idéntico**: header con avatar en gradiente, título + badge + estado "En línea • Listo para ayudarte" + botones Nueva/Limpiar; cuerpo con bienvenida (ícono, título en gradiente, descripción, grid de sugerencias) o burbujas usuario/asistente con avatar, hora e indicador de escritura; footer con **toggle de modo**, input redondeado con botón enviar y hint "Enter / Shift+Enter"; y **Biblioteca de Prompts** lateral (búsqueda + categorías colapsables + prompts).
- **Config por pantalla** (`cfg`): icono, título, badge, modos, placeholder, welcome, `biblioteca` y `responder(texto, modo, done)`.
- Chat principal: badge "Datos", modos Consulta Datos / Consulta Procedimientos, `PROMPT_LIB_DATOS` (réplica de `PROMPT_CATEGORIES`: 10 categorías), `responder` usa sql.js + agente `datos` (`renderResultado`); Procedimientos muestra aviso (no cableado en la demo).
- Cotizador: badge "Cotizador", modo Cotizar Crédito, `PROMPT_LIB_COTIZADOR` (Productos / Ejemplos / Información), `responder` usa agente `cotizador` + `cotInterpretar` con respaldo local.
- Estilos en `Styles.html`: `.chatx*`, `.bub*`, `.wel*`, `.modes/.mode`, `.inputbox/.send-btn`, `.hint`, `.plib*`, `.typing`.

## Cotizador funcional (paridad React, fase 4)
`renderCotizador()` (App.html) replica `CotizadorContainer`/`cotizadorService`. **UI idéntica al chat principal**: usa el mismo `montarChat(cfg)` (header, bienvenida, burbujas con indicador de escritura, input con toggle/hint y Biblioteca de Prompts).
- **Agente n8n**: `send()` llama `agente('cotizador', …)` → `consultarAgente` → webhook `cotizador-IA` (registrado en `Code.gs`), igual que el Chat de datos. `cotInterpretar(resp, texto, ctx)` extrae el texto del agente (`output/text/response/mensaje`, soporta arreglo) y, si el agente devuelve parámetros (`cotParams`: objeto o JSON con ```json ```), calcula con `calcularCotizacion`. **Respaldo local**: en preview/error/sin cotización usa `cotProcesar` (NLP) para seguir funcionando offline.
- **Productos** `COT_PRODUCTOS`: hipotecario (1M–50M, 10–30 años), personal (50k–500k, 12–24 meses), auto (200k–2M, 12–60 meses) con tasas por plazo.
- `calcularCotizacion(sol)` — sistema francés: pago mensual, total, intereses y **tabla de amortización** completa; valida monto min/max y enganche.
- `cotProcesar(texto, ctx)` — NLP: detecta tipo (hipotec/auto/personal), monto (mil/millones), plazo (años→meses), enganche; mantiene `ctx.tipoCredito` entre turnos.
- Tarjeta de resultado (`cotCardHtml`) con KPIs, toggle de amortización y **PDF** vía `cotImprimir` (ventana imprimible → `window.print`).

## Agentes
`consultarAgente(canal,...)` (Code.gs) → webhooks `datos / ofertasCrear / ofertasGestion / tareas`. Los intents se ejecutan sobre los datos en memoria (crear oferta, actualizar etapa/monto, crear tarea/reunión).

## Despliegue
Ver `demoAppscript/README.md` (pegar a mano en script.google.com o `clasp push/deploy`). Datos en memoria (no persisten al recargar).

## Referencias
- [[Ofertas-Modulo]] · [[Procesos-Contratacion]] · [[Ciclo-de-Vida-ERD]]
