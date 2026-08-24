import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { countUnseenAdminOrders } from '@/app/actions/orders'
import AdminNav from '@/components/admin/AdminNav'
import { requireAdmin } from '@/lib/utils/admin'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAdmin } = await requireAdmin()

  if (!user) {
    redirect('/login?next=/admin/pedidos')
  }

  if (!isAdmin) {
    redirect('/')
  }

  const unseenPedidos = await countUnseenAdminOrders()

  return (
    <div className="min-h-full bg-background">
      <AdminNav unseenPedidos={unseenPedidos} />
      {children}
    </div>
  )
}
