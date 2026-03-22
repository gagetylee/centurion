import { useState, useEffect } from 'react'
import { addMonths, subMonths, startOfMonth, isBefore, format, endOfMonth } from 'date-fns'
import { Card } from '../ui/Card'
import { MonthNavigator } from './MonthNavigator'
import { CategorySummaryTable } from './CategorySummaryTable'
import { MonthComparison } from './MonthComparison'
import { useMonthlyData } from '../../hooks/useMonthlyData'
import { useTransactionStore } from '../../store/transactionStore'
import { formatCents } from '../../lib/utils'

export function MonthlyPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions)

  const canNext = isBefore(month, startOfMonth(new Date()))

  useEffect(() => {
    const prevMonth = subMonths(month, 1)
    fetchTransactions({
      start_date: format(startOfMonth(prevMonth), 'yyyy-MM-dd'),
      end_date: format(endOfMonth(month), 'yyyy-MM-dd'),
    })
  }, [month, fetchTransactions])

  const data = useMonthlyData(month)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Monthly Summary</h1>
        <MonthNavigator
          month={month}
          onPrev={() => setMonth((m) => subMonths(m, 1))}
          onNext={() => setMonth((m) => addMonths(m, 1))}
          canNext={canNext}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Total Spent</p>
          <p className="mt-1 text-xl font-semibold">{formatCents(data.totalSpent)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Total Budgeted</p>
          <p className="mt-1 text-xl font-semibold">{formatCents(data.totalBudgeted)}</p>
        </Card>
      </div>

      <CategorySummaryTable
        categories={data.categories}
        totalSpent={data.totalSpent}
        totalBudgeted={data.totalBudgeted}
      />

      <MonthComparison data={data.comparison} hasPrevData={data.hasPrevData} />
    </div>
  )
}
