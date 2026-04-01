import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  accountId,
  onAccountChange,
  type,
  onTypeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  sortBy,
  onSortByChange,
  sortDir,
  onSortDirChange,
}: FiltersProps) {
  const categories = useCategoryStore((s) => s.categories)
  const accounts = useAccountStore((s) => s.accounts)

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={type ?? '__all__'}
          onValueChange={(v) =>
            onTypeChange(v === '__all__' ? undefined : (v as TransactionType))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Types</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={categoryId != null ? String(categoryId) : '__all__'}
          onValueChange={(v) =>
            onCategoryChange(v === '__all__' ? undefined : Number(v))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={accountId != null ? String(accountId) : '__all__'}
          onValueChange={(v) =>
            onAccountChange(v === '__all__' ? undefined : Number(v))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Accounts</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={String(a.id)}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-auto"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-auto"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                  ? 'bg-[#4A9B8E]/10 text-[#4A9B8E] font-medium'
                  : 'hover:bg-muted'
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
