import { useState } from 'react'
import { Plus, Search, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SummaryCards } from './SummaryCards'
import { SpendingChart } from './SpendingChart'
import { RecentTransactions } from './RecentTransactions'
import { ExpenseForm } from '../expenses/ExpenseForm'

export function DashboardPage() {
  const [formOpen, setFormOpen] = useState(false)
  const now = new Date()
  const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Gage</h1>
          <p className="text-sm text-muted-foreground">
            Here's an overview of your finances for {monthYear}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-full border bg-white text-muted-foreground hover:text-foreground">
            <Search size={16} />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full border bg-white text-muted-foreground hover:text-foreground">
            <Bell size={16} />
          </button>
          <Button onClick={() => setFormOpen(true)} className="bg-[#4A9B8E] hover:bg-[#3A7D72] text-white">
            <Plus size={16} />
            Add
          </Button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4A9B8E] text-sm font-semibold text-white">
            G
          </div>
        </div>
      </div>

      {/* Main grid: chart + transactions on left, summary cards on right */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <SpendingChart />
          <RecentTransactions />
        </div>
        <SummaryCards />
      </div>

      <ExpenseForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
