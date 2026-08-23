import type { CartItem } from '@/lib/types/product'

export type CartSession = {
  knownUserId: string | null | undefined
  visible: CartItem[]
  vault: Record<string, CartItem[]>
}

export function applyCartSession(state: CartSession, userId: string | null): CartSession {
  if (state.knownUserId === userId) return state

  const vault = { ...state.vault }
  if (state.knownUserId) vault[state.knownUserId] = state.visible

  if (!userId) return { knownUserId: null, visible: [], vault }

  const visible = userId in vault ? vault[userId] : state.visible
  vault[userId] = visible
  return { knownUserId: userId, visible, vault }
}
