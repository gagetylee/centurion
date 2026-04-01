import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
    <div className="flex flex-col gap-2 rounded-lg border bg-muted p-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>
      <div className="w-28">
        <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Type</label>
        <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={onSave} className="text-emerald-500 hover:text-emerald-600">
          <Check size={16} />
        </Button>
        <Button variant="ghost" size="sm" onClick={cancelEdit}>
          <X size={16} />
        </Button>
      </div>
    </div>
  )

  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const incomeCategories = categories.filter((c) => c.type === 'income')

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Categories</CardTitle>
        <Button size="sm" variant="outline" onClick={() => { cancelEdit(); setAdding(true) }}>
          <Plus size={14} /> Add
        </Button>
      </CardHeader>
      <CardContent>

      <div className="space-y-2">
        {adding && renderEditRow(handleAdd)}

        {expenseCategories.length > 0 && (
          <div>
            <p className="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Expense
            </p>
            {expenseCategories.map((cat) =>
              editingId === cat.id ? (
                <div key={cat.id} className="mb-2">
                  {renderEditRow(() => handleSaveEdit(cat.id))}
                </div>
              ) : (
                <div key={cat.id} className="flex items-center justify-between rounded-lg border px-3 py-2 mb-1">
                  <span className="text-sm font-medium">{cat.name}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-xs" onClick={() => { setEditingId(cat.id); setName(cat.name); setType(cat.type) }}>
                      <Pencil size={13} />
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(cat.id)} className="hover:text-destructive">
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {incomeCategories.length > 0 && (
          <div>
            <p className="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Income
            </p>
            {incomeCategories.map((cat) =>
              editingId === cat.id ? (
                <div key={cat.id} className="mb-2">
                  {renderEditRow(() => handleSaveEdit(cat.id))}
                </div>
              ) : (
                <div key={cat.id} className="flex items-center justify-between rounded-lg border px-3 py-2 mb-1">
                  <span className="text-sm font-medium">{cat.name}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-xs" onClick={() => { setEditingId(cat.id); setName(cat.name); setType(cat.type) }}>
                      <Pencil size={13} />
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(cat.id)} className="hover:text-destructive">
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {categories.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No categories yet. Add one to start organizing transactions.</p>
        )}
      </div>
      </CardContent>
    </Card>
  )
}
