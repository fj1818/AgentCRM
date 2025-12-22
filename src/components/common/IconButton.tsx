/**
 * Componente IconButton para botones solo con icono
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils'

type IconButtonSize = 'sm' | 'md' | 'lg'
type IconButtonVariant = 'default' | 'ghost' | 'primary'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  size?: IconButtonSize
  variant?: IconButtonVariant
  label: string // Para accesibilidad
}

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

const variantStyles: Record<IconButtonVariant, string> = {
  default: 'bg-surface-700 text-surface-200 hover:bg-surface-600',
  ghost: 'bg-transparent text-surface-300 hover:bg-surface-800 hover:text-white',
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      size = 'md',
      variant = 'ghost',
      label,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(
          'inline-flex items-center justify-center rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        disabled={disabled}
        {...props}
      >
        {icon}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'

