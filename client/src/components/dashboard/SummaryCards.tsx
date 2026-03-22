import { TrendingDown, Wallet, Target } from 'lucide-react'
import { Card } from '../ui/Card'
import { formatCents } from '../../lib/utils'
import { useBudgetSummary } from '../../hooks/useBudgetSummary'

export function SummaryCards() {
  const { totalBudgeted, totalSpent, totalRemaining } = useBudgetSummary()

  const cards = [
    {
      label: 'Budgeted',
      value: formatCents(totalBudgeted),
      icon: Target,
      accent: false,
    },
    {
      label: 'Spent',
      value: formatCents(totalSpent),
      icon: TrendingDown,
      accent: false,
    },
    {
      label: 'Remaining',
      value: formatCents(totalRemaining),
      icon: Wallet,
      accent: totalRemaining >= 0,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map(({ label, value, icon: Icon, accent }) => (
        <Card key={label}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {label}
              </p>
              <p className={`mt-1 text-xl font-semibold ${accent ? 'text-accent' : ''}`}>
                {value}
              </p>
            </div>
            <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <Icon size={16} className="text-[var(--text-secondary)]" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
