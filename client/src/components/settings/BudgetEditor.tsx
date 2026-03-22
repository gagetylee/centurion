import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useBudgetStore } from '../../store/budgetStore'
import { useCategoryStore } from '../../store/categoryStore'
import { formatCents, dollarsToCents, centsToDollars } from '../../lib/utils'
import type { BudgetPeriod } from '../../types'

const PERIODS: { value: BudgetPeriod; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

export function BudgetEditor() {
  const budgets = useBudgetStore((s) => s.budgets)
  const createBudget = useBudgetStore((s) => s.createBudget)
  const updateBudget = useBudgetStore((s) => s.updateBudget)
  const deleteBudget = useBudgetStore((s) => s.deleteBudget)
  const fetchAllBudgetStatuses = useBudgetStore((s) => s.fetchAllBudgetStatuses)
  const categories = useCategoryStore((s) => s.categories)

  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [categoryId, setCategoryId] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState<BudgetPeriod>('monthly')

  const budgetedCategoryIds = new Set(budgets.map((b) => b.category_id))
  const availableCategories = categories.filter(
    (c) => c.type === 'expense' && !budgetedCategoryIds.has(c.id)
  )

  const cancelEdit = () => {
    setEditingId(null)
    setAdding(false)
    setCategoryId('')
    setAmount('')
    setPeriod('monthly')
  }

  const handleAdd = async () => {
    if (!categoryId) { toast.error('Select a category'); return }
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) { toast.error('Enter a valid amount'); return }
    try {
      await createBudget({
        category_id: Number(categoryId),
        amount_cents: dollarsToCents(parsed),
        period,
      })
      cancelEdit()
      toast.success('Budget added')
      fetchAllBudgetStatuses()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add budget')
    }
  }

  const handleSaveEdit = async (id: number) => {
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) { toast.error('Enter a valid amount'); return }
    try {
      await updateBudget(id, {
        amount_cents: dollarsToCents(parsed),
        period,
      })
      cancelEdit()
      toast.success('Budget updated')
      fetchAllBudgetStatuses()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update budget')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteBudget(id)
      toast.success('Budget deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete budget')
    }
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Budgets
        </h3>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => { cancelEdit(); setAdding(true) }}
          disabled={availableCategories.length === 0 && !adding}
        >
          <Plus size={14} /> Add
        </Button>
      </div>

      <div className="space-y-2">
        {adding && (
          <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-end" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex-1">
              <label className="mb-1 block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded border px-2 py-1.5 text-sm outline-none focus:border-accent"
                style={{ backgroundColor: 'var(--bg-primary)' }}
                autoFocus
              >
                <option value="">Select...</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="mb-1 block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Amount</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded border px-2 py-1.5 text-sm outline-none focus:border-accent"
                style={{ backgroundColor: 'var(--bg-primary)' }}
              />
            </div>
            <div className="w-28">
              <label className="mb-1 block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
                className="w-full rounded border px-2 py-1.5 text-sm outline-none focus:border-accent"
                style={{ backgroundColor: 'var(--bg-primary)' }}
              >
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-1">
              <button onClick={handleAdd} className="rounded p-1.5 text-emerald-500 hover:bg-emerald-500/10">
                <Check size={16} />
              </button>
              <button onClick={cancelEdit} className="rounded p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {budgets.map((budget) =>
          editingId === budget.id ? (
            <div key={budget.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-end" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Category</label>
                <input
                  value={budget.category.name}
                  disabled
                  className="w-full rounded border px-2 py-1.5 text-sm opacity-50"
                  style={{ backgroundColor: 'var(--bg-primary)' }}
                />
              </div>
              <div className="w-24">
                <label className="mb-1 block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded border px-2 py-1.5 text-sm outline-none focus:border-accent"
                  style={{ backgroundColor: 'var(--bg-primary)' }}
                  autoFocus
                />
              </div>
              <div className="w-28">
                <label className="mb-1 block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
                  className="w-full rounded border px-2 py-1.5 text-sm outline-none focus:border-accent"
                  style={{ backgroundColor: 'var(--bg-primary)' }}
                >
                  {PERIODS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleSaveEdit(budget.id)} className="rounded p-1.5 text-emerald-500 hover:bg-emerald-500/10">
                  <Check size={16} />
                </button>
                <button onClick={cancelEdit} className="rounded p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]">
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div
              key={budget.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <div>
                <span className="text-sm font-medium">{budget.category.name}</span>
                <span className="ml-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {formatCents(budget.amount_cents)}
                </span>
                <span className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                  {budget.period}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingId(budget.id)
                    setAmount(centsToDollars(budget.amount_cents).toString())
                    setPeriod(budget.period)
                  }}
                  className="rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(budget.id)}
                  className="rounded p-1 text-[var(--text-tertiary)] hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        )}

        {budgets.length === 0 && !adding && (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            No budgets yet. Add expense categories first, then set budgets for them.
          </p>
        )}
      </div>
    </Card>
  )
}
