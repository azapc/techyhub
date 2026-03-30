import { defineStore } from 'pinia'

export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  image: string | null
  quantity: number
  stock: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    isEmpty: (state) => state.items.length === 0,
  },

  actions: {
    addItem(product: Omit<CartItem, 'quantity'>, quantity = 1) {
      const existing = this.items.find((i) => i.id === product.id)
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, existing.stock)
      }
      else {
        this.items.push({ ...product, quantity: Math.min(quantity, product.stock) })
      }
      this.persist()
    },

    updateQuantity(id: string, quantity: number) {
      const item = this.items.find((i) => i.id === id)
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.stock))
        this.persist()
      }
    },

    removeItem(id: string) {
      this.items = this.items.filter((i) => i.id !== id)
      this.persist()
    },

    clear() {
      this.items = []
      this.persist()
    },

    persist() {
      if (import.meta.client) {
        localStorage.setItem('cart', JSON.stringify(this.items))
      }
    },

    restore() {
      if (import.meta.client) {
        const data = localStorage.getItem('cart')
        if (data) {
          try {
            this.items = JSON.parse(data)
          }
          catch {
            this.items = []
          }
        }
      }
    },
  },
})
