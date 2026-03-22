import type { Transaction } from '../../types'
import { ExpenseRow } from './ExpenseRow'
import { formatCents } from '../../lib/utils'

interface Props {
  transactions: Transaction[]
  total: number
}

export function ExpenseTable({ transactions, total }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ backgroundColor: 'var(--card-bg)' }}>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            <th className="px-3 py-3">Type</th>
            <th className="px-3 py-3">Amount</th>
            <th className="px-3 py-3">Category</th>
            <th className="px-3 py-3">Account</th>
            <th className="px-3 py-3">Date</th>
            <th className="px-3 py-3">Description</th>
            <th className="px-3 py-3 w-20"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <ExpenseRow key={t.id} transaction={t} />
          ))}
        </tbody>
        {transactions.length > 0 && (
          <tfoot>
            <tr>
              <td className="px-3 py-3"></td>
              <td className="px-3 py-3 text-sm font-semibold">
                {formatCents(total)}
              </td>
              <td colSpan={5} className="px-3 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
