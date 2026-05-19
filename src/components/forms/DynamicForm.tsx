/**
 * Formulario dinámico basado en definición de campos
 * Genera formularios automáticamente según la estructura de la entidad
 */

import { useState } from 'react'
import type { FormField as FormFieldType } from '@/types'
import { FormField } from './FormField'
import { Button } from '@/components/common'

interface DynamicFormProps {
  fields: FormFieldType[]
  initialValues?: Record<string, unknown>
  onSubmit: (values: Record<string, unknown>) => void
  onCancel?: () => void
  isLoading?: boolean
  submitLabel?: string
}

export function DynamicForm({
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Guardar',
}: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {}
    fields.forEach((field) => {
      initial[field.name] = initialValues[field.name] ?? field.value ?? ''
    })
    return initial
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    // Limpiar error al cambiar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      if (field.required && !values[field.name]) {
        newErrors[field.name] = 'Este campo es requerido'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(values)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <FormField
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={(value) => handleChange(field.name, value)}
          error={errors[field.name]}
        />
      ))}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-700">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}


