'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { markOrderSeen, setOrderStatus } from '@/app/actions/orders'
import type { Order } from '@/lib/types/product'
import { formatDateTime, formatPrice } from '@/lib/utils/format'
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  isUnseenOrder,
  type OrderStatus,
} from '@/lib/utils/orderStatus'

const STATUS_TONE: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-900',
  processing: 'bg-sky-100 text-sky-900',
  completed: 'bg-emerald-100 text-emerald-900',
  shipped: 'bg-violet-100 text-violet-900',
}

export default function AdminOrderList({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<OrderStatus | 'all' | 'unseen'>('all')

  const unseenCount = useMemo(
    () => orders.filter(isUnseenOrder).length,
    [orders]
  )

  const visible = useMemo(() => {
    if (filter === 'unseen') return orders.filter(isUnseenOrder)
    if (filter === 'all') return orders
    return orders.filter((order) => order.fulfillment_status === filter)
  }, [orders, filter])

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

  const handleStatus = async (orderId: string, status: OrderStatus) => {
    setSavingId(orderId)
    setError(null)
    const result = await setOrderStatus(orderId, status)
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
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            filter === 'all' ? 'bg-shiba text-white' : 'border border-line bg-card text-ink'
          }`}
        >
          Todos
        </button>
        <button
          type="button"
          onClick={() => setFilter('unseen')}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            filter === 'unseen' ? 'bg-shiba text-white' : 'border border-line bg-card text-ink'
          }`}
        >
          Nuevos{unseenCount > 0 ? ` (${unseenCount})` : ''}
        </button>
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === status ? 'bg-shiba text-white' : 'border border-line bg-card text-ink'
            }`}
          >
            {ORDER_STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card p-6 text-sm text-muted">
          No hay pedidos {filter === 'unseen' ? 'nuevos sin ver' : 'con ese estado'}.
        </p>
      ) : (
        <ul className="space-y-4">
          {visible.map((order) => (
            <li
              key={order.id}
              className={`rounded-2xl border bg-card p-5 shadow-sm ${
                isUnseenOrder(order) ? 'border-shiba/50' : 'border-line'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">#{order.id.slice(0, 8)}</p>
                    {isUnseenOrder(order) && (
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                        Nuevo
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_TONE[order.fulfillment_status]}`}
                    >
                      {ORDER_STATUS_LABELS[order.fulfillment_status]}
                    </span>
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

              {isUnseenOrder(order) && (
                <button
                  type="button"
                  disabled={savingId === order.id}
                  onClick={() => void handleSeen(order.id)}
                  className="mt-3 text-sm font-medium text-shiba-dark hover:underline disabled:opacity-50"
                >
                  Marcar como visto
                </button>
              )}

              <label className="mt-4 block text-sm font-medium text-ink">
                Estado
                <select
                  value={order.fulfillment_status}
                  disabled={savingId === order.id}
                  onChange={(event) =>
                    void handleStatus(order.id, event.target.value as OrderStatus)
                  }
                  className="mt-1 w-full max-w-xs rounded-xl border border-line bg-background p-2.5 text-sm disabled:opacity-50"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
