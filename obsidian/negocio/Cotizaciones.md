---
tags: [negocio, cotizacion]
created: 2026-06-02
updated: 2026-06-02
---

# Cotizaciones

## Definición

Generación de cotizaciones de productos para clientes/prospectos, con exportación a PDF.

## Componentes y servicios

- UI: `cotizador/CotizadorContainer` (ver [[../tecnico/Componentes#cotizador]])
- Lógica: `cotizadorService`
- PDF: `pdfCotizacionService` (jsPDF + jspdf-autotable)

## Flujo

1. Usuario selecciona producto y parámetros.
2. `cotizadorService` calcula la cotización.
3. `pdfCotizacionService` genera el PDF descargable.

## Referencias

- [[Productos]]
- [[../tecnico/Servicios#cotizadorservice]]
