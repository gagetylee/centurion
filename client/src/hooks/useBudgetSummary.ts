import { useMemo } from 'react'
import { useBudgetStore } from '../store/budgetStore'

export interface CategorySummary {
  id: number
  name: string
  budgeted: number
  spent: number
  remaining: number
  percent: number
}

export function useBudgetSummary() {
  const budgetStatuses = useBudgetStore((s) => s.budgetStatuses)

  return useMemo(() => {
    const categories: CategorySummary[] = Object.values(budgetStatuses).map(
      (status) => ({
        id: status.budget.category.id,
        name: status.budget.category.name,
        budgeted: status.budget.amount_cents,
        spent: status.spent_cents,
        remaining: status.remaining_cents,
        percent:
          status.budget.amount_cents > 0
            ? (status.spent_cents / status.budget.amount_cents) * 100
            : 0,
      })
    )

    const totalBudgeted = categories.reduce((s, c) => s + c.budgeted, 0)
    const totalSpent = categories.reduce((s, c) => s + c.spent, 0)

    return {
      categories,
      totalBudgeted,
      totalSpent,
      totalRemaining: totalBudgeted - totalSpent,
    }
  }, [budgetStatuses])
}
