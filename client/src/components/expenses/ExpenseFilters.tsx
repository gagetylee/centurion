import { Search } from 'lucide-react'
import { useCategoryStore } from '../../store/categoryStore'
import { useAccountStore } from '../../store/accountStore'
import type { SortField, SortDir } from '../../hooks/useFilteredTransactions'
import type { TransactionType } from '../../types'

interface FiltersProps {
  search: string
  onSearchChange: (v: string) => void
  categoryId?: number
  onCategoryChange: (v: number | undefined) => void
  accountId?: number
  onAccountChange: (v: number | undefined) => void
  type?: TransactionType
  onTypeChange: (v: TransactionType | undefined) => void
  dateFrom: string
  onDateFromChange: (v: string) => void
  dateTo: string
  onDateToChange: (v: string) => void
  sortBy: SortField
  onSortByChange: (v: SortField) => void
  sortDir: SortDir
  onSortDirChange: (v: SortDir) => void
}

export function ExpenseFilters({
  search, onSearchChange,
  categoryId, onCategoryChange,
  accountId, onAccountChange,
  type, onTypeChange,
  dateFrom, onDateFromChange,
  dateTo, onDateToChange,
  sortBy, onSortByChange,
  sortDir, onSortDirChange,
}: FiltersProps) {
  const categories = useCategoryStore((s) => s.categories)
  const accounts = useAccountStore((s) => s.accounts)

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          />
        </div>
        <select
          value={type ?? ''}
          onChange={(e) => onTypeChange(e.target.value ? e.target.value as TransactionType : undefined)}
          className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <option value="">All Types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <select
          value={categoryId ?? ''}
          onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : undefined)}
          className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={accountId ?? ''}
          onChange={(e) => onAccountChange(e.target.value ? Number(e.target.value) : undefined)}
          className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <option value="">All Accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
            placeholder="From"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
            placeholder="To"
          />
        </div>

        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span>Sort by:</span>
          {(['date', 'amount', 'category'] as SortField[]).map((field) => (
            <button
              key={field}
              onClick={() => {
                if (sortBy === field) {
                  onSortDirChange(sortDir === 'asc' ? 'desc' : 'asc')
                } else {
                  onSortByChange(field)
                  onSortDirChange(field === 'date' ? 'desc' : 'asc')
                }
              }}
              className={`rounded px-2 py-1 transition-colors ${
                sortBy === field
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {field.charAt(0).toUpperCase() + field.slice(1)}
              {sortBy === field && (sortDir === 'asc' ? ' \u2191' : ' \u2193')}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
