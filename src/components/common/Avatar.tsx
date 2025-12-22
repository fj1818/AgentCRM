/**
 * Componente Avatar reutilizable
 */

import { cn } from '@/utils'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: AvatarSize
  className?: string
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
}

/** Genera iniciales a partir de un nombre */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Genera un color consistente basado en el nombre */
function getColorFromName(name: string): string {
  const colors = [
    'bg-primary-600',
    'bg-accent-success',
    'bg-accent-warning',
    'bg-purple-600',
    'bg-pink-600',
    'bg-indigo-600',
    'bg-cyan-600',
  ]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length] ?? colors[0]
}

export function Avatar({
  src,
  alt,
  name = '',
  size = 'md',
  className,
}: AvatarProps) {
  const initials = getInitials(name || 'U')
  const bgColor = getColorFromName(name || 'User')

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={cn(
          'rounded-full object-cover',
          sizeStyles[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium text-white',
        sizeStyles[size],
        bgColor,
        className
      )}
      title={name}
    >
      {initials}
    </div>
  )
}

