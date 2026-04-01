import { AccountEditor } from './AccountEditor'
import { CategoryEditor } from './CategoryEditor'
import { BudgetEditor } from './BudgetEditor'

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your accounts, categories, and budgets</p>
      </div>

      <AccountEditor />
      <CategoryEditor />
      <BudgetEditor />
    </div>
  )
}
