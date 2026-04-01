import { useState, useEffect } from 'react'
import { Plus, Receipt } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExpenseFilters } from './ExpenseFilters'
import { ExpenseTable } from './ExpenseTable'
import { ExpenseForm } from './ExpenseForm'
import { useFilteredTransactions } from '../../hooks/useFilteredTransactions'
import { useTransactionStore } from '../../store/transactionStore'
import type { SortField, SortDir } from '../../hooks/useFilteredTransactions'
import type { TransactionType } from '../../types'

export function ExpensesPage() {
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions)
  const loading = useTransactionStore((s) => s.loading)

  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [accountId, setAccountId] = useState<number | undefined>()
  const [type, setType] = useState<TransactionType | undefined>()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const { filtered } = useFilteredTransactions({
    search,
    categoryId,
    accountId,
    type,
    dateFrom,
    dateTo,
    sortBy,
    sortDir,
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Expenses</CardTitle>
          <CardDescription>Track and manage your transactions</CardDescription>
          <CardAction>
            <Button onClick={() => setFormOpen(true)}>
              <Plus size={16} />
              Add Transaction
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-4">
          <ExpenseFilters
            search={search}
            onSearchChange={setSearch}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            accountId={accountId}
            onAccountChange={setAccountId}
            type={type}
            onTypeChange={setType}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortDir={sortDir}
            onSortDirChange={setSortDir}
          />

          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Receipt size={48} className="text-muted-foreground/50" />
              <div>
                <p className="font-medium">No transactions found</p>
                <p className="text-sm text-muted-foreground">
                  {search || categoryId || accountId || type || dateFrom || dateTo
                    ? 'Try adjusting your filters'
                    : 'Start tracking by adding your first transaction'}
                </p>
              </div>
              {!search && !categoryId && !accountId && (
                <Button onClick={() => setFormOpen(true)}>
                  <Plus size={16} />
                  Add Transaction
                </Button>
              )}
            </div>
          ) : (
            <ExpenseTable transactions={filtered} />
          )}
        </CardContent>
      </Card>

      <ExpenseForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
