import { useMemo } from 'react'
import { useTransactionStore } from '../store/transactionStore'
import { useBudgetStore } from '../store/budgetStore'
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isBefore, isEqual } from 'date-fns'

export interface DailyPoint {
  date: string
  day: number
  cumulative: number
  pace: number
}

export function useDailySpending(month?: Date) {
  const transactions = useTransactionStore((s) => s.transactions)
  const budgets = useBudgetStore((s) => s.budgets)

  const targetMonth = month ?? new Date()

  return useMemo(() => {
    const monthKey = format(targetMonth, 'yyyy-MM')
    const monthExpenses = transactions.filter(
      (t) => t.type === 'expense' && t.date.startsWith(monthKey)
    )

    const start = startOfMonth(targetMonth)
    const end = endOfMonth(targetMonth)
    const days = eachDayOfInterval({ start, end })
    const today = new Date()

    const totalBudget = budgets
      .filter((b) => b.period === 'monthly')
      .reduce((s, b) => s + b.amount_cents, 0)
    const dailyPace = totalBudget / days.length

    let cumulative = 0
    const points: DailyPoint[] = []

    for (let i = 0; i < days.length; i++) {
      const day = days[i]
      const dayStr = format(day, 'yyyy-MM-dd')

      if (isBefore(today, day) && !isEqual(today, day)) break

      const daySpend = monthExpenses
        .filter((t) => t.date === dayStr)
        .reduce((s, t) => s + t.amount_cents, 0)

      cumulative += daySpend
      points.push({
        date: dayStr,
        day: i + 1,
        cumulative,
        pace: Math.round(dailyPace * (i + 1)),
      })
    }

    return points
  }, [transactions, budgets, targetMonth])
}
