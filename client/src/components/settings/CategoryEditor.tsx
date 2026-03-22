import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useCategoryStore } from '../../store/categoryStore'
import type { TransactionType } from '../../types'

export function CategoryEditor() {
  const categories = useCategoryStore((s) => s.categories)
  const createCategory = useCategoryStore((s) => s.createCategory)
  const updateCategory = useCategoryStore((s) => s.updateCategory)
  const deleteCategory = useCategoryStore((s) => s.deleteCategory)

  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState<TransactionType>('expense')

  const cancelEdit = () => {
    setEditingId(null)
    setAdding(false)
    setName('')
    setType('expense')
  }

  const handleAdd = async () => {
    if (!name.trim()) { toast.error('Name is required'); return }
    try {
      await createCategory({ name: name.trim(), type })
      cancelEdit()
      toast.success('Category added')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add category')
    }
  }

  const handleSaveEdit = async (id: number) => {
    if (!name.trim()) { toast.error('Name is required'); return }
    try {
      await updateCategory(id, { name: name.trim(), type })
      cancelEdit()
      toast.success('Category updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update category')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id)
      toast.success('Category deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete category')
    }
  }

  const renderEditRow = (onSave: () => void) => (
    <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-end" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="flex-1">
        <label className="mb-1 block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border px-2 py-1.5 text-sm outline-none focus:border-accent"
          style={{ backgroundColor: 'var(--bg-primary)' }}
          autoFocus
        />
      </div>
      <div className="w-28">
        <label className="mb-1 block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          className="w-full rounded border px-2 py-1.5 text-sm outline-none focus:border-accent"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>
      <div className="flex gap-1">
        <button onClick={onSave} className="rounded p-1.5 text-emerald-500 hover:bg-emerald-500/10">
          <Check size={16} />
        </button>
        <button onClick={cancelEdit} className="rounded p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]">
          <X size={16} />
        </button>
      </div>
    </div>
  )

  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const incomeCategories = categories.filter((c) => c.type === 'income')

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Categories
        </h3>
        <Button size="sm" variant="secondary" onClick={() => { cancelEdit(); setAdding(true) }}>
          <Plus size={14} /> Add
        </Button>
      </div>

      <div className="space-y-2">
        {adding && renderEditRow(handleAdd)}

        {expenseCategories.length > 0 && (
          <div>
            <p className="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Expense
            </p>
            {expenseCategories.map((cat) =>
              editingId === cat.id ? (
                <div key={cat.id} className="mb-2">
                  {renderEditRow(() => handleSaveEdit(cat.id))}
                </div>
              ) : (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 mb-1"
                >
                  <span className="text-sm font-medium">{cat.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingId(cat.id); setName(cat.name); setType(cat.type) }}
                      className="rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="rounded p-1 text-[var(--text-tertiary)] hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {incomeCategories.length > 0 && (
          <div>
            <p className="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Income
            </p>
            {incomeCategories.map((cat) =>
              editingId === cat.id ? (
                <div key={cat.id} className="mb-2">
                  {renderEditRow(() => handleSaveEdit(cat.id))}
                </div>
              ) : (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 mb-1"
                >
                  <span className="text-sm font-medium">{cat.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingId(cat.id); setName(cat.name); setType(cat.type) }}
                      className="rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="rounded p-1 text-[var(--text-tertiary)] hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {categories.length === 0 && !adding && (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            No categories yet. Add one to start organizing transactions.
          </p>
        )}
      </div>
    </Card>
  )
}
