import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { useDailySpending } from '../../hooks/useDailySpending'

const PERIODS = ['Week', 'Month', 'Year'] as const

export function SpendingChart() {
  const data = useDailySpending()
  const [period, setPeriod] = useState<string>('Month')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Balance</CardTitle>
        <CardAction>
          <div className="flex rounded-lg border bg-muted p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  period === p
                    ? 'bg-[#1C2127] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="tealFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A9B8E" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#4A9B8E" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value: number) => `$${Math.round(value / 100).toLocaleString()}k`.replace('k', value >= 100000 ? 'k' : '')}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip
                formatter={(value: number) => [`$${(value / 100).toFixed(2)}`, 'Spent']}
                labelFormatter={(label: number) => `Day ${label}`}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '13px',
                  backgroundColor: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#4A9B8E"
                strokeWidth={2}
                fill="url(#tealFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
