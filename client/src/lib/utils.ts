import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth } from 'date-fns'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function centsToDollars(cents: number): number {
  return cents / 100
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

export function formatCents(cents: number): string {
  return formatCurrency(cents / 100)
}

export function formatDate(dateStr: string): string {
  return format(parse(dateStr, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy')
}

export function getMonthKey(date: Date): string {
  return format(date, 'yyyy-MM')
}

export function getMonthDays(date: Date): Date[] {
  return eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  })
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getDaysInCurrentMonth(): number {
  return getDaysInMonth(new Date())
}

export function getProgressColor(percent: number): string {
  if (percent < 75) return 'bg-emerald-500'
  if (percent <= 100) return 'bg-amber-500'
  return 'bg-red-500'
}

export function getProgressTextColor(percent: number): string {
  if (percent < 75) return 'text-emerald-600 dark:text-emerald-400'
  if (percent <= 100) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
