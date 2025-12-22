/**
 * Tipos relacionados con el CRM y sus entidades
 * Aquí se definirán las tablas y campos del CRM
 */

/** Tipos de entidades del CRM */
export type CRMEntityType = 
  | 'contact'
  | 'company'
  | 'deal'
  | 'activity'
  | 'product'
  | 'custom'

/** Estructura base para cualquier entidad del CRM */
export interface CRMEntity {
  id: string
  entityType: CRMEntityType
  createdAt: Date
  updatedAt: Date
  [key: string]: unknown
}

/** Contacto del CRM */
export interface Contact extends CRMEntity {
  entityType: 'contact'
  firstName: string
  lastName: string
  email: string
  phone?: string
  companyId?: string
  status: 'active' | 'inactive' | 'lead'
}

/** Empresa del CRM */
export interface Company extends CRMEntity {
  entityType: 'company'
  name: string
  industry?: string
  website?: string
  employeeCount?: number
  revenue?: number
}

/** Oportunidad/Deal del CRM */
export interface Deal extends CRMEntity {
  entityType: 'deal'
  title: string
  value: number
  currency: string
  stage: string
  probability: number
  contactId?: string
  companyId?: string
  expectedCloseDate?: Date
}

/** Actividad del CRM */
export interface Activity extends CRMEntity {
  entityType: 'activity'
  type: 'call' | 'email' | 'meeting' | 'task' | 'note'
  subject: string
  description?: string
  dueDate?: Date
  completed: boolean
  relatedEntityId?: string
  relatedEntityType?: CRMEntityType
}

/** Definición de campo para tablas dinámicas */
export interface FieldDefinition {
  key: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'select' | 'relation'
  required?: boolean
  options?: { label: string; value: unknown }[]
  relationTo?: CRMEntityType
}

/** Definición de tabla del CRM */
export interface TableDefinition {
  entityType: CRMEntityType
  displayName: string
  pluralName: string
  fields: FieldDefinition[]
  primaryField: string
}

