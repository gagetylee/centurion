import { create } from 'zustand'
import type { Transaction, TransactionCreate, TransactionUpdate } from '../types'
import { transactionsApi, type TransactionFilters } from '../lib/api'

interface TransactionStore {
  transactions: Transaction[]
  loading: boolean
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>
  createTransaction: (data: TransactionCreate) => Promise<Transaction>
  updateTransaction: (id: number, data: TransactionUpdate) => Promise<void>
  deleteTransaction: (id: number) => Promise<void>
}

export const useTransactionStore = create<TransactionStore>()((set) => ({
  transactions: [],
  loading: false,

  fetchTransactions: async (filters) => {
    set({ loading: true })
    try {
      const transactions = await transactionsApi.list(filters)
      set({ transactions })
    } finally {
      set({ loading: false })
    }
  },

  createTransaction: async (data) => {
    const transaction = await transactionsApi.create(data)
    set((s) => ({ transactions: [transaction, ...s.transactions] }))
    return transaction
  },

  updateTransaction: async (id, data) => {
    const updated = await transactionsApi.update(id, data)
    set((s) => ({
      transactions: s.transactions.map((t) => (t.id === id ? updated : t)),
    }))
  },

  deleteTransaction: async (id) => {
    await transactionsApi.delete(id)
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }))
  },
}))
