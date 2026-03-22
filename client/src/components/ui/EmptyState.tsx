import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-[var(--text-tertiary)]">{icon}</div>
      <h3 className="mb-1 text-lg font-medium">{title}</h3>
      <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
      {action}
    </div>
  )
}
