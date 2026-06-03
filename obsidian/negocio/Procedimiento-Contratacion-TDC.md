---
tags: [negocio, procedimiento, tdc]
created: 2026-06-02
updated: 2026-06-02
---

# Procedimiento: Contratación de TDC

Reglas operativas que guía el [[../agentes-n8n/Agente-Procedimientos]]. Documentadas en el fallback local de `procedimientosAgentService` y en `@/data/procedimientosData`.

## Pasos del proceso

1. 🔍 Identificar y perfilar cliente (edad 18-69, ingreso mín. $8,000)
2. 📄 Solicitar documentos
3. 💻 Alta en Fábrica de Créditos
4. ⚙️ Evaluación del Modelo Paramétrico (15 min – 2 hrs)
5. 🔄 Si rechaza → escalar a Riesgos (si procede)
6. 💰 Gestionar condiciones especiales (tasa condicionada)
7. ✍️ Formalización y firma
8. 💳 Entrega y activación (3-5 días hábiles)

**Tiempo total:** 3-7 días hábiles.

## Documentos requeridos

INE/Pasaporte, comprobante de domicilio (<3 meses), 3 recibos de nómina/estados de cuenta, RFC, CURP, solicitud firmada, autorización de Buró, carátula bancaria.
- **Independientes:** 2 declaraciones anuales + 6 meses de estados de cuenta.
- **Extranjeros:** pasaporte + FM2/FM3 o residente.

## Escalamiento ante rechazo

Escalable **salvo**: listas negras PLD, créditos en litigio, score de Buró < 500.
Correo a `riesgos.credito@banco.com` con folio, justificación y mitigación. Respuesta ≤ 48 hrs hábiles.

Respuestas posibles: aprobación con tasa condicionada / línea reducida (50-70%) / depósito en garantía (10-30%), o rechazo definitivo (re-solicitud en 6 meses).

> [!tip]
> Clientes con >5 años de antigüedad sin atrasos: aprobables por Director de Sucursal hasta $50,000 MXN.

## Tasa condicionada por riesgo

| Nivel | Sobreprecio | Ejemplo (base 28%) |
|-------|-------------|--------------------|
| Bajo-Medio | +5 pp | 33% |
| Medio | +10 pp | 38% |
| Alto | +15 pp | 43% |

Revisión a 12 meses si: 0 atrasos, uso < 70%, ≥ 6 MSI. El cliente tiene 5 días hábiles para aceptar.

## Excepciones

- <21 años: aval/cotitular >25 años
- Zona rural: verificación presencial (+5 días)
- Ingreso variable: 6 estados + 2 declaraciones, ingreso = promedio × 70%
- Reestructura previa (<24m): carta de no adeudo + Comité, máx $30,000
- PEP: aprobación del Oficial de Cumplimiento
- Error en Buró: espera hasta 30 días

## Referencias

- [[../agentes-n8n/Agente-Procedimientos]]
