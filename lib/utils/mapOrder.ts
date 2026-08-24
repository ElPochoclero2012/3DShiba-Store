import type { Order, OrderItem } from '@/lib/types/product'
import { toNumber } from '@/lib/utils/format'
import { parseOrderStatus } from '@/lib/utils/orderStatus'

function parseItems(value: unknown): OrderItem[] {
  const raw =
    Array.isArray(value)
      ? value
      : typeof value === 'string'
        ? (() => {
            try {
              const parsed = JSON.parse(value)
              return Array.isArray(parsed) ? parsed : []
            } catch {
              return []
            }
          })()
        : []

  return raw.flatMap((item): OrderItem[] => {
    if (!item || typeof item !== 'object') return []
    const line = item as Record<string, unknown>
    const id = String(line.id ?? '')
    if (!id) return []
    return [
      {
        id,
        name: String(line.name ?? 'Producto'),
        price: toNumber(line.price),
        quantity: Math.max(1, Math.trunc(toNumber(line.quantity))),
        image_url: typeof line.image_url === 'string' ? line.image_url : null,
      },
    ]
  })
}

export function mapOrders(rows: unknown): Order[] {
  if (!Array.isArray(rows)) return []
  return rows
    .flatMap((row) => {
      if (!row || typeof row !== 'object') return []
      const data = row as Record<string, unknown>
      return [
        {
          id: String(data.id ?? ''),
          user_id: String(data.user_id ?? ''),
          items: parseItems(data.items),
          total: toNumber(data.total),
          notes: typeof data.notes === 'string' ? data.notes : null,
          created_at: String(data.created_at ?? ''),
          customer_name: typeof data.customer_name === 'string' ? data.customer_name : null,
          customer_email: typeof data.customer_email === 'string' ? data.customer_email : null,
          shipping_address:
            typeof data.shipping_address === 'string' ? data.shipping_address : null,
          seen_at: typeof data.seen_at === 'string' ? data.seen_at : null,
          fulfillment_status: parseOrderStatus(data.fulfillment_status ?? data.status),
        },
      ]
    })
    .filter((order) => order.id)
}
