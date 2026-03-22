import { create } from 'zustand'
import type { Account, AccountCreate, AccountUpdate } from '../types'
import { accountsApi } from '../lib/api'

interface AccountStore {
  accounts: Account[]
  loading: boolean
  fetchAccounts: () => Promise<void>
  createAccount: (data: AccountCreate) => Promise<Account>
  updateAccount: (id: number, data: AccountUpdate) => Promise<void>
  deleteAccount: (id: number) => Promise<void>
}

export const useAccountStore = create<AccountStore>()((set) => ({
  accounts: [],
  loading: false,

  fetchAccounts: async () => {
    set({ loading: true })
    try {
      const accounts = await accountsApi.list()
      set({ accounts })
    } finally {
      set({ loading: false })
    }
  },

  createAccount: async (data) => {
    const account = await accountsApi.create(data)
    set((s) => ({ accounts: [...s.accounts, account] }))
    return account
  },

  updateAccount: async (id, data) => {
    const updated = await accountsApi.update(id, data)
    set((s) => ({
      accounts: s.accounts.map((a) => (a.id === id ? updated : a)),
    }))
  },

  deleteAccount: async (id) => {
    await accountsApi.delete(id)
    set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }))
  },
}))
