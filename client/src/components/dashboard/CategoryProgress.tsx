import { formatCents, getProgressColor, getProgressTextColor } from '../../lib/utils'
import type { CategorySummary } from '../../hooks/useBudgetSummary'

export function CategoryProgress({ category }: { category: CategorySummary }) {
  const percent = Math.min(category.percent, 100)
  const barColor = getProgressColor(category.percent)
  const textColor = getProgressTextColor(category.percent)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{category.name}</span>
        <span className={`text-xs font-medium ${textColor}`}>
          {formatCents(category.spent)} / {formatCents(category.budgeted)}
        </span>
      </div>
      <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div
          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
        <span>{category.percent.toFixed(0)}% used</span>
        <span>{formatCents(Math.max(0, category.remaining))} left</span>
      </div>
    </div>
  )
}
