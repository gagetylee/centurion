import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Transaction } from '../../types'
import { useTransactionStore } from '../../store/transactionStore'
import { useCategoryStore } from '../../store/categoryStore'
import { useAccountStore } from '../../store/accountStore'
import { useBudgetStore } from '../../store/budgetStore'
import { formatCents, formatDate, dollarsToCents, centsToDollars } from '../../lib/utils'

export function ExpenseRow({ transaction }: { transaction: Transaction }) {
  const updateTransaction = useTransactionStore((s) => s.updateTransaction)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)
  const categories = useCategoryStore((s) => s.categories)
  const accounts = useAccountStore((s) => s.accounts)
  const fetchAllBudgetStatuses = useBudgetStore((s) => s.fetchAllBudgetStatuses)

  const [editing, setEditing] = useState(false)
  const [amount, setAmount] = useState(centsToDollars(transaction.amount_cents).toString())
  const [categoryId, setCategoryId] = useState(transaction.category_id?.toString() ?? '')
  const [accountId, setAccountId] = useState(transaction.account_id?.toString() ?? '')
  const [date, setDate] = useState(transaction.date)
  const [description, setDescription] = useState(transaction.description ?? '')

  const filteredCategories = categories.filter((c) => c.type === transaction.type)

  const handleSave = async () => {
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) {
      toast.error('Invalid amount')
      return
    }
    try {
      await updateTransaction(transaction.id, {
        amount_cents: dollarsToCents(parsed),
        category_id: categoryId ? Number(categoryId) : null,
        account_id: accountId ? Number(accountId) : null,
        date,
        description: description.trim() || undefined,
      })
      setEditing(false)
      toast.success('Transaction updated')
      fetchAllBudgetStatuses()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTransaction(transaction.id)
      toast.success('Transaction deleted')
      fetchAllBudgetStatuses()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  if (editing) {
    return (
      <tr className="border-b">
        <td className="px-3 py-2">
          <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
            transaction.type === 'income' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
          }`}>
            {transaction.type}
          </span>
        </td>
        <td className="px-3 py-2">
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-20 rounded border px-2 py-1 text-sm outline-none focus:border-accent"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          />
        </td>
        <td className="px-3 py-2">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded border px-2 py-1 text-sm outline-none focus:border-accent"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <option value="">None</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </td>
        <td className="px-3 py-2">
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="rounded border px-2 py-1 text-sm outline-none focus:border-accent"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <option value="">None</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </td>
        <td className="px-3 py-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded border px-2 py-1 text-sm outline-none focus:border-accent"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          />
        </td>
        <td className="px-3 py-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border px-2 py-1 text-sm outline-none focus:border-accent"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          />
        </td>
        <td className="px-3 py-2">
          <div className="flex gap-1">
            <button onClick={handleSave} className="rounded p-1 text-emerald-500 hover:bg-emerald-500/10">
              <Check size={14} />
            </button>
            <button onClick={() => setEditing(false)} className="rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]">
              <X size={14} />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b transition-colors hover:bg-[var(--bg-secondary)]">
      <td className="px-3 py-2.5">
        <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
          transaction.type === 'income' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
        }`}>
          {transaction.type}
        </span>
      </td>
      <td className="px-3 py-2.5 text-sm font-medium">{formatCents(transaction.amount_cents)}</td>
      <td className="px-3 py-2.5 text-sm">{transaction.category?.name ?? '\u2014'}</td>
      <td className="px-3 py-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {transaction.account?.name ?? '\u2014'}
      </td>
      <td className="px-3 py-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {formatDate(transaction.date)}
      </td>
      <td className="px-3 py-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {transaction.description || '\u2014'}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex gap-1">
          <button
            onClick={() => setEditing(true)}
            className="rounded p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="rounded p-1 text-[var(--text-tertiary)] transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}
