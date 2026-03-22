// Enums matching server models
export type TransactionType = 'income' | 'expense'
export type AccountType = 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment'
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly'

// Read models (GET responses)
export interface Account {
  id: number
  name: string
  type: AccountType
}

export interface Category {
  id: number
  name: string
  type: TransactionType
}

export interface Transaction {
  id: number
  amount_cents: number
  description: string | null
  date: string
  type: TransactionType
  account_id: number | null
  category_id: number | null
  account: Account | null
  category: Category | null
}

export interface Budget {
  id: number
  category_id: number
  amount_cents: number
  period: BudgetPeriod
  category: Category
}

export interface BudgetStatus {
  budget: Budget
  spent_cents: number
  remaining_cents: number
  period_start: string
  period_end: string
}

// Create payloads
export interface AccountCreate {
  name: string
  type: AccountType
}

export interface CategoryCreate {
  name: string
  type: TransactionType
}

export interface TransactionCreate {
  amount_cents: number
  description?: string
  date: string
  type: TransactionType
  account_id?: number
  category_id?: number
}

export interface BudgetCreate {
  category_id: number
  amount_cents: number
  period?: BudgetPeriod
}

// Update payloads
export interface AccountUpdate {
  name?: string
  type?: AccountType
}

export interface CategoryUpdate {
  name?: string
  type?: TransactionType
}

export interface TransactionUpdate {
  amount_cents?: number
  description?: string
  date?: string
  type?: TransactionType
  account_id?: number | null
  category_id?: number | null
}

export interface BudgetUpdate {
  amount_cents?: number
  period?: BudgetPeriod
}

// UI-only types
export type ThemeMode = 'light' | 'dark' | 'system'
