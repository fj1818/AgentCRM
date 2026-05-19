/**
 * Campo de formulario dinámico
 * Renderiza el input correcto según el tipo de campo
 */

import type { FormField as FormFieldType } from '@/types'
import { Input } from '@/components/common'
import { SelectField } from './SelectField'

interface FormFieldProps {
  field: FormFieldType
  value: unknown
  onChange: (value: unknown) => void
  error?: string
}

export function FormField({ field, value, onChange, error }: FormFieldProps) {
  const { name, label, type, options, required } = field

  switch (type) {
    case 'select':
      return (
        <SelectField
          label={label}
          value={value as string}
          onChange={onChange}
          options={options || []}
          required={required}
          error={error}
        />
      )

    case 'boolean':
      return (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id={name}
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="w-5 h-5 rounded border-surface-600 bg-surface-800 text-primary-600 focus:ring-primary-500 focus:ring-offset-surface-900"
          />
          <label htmlFor={name} className="text-sm font-medium text-surface-200">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        </div>
      )

    case 'number':
      return (
        <Input
          label={label}
          type="number"
          value={String(value || '')}
          onChange={(e) => onChange(Number(e.target.value))}
          required={required}
          error={error}
        />
      )

    case 'date':
      return (
        <Input
          label={label}
          type="date"
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          error={error}
        />
      )

    case 'text':
    default:
      return (
        <Input
          label={label}
          type="text"
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          error={error}
        />
      )
  }
}


