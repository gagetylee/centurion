import { format } from 'date-fns'
import { SummaryCards } from './SummaryCards'
import { CategoryProgressList } from './CategoryProgressList'
import { SpendingDoughnut } from './SpendingDoughnut'
import { DailySpendingChart } from './DailySpendingChart'
import { QuickEntry } from './QuickEntry'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {format(new Date(), 'MMMM yyyy')}
        </p>
      </div>

      <SummaryCards />

      <QuickEntry />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CategoryProgressList />
        <SpendingDoughnut />
      </div>

      <DailySpendingChart />
    </div>
  )
}
