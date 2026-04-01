import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TableRow, TableCell } from '@/components/ui/table'
import { useTransactionStore } from '../../store/transactionStore'
import { useCategoryStore } from '../../store/categoryStore'
import { useAccountStore } from '../../store/accountStore'
import { useBudgetStore } from '../../store/budgetStore'
import { formatCents, formatDate, dollarsToCents, centsToDollars } from '../../lib/utils'
import type { Transaction } from '../../types'

export function ExpenseRow({ transaction }: { transaction: Transaction }) {
  const updateTransaction = useTransactionStore((s) => s.updateTransaction)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)
  const categories = useCategoryStore((s) => s.categories)
  const accounts = useAccountStore((s) => s.accounts)
  const fetchAllBudgetStatuses = useBudgetStore((s) => s.fetchAllBudgetStatuses)

  const [editing, setEditing] = useState(false)
  const [amount, setAmount] = useState(
    centsToDollars(transaction.amount_cents).toString()
  )
  const [categoryId, setCategoryId] = useState(
    transaction.category_id?.toString() ?? '__none__'
  )
  const [accountId, setAccountId] = useState(
    transaction.account_id?.toString() ?? '__none__'
  )
  const [date, setDate] = useState(transaction.date)
  const [description, setDescription] = useState(transaction.description ?? '')

  const filteredCategories = categories.filter(
    (c) => c.type === transaction.type
  )

  const handleSave = async () => {
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) {
      toast.error('Invalid amount')
      return
    }
    try {
      await updateTransaction(transaction.id, {
        amount_cents: dollarsToCents(parsed),
        category_id: categoryId !== '__none__' ? Number(categoryId) : null,
        account_id: accountId !== '__none__' ? Number(accountId) : null,
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
      <TableRow>
        <TableCell>
          <Badge
            variant={transaction.type === 'income' ? 'secondary' : 'destructive'}
          >
            {transaction.type}
          </Badge>
        </TableCell>
        <TableCell>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-24"
          />
        </TableCell>
        <TableCell>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {filteredCategories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={String(a.id)}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-auto"
          />
        </TableCell>
        <TableCell>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleSave}
              className="text-emerald-500 hover:text-emerald-600"
            >
              <Check size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setEditing(false)}
            >
              <X size={14} />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow>
      <TableCell>
        <Badge
          variant={transaction.type === 'income' ? 'secondary' : 'destructive'}
        >
          {transaction.type}
        </Badge>
      </TableCell>
      <TableCell className="font-medium">
        {formatCents(transaction.amount_cents)}
      </TableCell>
      <TableCell>{transaction.category?.name ?? '\u2014'}</TableCell>
      <TableCell className="text-muted-foreground">
        {transaction.account?.name ?? '\u2014'}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(transaction.date)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {transaction.description || '\u2014'}
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setEditing(true)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleDelete}
            className="hover:text-destructive"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
