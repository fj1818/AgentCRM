/**
 * Configuración de las tablas del CRM
 * Define la estructura de cada entidad
 */

import type { TableDefinition } from '@/types'

export const TABLES_CONFIG: Record<string, TableDefinition> = {
  contact: {
    entityType: 'contact',
    displayName: 'Contacto',
    pluralName: 'Contactos',
    primaryField: 'email',
    fields: [
      { key: 'firstName', label: 'Nombre', type: 'string', required: true },
      { key: 'lastName', label: 'Apellido', type: 'string', required: true },
      { key: 'email', label: 'Email', type: 'string', required: true },
      { key: 'phone', label: 'Teléfono', type: 'string' },
      { key: 'companyId', label: 'Empresa', type: 'relation', relationTo: 'company' },
      { 
        key: 'status', 
        label: 'Estado', 
        type: 'select',
        options: [
          { label: 'Activo', value: 'active' },
          { label: 'Inactivo', value: 'inactive' },
          { label: 'Lead', value: 'lead' },
        ]
      },
    ],
  },
  
  company: {
    entityType: 'company',
    displayName: 'Empresa',
    pluralName: 'Empresas',
    primaryField: 'name',
    fields: [
      { key: 'name', label: 'Nombre', type: 'string', required: true },
      { key: 'industry', label: 'Industria', type: 'string' },
      { key: 'website', label: 'Sitio Web', type: 'string' },
      { key: 'employeeCount', label: 'Empleados', type: 'number' },
      { key: 'revenue', label: 'Ingresos', type: 'number' },
    ],
  },
  
  deal: {
    entityType: 'deal',
    displayName: 'Oportunidad',
    pluralName: 'Oportunidades',
    primaryField: 'title',
    fields: [
      { key: 'title', label: 'Título', type: 'string', required: true },
      { key: 'value', label: 'Valor', type: 'number', required: true },
      { key: 'currency', label: 'Moneda', type: 'string' },
      { 
        key: 'stage', 
        label: 'Etapa', 
        type: 'select',
        options: [
          { label: 'Prospecto', value: 'prospect' },
          { label: 'Calificado', value: 'qualified' },
          { label: 'Propuesta', value: 'proposal' },
          { label: 'Negociación', value: 'negotiation' },
          { label: 'Cerrado Ganado', value: 'won' },
          { label: 'Cerrado Perdido', value: 'lost' },
        ]
      },
      { key: 'probability', label: 'Probabilidad (%)', type: 'number' },
      { key: 'contactId', label: 'Contacto', type: 'relation', relationTo: 'contact' },
      { key: 'companyId', label: 'Empresa', type: 'relation', relationTo: 'company' },
      { key: 'expectedCloseDate', label: 'Fecha Cierre Esperada', type: 'date' },
    ],
  },
  
  activity: {
    entityType: 'activity',
    displayName: 'Actividad',
    pluralName: 'Actividades',
    primaryField: 'subject',
    fields: [
      { 
        key: 'type', 
        label: 'Tipo', 
        type: 'select',
        required: true,
        options: [
          { label: 'Llamada', value: 'call' },
          { label: 'Email', value: 'email' },
          { label: 'Reunión', value: 'meeting' },
          { label: 'Tarea', value: 'task' },
          { label: 'Nota', value: 'note' },
        ]
      },
      { key: 'subject', label: 'Asunto', type: 'string', required: true },
      { key: 'description', label: 'Descripción', type: 'string' },
      { key: 'dueDate', label: 'Fecha Vencimiento', type: 'date' },
      { key: 'completed', label: 'Completada', type: 'boolean' },
    ],
  },
} as const

export type TablesConfig = typeof TABLES_CONFIG


