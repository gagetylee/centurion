import { Card } from '../ui/Card'
import { CategoryProgress } from './CategoryProgress'
import { useBudgetSummary } from '../../hooks/useBudgetSummary'

export function CategoryProgressList() {
  const { categories } = useBudgetSummary()

  if (categories.length === 0) {
    return (
      <Card>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Budget Progress
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          No budgets set up yet. Add budgets in Settings.
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
        Budget Progress
      </h3>
      <div className="space-y-3">
        {categories.map((cat) => (
          <CategoryProgress key={cat.id} category={cat} />
        ))}
      </div>
    </Card>
  )
}
