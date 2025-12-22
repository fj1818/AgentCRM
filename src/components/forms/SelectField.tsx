/**
 * Campo de selección
 */

import { cn } from '@/utils'

interface SelectOption {
  label: string
  value: unknown
}

interface SelectFieldProps {
  label: string
  value: unknown
  onChange: (value: unknown) => void
  options: SelectOption[]
  required?: boolean
  error?: string
  placeholder?: string
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  error,
  placeholder = 'Seleccionar...',
}: SelectFieldProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-surface-200 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select
        value={String(value || '')}
        onChange={(e) => {
          const option = options.find((o) => String(o.value) === e.target.value)
          onChange(option?.value)
        }}
        className={cn(
          'w-full rounded-lg border bg-surface-800 text-white',
          'px-4 py-2.5',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-accent-error focus:ring-accent-error'
            : 'border-surface-600 hover:border-surface-500'
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-sm text-accent-error">{error}</p>}
    </div>
  )
}

