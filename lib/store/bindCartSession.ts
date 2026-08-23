'use client'

import type { CartItem } from '@/lib/types/product'
import { applyCartSession } from '@/lib/store/cartSession'
import { useCart } from '@/lib/store/useCart'

// ponytail: carrito por usuario solo en este navegador; no cruza dispositivos.
const VAULT_KEY = '3dshiba-carts'

let knownUserId: string | null | undefined
let ownerId: string | null = null
let subscribed = false

function readVault(): Record<string, CartItem[]> {
  try {
    const parsed = JSON.parse(localStorage.getItem(VAULT_KEY) ?? '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeVault(vault: Record<string, CartItem[]>) {
  localStorage.setItem(VAULT_KEY, JSON.stringify(vault))
}

function ensureSubscribe() {
  if (subscribed) return
  subscribed = true
  useCart.subscribe((state) => {
    if (!ownerId) return
    writeVault({ ...readVault(), [ownerId]: state.items })
  })
}

export function whenCartReady() {
  if (useCart.persist.hasHydrated()) return Promise.resolve()
  return new Promise<void>((resolve) => {
    const unsub = useCart.persist.onFinishHydration(() => {
      unsub()
      resolve()
    })
  })
}

export function bindCartSession(userId: string | null) {
  ensureSubscribe()

  const current = { knownUserId, visible: useCart.getState().items, vault: readVault() }
  const next = applyCartSession(current, userId)
  knownUserId = next.knownUserId
  ownerId = userId
  if (next === current) return

  writeVault(next.vault)
  useCart.setState({ items: next.visible })
}
