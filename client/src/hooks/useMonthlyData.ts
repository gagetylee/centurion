import { useMemo } from 'react'
import { useTransactionStore } from '../store/transactionStore'
import { useBudgetStore } from '../store/budgetStore'
import { useCategoryStore } from '../store/categoryStore'
import { format, subMonths } from 'date-fns'

export interface MonthCategoryData {
  id: number
  name: string
  budgeted: number
  spent: number
  difference: number
}

export function useMonthlyData(month: Date) {
  const transactions = useTransactionStore((s) => s.transactions)
  const budgets = useBudgetStore((s) => s.budgets)
  const categories = useCategoryStore((s) => s.categories)

  return useMemo(() => {
    const monthKey = format(month, 'yyyy-MM')
    const prevMonthKey = format(subMonths(month, 1), 'yyyy-MM')

    const monthExpenses = transactions.filter(
      (t) => t.type === 'expense' && t.date.startsWith(monthKey)
    )
    const prevMonthExpenses = transactions.filter(
      (t) => t.type === 'expense' && t.date.startsWith(prevMonthKey)
    )

    const spentByCategory: Record<number, number> = {}
    const prevSpentByCategory: Record<number, number> = {}

    for (const t of monthExpenses) {
      if (t.category_id != null) {
        spentByCategory[t.category_id] =
          (spentByCategory[t.category_id] ?? 0) + t.amount_cents
      }
    }
    for (const t of prevMonthExpenses) {
      if (t.category_id != null) {
        prevSpentByCategory[t.category_id] =
          (prevSpentByCategory[t.category_id] ?? 0) + t.amount_cents
      }
    }

    const expenseCategories = categories.filter((c) => c.type === 'expense')

    const categoryData: MonthCategoryData[] = expenseCategories.map((cat) => {
      const budget = budgets.find((b) => b.category_id === cat.id)
      const spent = spentByCategory[cat.id] ?? 0
      const budgeted = budget?.amount_cents ?? 0
      return {
        id: cat.id,
        name: cat.name,
        budgeted,
        spent,
        difference: budgeted - spent,
      }
    })

    const totalSpent = monthExpenses.reduce((s, t) => s + t.amount_cents, 0)
    const totalBudgeted = budgets.reduce((s, b) => s + b.amount_cents, 0)
    const prevTotalSpent = prevMonthExpenses.reduce(
      (s, t) => s + t.amount_cents,
      0
    )

    const comparison = expenseCategories.map((cat) => ({
      name: cat.name,
      current: spentByCategory[cat.id] ?? 0,
      previous: prevSpentByCategory[cat.id] ?? 0,
    }))

    return {
      categories: categoryData,
      totalSpent,
      totalBudgeted,
      prevTotalSpent,
      comparison,
      monthKey,
      prevMonthKey,
      hasPrevData: prevMonthExpenses.length > 0,
    }
  }, [transactions, budgets, categories, month])
}
