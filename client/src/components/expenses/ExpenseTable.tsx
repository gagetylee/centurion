import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from '@/components/ui/table'
import { ExpenseRow } from './ExpenseRow'
import type { Transaction } from '../../types'

interface Props {
  transactions: Transaction[]
}

export function ExpenseTable({ transactions }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-20" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t) => (
          <ExpenseRow key={t.id} transaction={t} />
        ))}
      </TableBody>
    </Table>
  )
}
