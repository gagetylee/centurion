import { useMemo } from 'react'
import { useTransactionStore } from '../store/transactionStore'
import type { Transaction, TransactionType } from '../types'

export type SortField = 'date' | 'amount' | 'category'
export type SortDir = 'asc' | 'desc'

interface FilterOptions {
  search: string
  categoryId?: number
  accountId?: number
  type?: TransactionType
  dateFrom: string
  dateTo: string
  sortBy: SortField
  sortDir: SortDir
}

export function useFilteredTransactions(options: FilterOptions): {
  filtered: Transaction[]
  total: number
} {
  const transactions = useTransactionStore((s) => s.transactions)

  return useMemo(() => {
    let result = [...transactions]

    if (options.type) {
      result = result.filter((t) => t.type === options.type)
    }

    if (options.categoryId) {
      result = result.filter((t) => t.category_id === options.categoryId)
    }

    if (options.accountId) {
      result = result.filter((t) => t.account_id === options.accountId)
    }

    if (options.dateFrom) {
      result = result.filter((t) => t.date >= options.dateFrom)
    }

    if (options.dateTo) {
      result = result.filter((t) => t.date <= options.dateTo)
    }

    if (options.search) {
      const q = options.search.toLowerCase()
      result = result.filter((t) => {
        const desc = t.description?.toLowerCase() ?? ''
        const catName = t.category?.name.toLowerCase() ?? ''
        return desc.includes(q) || catName.includes(q)
      })
    }

    result.sort((a, b) => {
      let cmp = 0
      switch (options.sortBy) {
        case 'date':
          cmp = a.date.localeCompare(b.date)
          break
        case 'amount':
          cmp = a.amount_cents - b.amount_cents
          break
        case 'category':
          cmp = (a.category?.name ?? '').localeCompare(b.category?.name ?? '')
          break
      }
      return options.sortDir === 'asc' ? cmp : -cmp
    })

    const total = result.reduce((s, t) => s + t.amount_cents, 0)

    return { filtered: result, total }
  }, [transactions, options.search, options.categoryId, options.accountId, options.type, options.dateFrom, options.dateTo, options.sortBy, options.sortDir])
}
