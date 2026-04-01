import { Target, CreditCard, PiggyBank, TrendingUp, MoreHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCents } from '../../lib/utils'
import { useBudgetSummary } from '../../hooks/useBudgetSummary'

export function SummaryCards() {
  const { totalBudgeted, totalSpent, totalRemaining } = useBudgetSummary()

  const percentUsed = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0
  const headroom = totalBudgeted - totalSpent

  return (
    <div className="space-y-4">
      {/* Total Budget */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4A9B8E]/10">
                <Target size={18} className="text-[#4A9B8E]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{formatCents(totalBudgeted)}</p>
                <p className="text-xs font-medium text-[#4A9B8E]">+4% vs last month</p>
              </div>
            </div>
            <button className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Spent This Month */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <CreditCard size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Spent This Month</p>
                <p className="text-2xl font-bold">{formatCents(totalSpent)}</p>
                <p className="text-xs font-medium text-[#4A9B8E]">{formatCents(totalRemaining)} remaining</p>
              </div>
            </div>
            <button className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Savings */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <PiggyBank size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Savings</p>
                <p className="text-2xl font-bold">{formatCents(totalRemaining)}</p>
                <p className="text-xs font-medium text-[#4A9B8E]">+10% this month</p>
              </div>
            </div>
            <button className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Budget Used */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <TrendingUp size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget Used</p>
                <p className="text-2xl font-bold">{percentUsed}%</p>
                <p className="text-xs font-medium text-[#4A9B8E]">+{formatCents(headroom)} headroom</p>
              </div>
            </div>
            <button className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Mini gauge */}
          <div className="mt-3 flex flex-col items-center">
            <div className="relative h-20 w-40">
              <svg viewBox="0 0 120 70" className="h-full w-full">
                {/* Background arc */}
                <path
                  d="M 10 65 A 50 50 0 0 1 110 65"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Filled arc */}
                <path
                  d="M 10 65 A 50 50 0 0 1 110 65"
                  fill="none"
                  stroke="#4A9B8E"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.min(percentUsed, 100) * 1.57} 157`}
                />
              </svg>
              <div className="absolute inset-x-0 bottom-0 text-center">
                <p className="text-xs text-muted-foreground">Return</p>
                <p className="text-sm font-bold text-[#4A9B8E]">{percentUsed}% used</p>
              </div>
            </div>
            <div className="mt-1 flex gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#4A9B8E]" /> Spent
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-gray-200" /> Remaining
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
