import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card } from '../ui/Card'
import { formatCents } from '../../lib/utils'

interface ComparisonItem {
  name: string
  current: number
  previous: number
}

interface Props {
  data: ComparisonItem[]
  hasPrevData: boolean
}

export function MonthComparison({ data, hasPrevData }: Props) {
  if (!hasPrevData) {
    return (
      <Card>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Month-over-Month
        </h3>
        <div className="flex h-[200px] items-center justify-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          No previous month data for comparison
        </div>
      </Card>
    )
  }

  const chartData = data.filter((d) => d.current > 0 || d.previous > 0)

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
        Month-over-Month
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${Math.round(v / 100)}`}
            width={50}
          />
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
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="previous" fill="var(--text-tertiary)" name="Last Month" radius={[3, 3, 0, 0]} />
          <Bar dataKey="current" fill="var(--color-accent)" name="This Month" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
