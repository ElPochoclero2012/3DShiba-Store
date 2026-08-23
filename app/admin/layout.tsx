import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
import { requireAdmin } from '@/lib/utils/admin'

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

  return (
    <div className="min-h-full bg-background">
      <AdminNav />
      {children}
    </div>
  )
}
