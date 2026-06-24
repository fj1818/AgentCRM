/**
 * CRM Demo — Apps Script Web App.
 * Sirve una SPA (Index + Styles + App) con datos embebidos (Data.gs).
 * Para probar en Google Drive: ver README.md.
 */

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('CRM Demo')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Incluye el contenido de otro archivo HTML (Styles, App). */
function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

/** Datos semilla para el cliente (ver Data.gs). */
function getSeed() {
  return getSeedData();
}

/**
 * Passthrough opcional a los agentes n8n (evita CORS desde el navegador).
 * canal: 'ofertasCrear' | 'ofertasGestion' | 'tareas'
 * Devuelve el texto/JSON crudo del webhook.
 */
function consultarAgente(canal, mensaje, sessionId, contexto) {
  var urls = {
    datos: 'https://abrahamnavarrete.app.n8n.cloud/webhook/AgentCRMKPI',
    ofertasCrear: 'https://abrahamnavarrete.app.n8n.cloud/webhook/ofertas-crear',
    ofertasGestion: 'https://abrahamnavarrete.app.n8n.cloud/webhook-test/ofertas-gestion',
    tareas: 'https://abrahamnavarrete.app.n8n.cloud/webhook/tareas',
    cotizador: 'https://abrahamnavarrete.app.n8n.cloud/webhook/cotizador-IA'
  };
  var url = urls[canal];
  if (!url) return { mensaje: 'Canal n8n desconocido.' };
  try {
    var payload = Object.assign({ mensaje: mensaje, chatInput: mensaje, sessionId: sessionId }, contexto || {});
    var res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    var txt = res.getContentText();
    try { return JSON.parse(txt); } catch (e) { return { mensaje: txt }; }
  } catch (e) {
    return { mensaje: '⚠ No pude consultar al agente n8n: ' + e };
  }
}
