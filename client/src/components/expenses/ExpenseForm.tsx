import { useState } from 'react'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useTransactionStore } from '../../store/transactionStore'
import { useCategoryStore } from '../../store/categoryStore'
import { useAccountStore } from '../../store/accountStore'
import { useBudgetStore } from '../../store/budgetStore'
import { getTodayString, dollarsToCents } from '../../lib/utils'
import type { TransactionType } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
}

export function ExpenseForm({ open, onClose }: Props) {
  const createTransaction = useTransactionStore((s) => s.createTransaction)
  const categories = useCategoryStore((s) => s.categories)
  const accounts = useAccountStore((s) => s.accounts)
  const fetchAllBudgetStatuses = useBudgetStore((s) => s.fetchAllBudgetStatuses)

  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [accountId, setAccountId] = useState<string>('')
  const [date, setDate] = useState(getTodayString())
  const [description, setDescription] = useState('')

  const filteredCategories = categories.filter((c) => c.type === type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) {
      toast.error('Enter a valid amount')
      return
    }

    try {
      await createTransaction({
        amount_cents: dollarsToCents(parsed),
        type,
        date: date || getTodayString(),
        description: description.trim() || undefined,
        category_id: categoryId ? Number(categoryId) : undefined,
        account_id: accountId ? Number(accountId) : undefined,
      })

      toast.success('Transaction added')
      setAmount('')
      setDescription('')
      setDate(getTodayString())
      setCategoryId('')
      setAccountId('')
      fetchAllBudgetStatuses()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add transaction')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Transaction">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Type *
          </label>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value as TransactionType); setCategoryId('') }}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Amount *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
            autoFocus
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <option value="">None</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Account
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <option value="">None</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Description
          </label>
          <input
            type="text"
            placeholder="Optional"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">Add Transaction</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}
