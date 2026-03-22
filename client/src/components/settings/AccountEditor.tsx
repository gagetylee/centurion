import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useAccountStore } from '../../store/accountStore'
import type { AccountType } from '../../types'

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'investment', label: 'Investment' },
]

export function AccountEditor() {
  const accounts = useAccountStore((s) => s.accounts)
  const createAccount = useAccountStore((s) => s.createAccount)
  const updateAccount = useAccountStore((s) => s.updateAccount)
  const deleteAccount = useAccountStore((s) => s.deleteAccount)

  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('checking')

  const cancelEdit = () => {
    setEditingId(null)
    setAdding(false)
    setName('')
    setType('checking')
  }

  const handleAdd = async () => {
    if (!name.trim()) { toast.error('Name is required'); return }
    try {
      await createAccount({ name: name.trim(), type })
      cancelEdit()
      toast.success('Account added')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add account')
    }
  }

  const handleSaveEdit = async (id: number) => {
    if (!name.trim()) { toast.error('Name is required'); return }
    try {
      await updateAccount(id, { name: name.trim(), type })
      cancelEdit()
      toast.success('Account updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update account')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAccount(id)
      toast.success('Account deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account')
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
      <div className="w-36">
        <label className="mb-1 block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as AccountType)}
          className="w-full rounded border px-2 py-1.5 text-sm outline-none focus:border-accent"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          {ACCOUNT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
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

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Accounts
        </h3>
        <Button size="sm" variant="secondary" onClick={() => { cancelEdit(); setAdding(true) }}>
          <Plus size={14} /> Add
        </Button>
      </div>

      <div className="space-y-2">
        {adding && renderEditRow(handleAdd)}

        {accounts.map((acct) =>
          editingId === acct.id ? (
            <div key={acct.id}>
              {renderEditRow(() => handleSaveEdit(acct.id))}
            </div>
          ) : (
            <div
              key={acct.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <div>
                <span className="text-sm font-medium">{acct.name}</span>
                <span className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                  {acct.type.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditingId(acct.id); setName(acct.name); setType(acct.type) }}
                  className="rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(acct.id)}
                  className="rounded p-1 text-[var(--text-tertiary)] hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        )}

        {accounts.length === 0 && !adding && (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            No accounts yet. Add one to start tracking.
          </p>
        )}
      </div>
    </Card>
  )
}
