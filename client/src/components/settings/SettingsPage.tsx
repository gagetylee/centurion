import { AccountEditor } from './AccountEditor'
import { CategoryEditor } from './CategoryEditor'
import { BudgetEditor } from './BudgetEditor'
import { ThemeToggle } from '../layout/ThemeToggle'

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <ThemeToggle />
      </div>

      <AccountEditor />
      <CategoryEditor />
      <BudgetEditor />
    </div>
  )
}
