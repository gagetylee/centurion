import { useState } from 'react'
import { format, subMonths, addMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBudgetStore } from '../../store/budgetStore'
import { useBudgetSummary } from '../../hooks/useBudgetSummary'
import { useMonthlyData } from '../../hooks/useMonthlyData'
import { formatCents, cn } from '../../lib/utils'
import { BudgetProgressCard } from './BudgetProgressCard'

export function BudgetsPage() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const { budgets, budgetStatuses } = useBudgetStore()
  const { totalBudgeted, totalSpent, totalRemaining } = useBudgetSummary()
  const monthlyData = useMonthlyData(currentMonth)

  const fixedBudgets = budgets.filter((b) => b.type === 'fixed')
  const variableBudgets = budgets.filter((b) => b.type === 'variable')

  function getSpent(budgetId: number): number {
    return budgetStatuses[budgetId]?.spent_cents ?? 0
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-sm text-muted-foreground">
            Track your spending against your budget
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCents(totalBudgeted)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCents(totalSpent)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={cn(
                  'text-2xl font-bold',
                  totalRemaining >= 0 ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {formatCents(totalRemaining)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Fixed Expenses */}
        {fixedBudgets.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">
              Fixed Expenses
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fixedBudgets.map((budget) => (
                <BudgetProgressCard
                  key={budget.id}
                  name={budget.category.name}
                  spent={getSpent(budget.id)}
                  budgeted={budget.amount_cents}
                />
              ))}
            </div>
          </section>
        )}

        {/* Variable Expenses */}
        {variableBudgets.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">
              Variable Expenses
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {variableBudgets.map((budget) => (
                <BudgetProgressCard
                  key={budget.id}
                  name={budget.category.name}
                  spent={getSpent(budget.id)}
                  budgeted={budget.amount_cents}
                />
              ))}
            </div>
          </section>
        )}

        {/* Monthly Comparison */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Budget vs Actual
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[140px] text-center text-sm font-medium">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Category
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Budgeted
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Spent
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Difference
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.categories.map((row) => (
                      <tr key={row.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">{row.name}</td>
                        <td className="px-4 py-3 text-right">
                          {formatCents(row.budgeted)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCents(row.spent)}
                        </td>
                        <td
                          className={cn(
                            'px-4 py-3 text-right font-medium',
                            row.difference >= 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          )}
                        >
                          {formatCents(row.difference)}
                        </td>
                      </tr>
                    ))}
                    {monthlyData.categories.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          No budget data for this month
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {monthlyData.categories.length > 0 && (
                    <tfoot>
                      <tr className="bg-muted/50 font-semibold">
                        <td className="px-4 py-3">Total</td>
                        <td className="px-4 py-3 text-right">
                          {formatCents(monthlyData.totalBudgeted)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCents(monthlyData.totalSpent)}
                        </td>
                        <td
                          className={cn(
                            'px-4 py-3 text-right',
                            monthlyData.totalBudgeted - monthlyData.totalSpent >= 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          )}
                        >
                          {formatCents(
                            monthlyData.totalBudgeted - monthlyData.totalSpent
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
