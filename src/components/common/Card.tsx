/**
 * Componente Card reutilizable
 */

import { type ReactNode } from 'react'
import { cn } from '@/utils'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export function Card({
  children,
  className,
  padding = 'md',
  hover = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-surface-800 border border-surface-700',
        paddingStyles[padding],
        hover && 'transition-all duration-200 hover:border-surface-600 hover:shadow-lg',
        className
      )}
    >
      {children}
    </div>
  )
}

/** Header de la card */
Card.Header = function CardHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('border-b border-surface-700 pb-4 mb-4', className)}>
      {children}
    </div>
  )
}

/** Título de la card */
Card.Title = function CardTitle({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)}>
      {children}
    </h3>
  )
}

/** Contenido de la card */
Card.Content = function CardContent({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('', className)}>{children}</div>
}

/** Footer de la card */
Card.Footer = function CardFooter({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('border-t border-surface-700 pt-4 mt-4', className)}>
      {children}
    </div>
  )
}

