import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBudgetStore } from '../../store/budgetStore'
import { useCategoryStore } from '../../store/categoryStore'
import { formatCents, dollarsToCents, centsToDollars } from '../../lib/utils'
import type { BudgetPeriod, BudgetType } from '../../types'

const PERIODS: { value: BudgetPeriod; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

const TYPES: { value: BudgetType; label: string }[] = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'variable', label: 'Variable' },
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
  const [budgetType, setBudgetType] = useState<BudgetType>('fixed')

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
    setBudgetType('fixed')
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
        type: budgetType,
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
        type: budgetType,
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Budgets</CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => { cancelEdit(); setAdding(true) }}
          disabled={availableCategories.length === 0 && !adding}
        >
          <Plus size={14} /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {adding && (
          <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-end" className="bg-muted">
            <div className="flex-1">
              <label className="mb-1 block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Category</label>
              <Select value={categoryId || '__placeholder__'} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__placeholder__" disabled>Select...</SelectItem>
                  {availableCategories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select value={period} onValueChange={(v) => setPeriod(v as BudgetPeriod)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-28">
              <label className="mb-1 block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Type</label>
              <Select value={budgetType} onValueChange={(v) => setBudgetType(v as BudgetType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        {(['fixed', 'variable'] as BudgetType[]).map((section) => {
          const sectionBudgets = budgets.filter((b) => b.type === section)
          if (sectionBudgets.length === 0) return null
          return (
            <div key={section}>
              <div className="flex items-center gap-3 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  {section === 'fixed' ? 'Fixed Expenses' : 'Variable Expenses'}
                </span>
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-primary)' }} />
              </div>
              <div className="space-y-2">
                {sectionBudgets.map((budget) =>
                  editingId === budget.id ? (
                    <div key={budget.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-end" className="bg-muted">
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
                        <Select value={period} onValueChange={(v) => setPeriod(v as BudgetPeriod)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {PERIODS.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-28">
                        <label className="mb-1 block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Type</label>
                        <Select value={budgetType} onValueChange={(v) => setBudgetType(v as BudgetType)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                            setBudgetType(budget.type)
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
              </div>
            </div>
          )
        })}

        {budgets.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">
            No budgets yet. Add expense categories first, then set budgets for them.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
