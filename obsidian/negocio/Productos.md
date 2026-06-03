---
tags: [negocio, productos]
created: 2026-06-02
updated: 2026-06-02
---

# Productos

Familias de producto bancario manejadas en el CRM.

## Familias y productos

| Familia | Productos específicos | Tabla SQL | Métrica |
|---------|----------------------|-----------|---------|
| **TDC** | Tarjeta Clasica, Tarjeta Gold, Tarjeta Empresarial | `tdc` | lineaTotal / Disponible / Uso |
| **TPV** | TPV Básico, TPV Plus, TPV Premium | `tpv` | saldoFacturacion |
| **Cheques** | NominaFlex, NominaTradicional, NominaBasica | `cheques` | saldoLinea |
| **Nóminas** | Nómina Básica, Plus, Empresarial | `nominas` | montoNomina |
| **Crédito** | Personal, Hipotecario, Automotriz, PYME | `creditos` | montoCredito, saldoActual |
| **Seguros** | Vida, Auto, Gastos Médicos, Hogar | `seguros` | primaAnual |

> [!note]
> Familias válidas para el [[../agentes-n8n/Agente-Prospectos-Oportunidades|agente de oportunidades]]: TDC, TPV, Cheques, Crédito, Seguros, Nóminas.

## Estructura de ofertas

- **Ofertas de clientes** (`ofertasclientes`): `montoOferta`, puede llegar a `montoTimbrado` / `fechaTimbrado`.
- **Ofertas de prospectos** (`ofertasprospectos`): `montoInteres`.

Ambas tienen `familiaProducto`, `productoInteres`, `etapa`, `campaña`, `numeroPromotor`.

## Referencias

- [[Oportunidades]]
- [[Prospectos]]
- [[../tecnico/Base-de-Datos-SQL]]
