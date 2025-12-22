/**
 * Fila de tabla individual (para uso customizado)
 */

import { type ReactNode } from 'react'
import { cn } from '@/utils'

interface TableRowProps {
  children: ReactNode
  onClick?: () => void
  isSelected?: boolean
  className?: string
}

export function TableRow({
  children,
  onClick,
  isSelected,
  className,
}: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-b border-surface-700 transition-colors',
        onClick && 'cursor-pointer',
        isSelected
          ? 'bg-primary-900/30'
          : 'bg-surface-900 hover:bg-surface-800',
        className
      )}
    >
      {children}
    </tr>
  )
}

/** Celda de tabla */
TableRow.Cell = function TableCell({
  children,
  className,
  align = 'left',
}: {
  children: ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-sm text-surface-200',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
    >
      {children}
    </td>
  )
}

