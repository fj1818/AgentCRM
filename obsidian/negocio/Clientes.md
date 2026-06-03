---
tags: [negocio, cliente, crm]
created: 2026-06-02
updated: 2026-06-02
---

# Clientes

## Definición

Persona o empresa con relación comercial activa. Tiene historial de ofertas y puede recibir nuevas oportunidades de productos.

## Identificadores

| Campo | Descripción | Prioridad |
|-------|-------------|-----------|
| `ide` | ID interno del cliente | Alta |
| `rfc` | RFC fiscal | Alta |
| `nombre` | Nombre completo | Baja (complemento) |

> [!note]
> Si se tiene RFC o IDE, no es necesario el nombre completo para identificar al cliente.

## Ofertas de Clientes

Los clientes tienen ofertas de productos (`ofertasClientesData`). Las familias disponibles son TDC, TPV y Cheques (ver [[Oportunidades]]).

## Referencias

- [[Prospectos]] — Origen del cliente (post-conversión)
- [[Oportunidades]] — Ofertas activas del cliente
- [[tecnico/Componentes#clientes]] — UI de gestión de clientes
