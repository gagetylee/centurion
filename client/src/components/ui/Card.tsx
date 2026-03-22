import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-5 transition-colors ${onClick ? 'cursor-pointer hover:border-[var(--text-tertiary)]' : ''} ${className}`}
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
      {children}
    </div>
  )
}
