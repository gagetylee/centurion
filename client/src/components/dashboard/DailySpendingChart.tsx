import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '../ui/Card'
import { useDailySpending } from '../../hooks/useDailySpending'
import { formatCents } from '../../lib/utils'

export function DailySpendingChart() {
  const data = useDailySpending()

  if (data.length === 0) {
    return (
      <Card>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Daily Spending Pace
        </h3>
        <div className="flex h-[200px] items-center justify-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          No spending data yet
        </div>
      </Card>
    )
  }

  const maxPace = data[data.length - 1]?.pace ?? 0
  const maxCum = data[data.length - 1]?.cumulative ?? 0
  const yMax = Math.ceil(Math.max(maxPace, maxCum) * 1.1)

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
        Daily Spending Pace
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, yMax]}
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${Math.round(v / 100)}`}
            width={50}
          />
          <Tooltip
            formatter={(value: unknown, name: unknown) => [
              formatCents(Number(value)),
              name === 'cumulative' ? 'Actual' : 'Budget Pace',
            ]}
            contentStyle={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '13px',
              color: 'var(--text-primary)',
            }}
          />
          <Line
            type="monotone"
            dataKey="pace"
            stroke="var(--text-tertiary)"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            dot={false}
            name="pace"
          />
          <Line
            type="monotone"
            dataKey="cumulative"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={false}
            name="cumulative"
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-center gap-6 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-accent rounded" /> Actual
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded border-t-2 border-dashed border-[var(--text-tertiary)]" /> Budget Pace
        </span>
      </div>
    </Card>
  )
}
