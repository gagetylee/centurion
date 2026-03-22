import { create } from 'zustand'
import type { Category, CategoryCreate, CategoryUpdate } from '../types'
import { categoriesApi } from '../lib/api'

interface CategoryStore {
  categories: Category[]
  loading: boolean
  fetchCategories: () => Promise<void>
  createCategory: (data: CategoryCreate) => Promise<Category>
  updateCategory: (id: number, data: CategoryUpdate) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
}

export const useCategoryStore = create<CategoryStore>()((set) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true })
    try {
      const categories = await categoriesApi.list()
      set({ categories })
    } finally {
      set({ loading: false })
    }
  },

  createCategory: async (data) => {
    const category = await categoriesApi.create(data)
    set((s) => ({ categories: [...s.categories, category] }))
    return category
  },

  updateCategory: async (id, data) => {
    const updated = await categoriesApi.update(id, data)
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? updated : c)),
    }))
  },

  deleteCategory: async (id) => {
    await categoriesApi.delete(id)
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }))
  },
}))
