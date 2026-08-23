import AdminOrderList from '@/components/admin/AdminOrderList'
import { mapOrders } from '@/lib/utils/mapOrder'
import { createClient } from '@/lib/supabase/server'

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const orders = mapOrders(data).sort((a, b) => {
    if (!a.seen_at && b.seen_at) return -1
    if (a.seen_at && !b.seen_at) return 1
    return 0
  })

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-ink">Pedidos</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Quedan acá cuando el cliente confirma que envió el WhatsApp. Los nuevos aparecen
        primero.
      </p>

      <div className="mt-8">
        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error.message}. Si no ves los pedidos de los clientes, corré el bloque de{' '}
            <code>orders</code> en <code>supabase/schema.sql</code>.
          </p>
        ) : (
          <AdminOrderList orders={orders} />
        )}
      </div>
    </main>
  )
}
