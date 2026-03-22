import { Card } from '../ui/Card'
import { formatCents, getProgressTextColor } from '../../lib/utils'
import type { MonthCategoryData } from '../../hooks/useMonthlyData'

interface Props {
  categories: MonthCategoryData[]
  totalSpent: number
  totalBudgeted: number
}

export function CategorySummaryTable({ categories, totalSpent, totalBudgeted }: Props) {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
        Budget vs. Actual
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '40%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <thead>
            <tr className="border-b text-xs" style={{ color: 'var(--text-secondary)' }}>
              <th className="py-2 text-left font-medium">Category</th>
              <th className="py-2 text-right font-medium">Budgeted</th>
              <th className="py-2 text-right font-medium">Spent</th>
              <th className="py-2 text-right font-medium">Difference</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const pct = cat.budgeted > 0 ? (cat.spent / cat.budgeted) * 100 : 0
              return (
                <tr key={cat.id} className="border-b">
                  <td className="py-2">{cat.name}</td>
                  <td className="py-2 text-right" style={{ color: 'var(--text-secondary)' }}>
                    {formatCents(cat.budgeted)}
                  </td>
                  <td className="py-2 text-right">{formatCents(cat.spent)}</td>
                  <td className={`py-2 text-right font-medium ${getProgressTextColor(pct)}`}>
                    {cat.difference >= 0 ? '+' : ''}{formatCents(cat.difference)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="pt-3">Total</td>
              <td className="pt-3 text-right">{formatCents(totalBudgeted)}</td>
              <td className="pt-3 text-right">{formatCents(totalSpent)}</td>
              <td className={`pt-3 text-right ${totalBudgeted - totalSpent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {totalBudgeted - totalSpent >= 0 ? '+' : ''}{formatCents(totalBudgeted - totalSpent)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  )
}
