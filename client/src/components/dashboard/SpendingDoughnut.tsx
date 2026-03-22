import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '../ui/Card'
import { useBudgetSummary } from '../../hooks/useBudgetSummary'
import { formatCents } from '../../lib/utils'

const COLORS = [
  '#4A9B8E', '#E8927C', '#7C9CE8', '#D4A574', '#9B8ED4',
  '#74C4B0', '#E87CA0', '#A0C474', '#C49874', '#74A0C4',
]

export function SpendingDoughnut() {
  const { categories, totalSpent } = useBudgetSummary()

  const data = categories
    .filter((c) => c.spent > 0)
    .map((c, i) => ({
      name: c.name,
      value: c.spent,
      color: COLORS[i % COLORS.length],
    }))

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
        Spending Breakdown
      </h3>
      {data.length === 0 ? (
        <div className="flex h-[250px] items-center justify-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          No spending data yet
        </div>
      ) : (
        <div className="relative">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={2}
                dataKey="value"
                animationDuration={600}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: unknown) => formatCents(Number(value))}
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total</p>
              <p className="text-lg font-semibold">{formatCents(totalSpent)}</p>
            </div>
          </div>
        </div>
      )}
      {data.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-xs">
              <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="truncate" style={{ color: 'var(--text-secondary)' }}>{entry.name}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
