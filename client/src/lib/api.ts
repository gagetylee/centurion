import type {
  Account, AccountCreate, AccountUpdate,
  Category, CategoryCreate, CategoryUpdate,
  Transaction, TransactionCreate, TransactionUpdate,
  Budget, BudgetCreate, BudgetUpdate, BudgetStatus, BudgetType,
} from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.detail ?? 'Request failed')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

function queryString(params: Record<string, string | number | undefined | null>): string {
  const entries = Object.entries(params).filter(([, v]) => v != null) as [string, string | number][]
  if (entries.length === 0) return ''
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
}

// Accounts
export const accountsApi = {
  list: (skip = 0, limit = 100) =>
    request<Account[]>(`/accounts${queryString({ skip, limit })}`),
  get: (id: number) =>
    request<Account>(`/accounts/${id}`),
  create: (data: AccountCreate) =>
    request<Account>('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: AccountUpdate) =>
    request<Account>(`/accounts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/accounts/${id}`, { method: 'DELETE' }),
}

// Categories
export const categoriesApi = {
  list: (skip = 0, limit = 100) =>
    request<Category[]>(`/categories${queryString({ skip, limit })}`),
  get: (id: number) =>
    request<Category>(`/categories/${id}`),
  create: (data: CategoryCreate) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: CategoryUpdate) =>
    request<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/categories/${id}`, { method: 'DELETE' }),
}

// Transactions
export interface TransactionFilters {
  account_id?: number
  category_id?: number
  start_date?: string
  end_date?: string
  skip?: number
  limit?: number
}

export const transactionsApi = {
  list: (filters: TransactionFilters = {}) =>
    request<Transaction[]>(`/transactions${queryString(filters as Record<string, string | number | undefined | null>)}`),
  get: (id: number) =>
    request<Transaction>(`/transactions/${id}`),
  create: (data: TransactionCreate) =>
    request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: TransactionUpdate) =>
    request<Transaction>(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/transactions/${id}`, { method: 'DELETE' }),
}

// Budgets
export const budgetsApi = {
  list: (skip = 0, limit = 100, type?: BudgetType) =>
    request<Budget[]>(`/budgets${queryString({ skip, limit, type })}`),
  get: (id: number) =>
    request<Budget>(`/budgets/${id}`),
  create: (data: BudgetCreate) =>
    request<Budget>('/budgets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: BudgetUpdate) =>
    request<Budget>(`/budgets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/budgets/${id}`, { method: 'DELETE' }),
  getStatus: (id: number) =>
    request<BudgetStatus>(`/budgets/${id}/status`),
}
