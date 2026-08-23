import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Order, OrderItem } from '@/lib/types/product'
import { formatDateTime, formatPrice, toNumber } from '@/lib/utils/format'

function mapOrders(rows: unknown): Order[] {
  if (!Array.isArray(rows)) return []
  return rows.flatMap((row) => {
    if (!row || typeof row !== 'object') return []
    const data = row as Record<string, unknown>
    const items = Array.isArray(data.items)
      ? data.items.flatMap((item): OrderItem[] => {
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
      : []

    return [
      {
        id: String(data.id ?? ''),
        user_id: String(data.user_id ?? ''),
        items,
        total: toNumber(data.total),
        notes: typeof data.notes === 'string' ? data.notes : null,
        created_at: String(data.created_at ?? ''),
      },
    ]
  }).filter((order) => order.id)
}

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/cuenta')
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const orders = mapOrders(data)

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 text-ink">
      <h1 className="text-3xl font-bold">Mi cuenta</h1>
      <p className="mt-2 text-muted">{user.email}</p>

      <h2 className="mt-10 text-xl font-semibold">Pedidos</h2>
      <p className="mt-1 text-sm text-muted">
        Quedan registrados cuando confirmás que enviaste el mensaje por WhatsApp.
      </p>

      {error ? (
        <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          No se pudieron cargar los pedidos. Si menciona una tabla inexistente, corré el bloque
          de <code>orders</code> en <code>supabase/schema.sql</code>.
        </p>
      ) : orders.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-line bg-card p-6 text-muted">
          Todavía no hay pedidos.{' '}
          <Link href="/productos" className="font-medium text-shiba-dark hover:underline">
            Ir al catálogo
          </Link>
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-line bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-muted">{formatDateTime(order.created_at)}</p>
                <p className="font-semibold">{formatPrice(order.total)}</p>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {order.items.map((item) => (
                  <li key={`${order.id}-${item.id}`}>
                    {item.quantity}× {item.name} · {formatPrice(item.price)}
                  </li>
                ))}
              </ul>
              {order.notes && (
                <p className="mt-3 text-sm text-muted">Notas: {order.notes}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
