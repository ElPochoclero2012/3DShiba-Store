import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/lib/types/product'
import { toNumber } from '@/lib/utils/format'

type AddItemInput = Omit<CartItem, 'quantity'> & { quantity?: number }

type CartState = {
  items: CartItem[]
  addItem: (item: AddItemInput) => void
  removeItem: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  clear: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const quantity = Math.max(1, item.quantity ?? 1)
          const existing = state.items.find((entry) => entry.id === item.id)
          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry.id === item.id
                  ? { ...entry, quantity: entry.quantity + quantity }
                  : entry
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                id: item.id,
                name: item.name,
                price: toNumber(item.price),
                image_url: item.image_url,
                quantity,
              },
            ],
          }
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      setQuantity: (id, quantity) =>
        set((state) => {
          if (quantity < 1) {
            return { items: state.items.filter((item) => item.id !== id) }
          }
          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          }
        }),
      clear: () => set({ items: [] }),
    }),
    { name: '3dshiba-cart' }
  )
)

export function useCartItemCount() {
  return useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0))
}

export function useCartTotal() {
  return useCart((state) =>
    state.items.reduce((sum, item) => sum + toNumber(item.price) * item.quantity, 0)
  )
}
