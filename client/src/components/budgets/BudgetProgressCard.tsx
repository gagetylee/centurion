import { Card, CardContent } from '@/components/ui/card'
import { formatCents } from '../../lib/utils'

interface BudgetProgressCardProps {
  name: string
  spent: number
  budgeted: number
}

function getBarColor(percent: number): string {
  if (percent < 75) return '#10b981'
  if (percent <= 100) return '#f59e0b'
  return '#ef4444'
}

function getTextColorClass(percent: number): string {
  if (percent < 75) return 'text-emerald-600'
  if (percent <= 100) return 'text-amber-600'
  return 'text-red-600'
}

export function BudgetProgressCard({ name, spent, budgeted }: BudgetProgressCardProps) {
  const percent = budgeted > 0 ? (spent / budgeted) * 100 : 0
  const color = getBarColor(percent)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{name}</span>
          <span className={`text-sm font-semibold ${getTextColorClass(percent)}`}>
            {Math.round(percent)}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${Math.min(percent, 100)}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {formatCents(spent)} / {formatCents(budgeted)}
        </p>
      </CardContent>
    </Card>
  )
}
