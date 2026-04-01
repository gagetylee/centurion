import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './components/dashboard/DashboardPage'
import { BudgetsPage } from './components/budgets/BudgetsPage'
import { ExpensesPage } from './components/expenses/ExpensesPage'
import { SettingsPage } from './components/settings/SettingsPage'
import { useCategoryStore } from './store/categoryStore'
import { useAccountStore } from './store/accountStore'
import { useBudgetStore } from './store/budgetStore'
import { useTransactionStore } from './store/transactionStore'

function DataLoader() {
  const fetchCategories = useCategoryStore((s) => s.fetchCategories)
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts)
  const fetchBudgets = useBudgetStore((s) => s.fetchBudgets)
  const fetchAllBudgetStatuses = useBudgetStore((s) => s.fetchAllBudgetStatuses)
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions)
  const budgets = useBudgetStore((s) => s.budgets)

  useEffect(() => {
    fetchCategories()
    fetchAccounts()
    fetchBudgets()
    fetchTransactions()
  }, [fetchCategories, fetchAccounts, fetchBudgets, fetchTransactions])

  useEffect(() => {
    if (budgets.length > 0) {
      fetchAllBudgetStatuses()
    }
  }, [budgets, fetchAllBudgetStatuses])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <DataLoader />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontSize: '14px',
          },
        }}
      />
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
