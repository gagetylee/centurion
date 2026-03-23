import { create } from 'zustand'
import type { Budget, BudgetCreate, BudgetUpdate, BudgetStatus, BudgetType } from '../types'
import { budgetsApi } from '../lib/api'

interface BudgetStore {
  budgets: Budget[]
  budgetStatuses: Record<number, BudgetStatus>
  loading: boolean
  fetchBudgets: (type?: BudgetType) => Promise<void>
  fetchBudgetStatus: (budgetId: number) => Promise<void>
  fetchAllBudgetStatuses: () => Promise<void>
  createBudget: (data: BudgetCreate) => Promise<Budget>
  updateBudget: (id: number, data: BudgetUpdate) => Promise<void>
  deleteBudget: (id: number) => Promise<void>
}

export const useBudgetStore = create<BudgetStore>()((set, get) => ({
  budgets: [],
  budgetStatuses: {},
  loading: false,

  fetchBudgets: async (type?: BudgetType) => {
    set({ loading: true })
    try {
      const budgets = await budgetsApi.list(0, 100, type)
      set({ budgets })
    } finally {
      set({ loading: false })
    }
  },

  fetchBudgetStatus: async (budgetId) => {
    const status = await budgetsApi.getStatus(budgetId)
    set((s) => ({
      budgetStatuses: { ...s.budgetStatuses, [budgetId]: status },
    }))
  },

  fetchAllBudgetStatuses: async () => {
    const { budgets } = get()
    const statuses = await Promise.all(
      budgets.map((b) => budgetsApi.getStatus(b.id))
    )
    const statusMap: Record<number, BudgetStatus> = {}
    for (const status of statuses) {
      statusMap[status.budget.id] = status
    }
    set({ budgetStatuses: statusMap })
  },

  createBudget: async (data) => {
    const budget = await budgetsApi.create(data)
    set((s) => ({ budgets: [...s.budgets, budget] }))
    return budget
  },

  updateBudget: async (id, data) => {
    const updated = await budgetsApi.update(id, data)
    set((s) => ({
      budgets: s.budgets.map((b) => (b.id === id ? updated : b)),
    }))
  },

  deleteBudget: async (id) => {
    await budgetsApi.delete(id)
    set((s) => ({
      budgets: s.budgets.filter((b) => b.id !== id),
      budgetStatuses: Object.fromEntries(
        Object.entries(s.budgetStatuses).filter(([k]) => Number(k) !== id)
      ),
    }))
  },
}))
