'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { markOrderSeen } from '@/app/actions/orders'
import type { Order } from '@/lib/types/product'
import { formatDateTime, formatPrice } from '@/lib/utils/format'

export default function AdminOrderList({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const handleSeen = async (orderId: string) => {
    setSavingId(orderId)
    setError(null)
    const result = await markOrderSeen(orderId)
    setSavingId(null)
    if (result.error) {
      setError(result.error)
      return
    }
    router.refresh()
  }

  if (orders.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-card p-6 text-sm text-muted">
        Todavía no hay pedidos confirmados.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <ul className="space-y-4">
        {orders.map((order) => {
          const isNew = !order.seen_at
          return (
            <li
              key={order.id}
              className={`rounded-2xl border bg-card p-5 shadow-sm ${
                isNew ? 'border-shiba/40' : 'border-line'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">#{order.id.slice(0, 8)}</p>
                    {isNew && (
                      <span className="rounded-full bg-shiba px-2 py-0.5 text-xs font-semibold text-white">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">{formatDateTime(order.created_at)}</p>
                </div>
                <p className="text-lg font-semibold text-ink">{formatPrice(order.total)}</p>
              </div>

              <p className="mt-3 text-sm text-ink">
                {order.customer_name || 'Cliente'}
                {order.customer_email ? ` · ${order.customer_email}` : ''}
              </p>
              {order.shipping_address && (
                <p className="mt-1 text-sm text-muted">{order.shipping_address}</p>
              )}

              <ul className="mt-3 space-y-1 text-sm text-ink">
                {order.items.map((item) => (
                  <li key={`${order.id}-${item.id}`}>
                    {item.quantity}× {item.name} · {formatPrice(item.price)}
                  </li>
                ))}
              </ul>

              {order.notes && (
                <p className="mt-3 whitespace-pre-line text-sm text-muted">{order.notes}</p>
              )}

              {isNew && (
                <button
                  type="button"
                  onClick={() => void handleSeen(order.id)}
                  disabled={savingId === order.id}
                  className="mt-4 rounded-full bg-shiba px-4 py-2 text-sm font-semibold text-white hover:bg-shiba-dark disabled:opacity-50"
                >
                  {savingId === order.id ? 'Guardando...' : 'Marcar como visto'}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
