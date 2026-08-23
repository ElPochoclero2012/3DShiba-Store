import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/utils/admin'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAdmin } = await requireAdmin()

  if (!user) {
    redirect('/login?next=/admin/dashboard')
  }

  if (!isAdmin) {
    redirect('/')
  }

  return <div className="min-h-full bg-background">{children}</div>
}
