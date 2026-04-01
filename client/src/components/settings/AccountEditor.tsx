import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
    <div className="flex flex-col gap-2 rounded-lg border bg-muted p-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>
      <div className="w-36">
        <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Type</label>
        <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {ACCOUNT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Accounts</CardTitle>
        <Button size="sm" variant="outline" onClick={() => { cancelEdit(); setAdding(true) }}>
          <Plus size={14} /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {adding && renderEditRow(handleAdd)}

        {accounts.map((acct) =>
          editingId === acct.id ? (
            <div key={acct.id}>
              {renderEditRow(() => handleSaveEdit(acct.id))}
            </div>
          ) : (
            <div key={acct.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{acct.name}</span>
                <Badge variant="secondary">{acct.type.replace('_', ' ')}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-xs" onClick={() => { setEditingId(acct.id); setName(acct.name); setType(acct.type) }}>
                  <Pencil size={13} />
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(acct.id)} className="hover:text-destructive">
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          )
        )}

        {accounts.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No accounts yet. Add one to start tracking.</p>
        )}
      </CardContent>
    </Card>
  )
}
