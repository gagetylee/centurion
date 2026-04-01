import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTransactionStore } from '../../store/transactionStore'
import { formatCents } from '../../lib/utils'

function getInitials(name: string): string {
  return name
    .split(/[\s/&]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

const COLORS = ['bg-pink-200 text-pink-700', 'bg-teal-200 text-teal-700', 'bg-amber-200 text-amber-700', 'bg-blue-200 text-blue-700', 'bg-purple-200 text-purple-700', 'bg-emerald-200 text-emerald-700']

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

export function RecentTransactions() {
  const transactions = useTransactionStore((s) => s.transactions)

  const recent = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
  }, [transactions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardAction>
          <Link
            to="/expenses"
            className="text-sm font-medium text-[#4A9B8E] hover:underline"
          >
            See all ↗
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No transactions yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((t, i) => {
                const categoryName = t.category?.name ?? 'Uncategorized'
                const initials = getInitials(categoryName)
                const colorClass = COLORS[i % COLORS.length]
                const isExpense = t.type === 'expense'

                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${colorClass}`}>
                          {initials}
                        </div>
                        <span className="font-medium">{categoryName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatShortDate(t.date)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.description || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {isExpense ? '- ' : '+ '}{formatCents(t.amount_cents)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
