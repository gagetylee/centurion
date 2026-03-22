import { useState, useEffect } from 'react'
import { Plus, Receipt } from 'lucide-react'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
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

  const { filtered, total } = useFilteredTransactions({
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          Add Transaction
        </Button>
      </div>

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
        <div className="flex h-40 items-center justify-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt size={48} />}
          title="No transactions found"
          description={search || categoryId || accountId || type || dateFrom || dateTo
            ? "Try adjusting your filters"
            : "Start tracking by adding your first transaction"
          }
          action={
            !search && !categoryId && !accountId ? (
              <Button onClick={() => setFormOpen(true)}>
                <Plus size={16} />
                Add Transaction
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ExpenseTable transactions={filtered} total={total} />
      )}

      <ExpenseForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
