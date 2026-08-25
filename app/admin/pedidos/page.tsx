import { listAdminOrders } from '@/app/actions/orders'
import AdminOrderList from '@/components/admin/AdminOrderList'

export default async function AdminOrdersPage() {
  const { orders, error } = await listAdminOrders()

  const sorted = [...orders].sort((a, b) => {
    const rank = { pending: 0, processing: 1, shipped: 2, completed: 3 }
    return rank[a.fulfillment_status] - rank[b.fulfillment_status]
  })

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-ink">Pedidos</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Quedan acá cuando el cliente confirma que envió el WhatsApp. Podés pasarlos a en
        proceso, enviado o completado.
      </p>

      <div className="mt-8">
        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </p>
        ) : (
          <AdminOrderList orders={sorted} />
        )}
      </div>
    </main>
  )
}
