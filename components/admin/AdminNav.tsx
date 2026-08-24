'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/admin/pedidos', label: 'Pedidos' },
  { href: '/admin/dashboard', label: 'Productos' },
]

export default function AdminNav({ unseenPedidos = 0 }: { unseenPedidos?: number }) {
  const pathname = usePathname()

  return (
    <div className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-6xl gap-1 px-4 pt-4">
        {LINKS.map((link) => {
          const active = pathname === link.href
          const showBadge = link.href === '/admin/pedidos' && unseenPedidos > 0
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-t-xl px-4 py-2.5 text-sm font-medium ${
                active
                  ? 'bg-background text-ink'
                  : 'text-muted hover:bg-background/60 hover:text-ink'
              }`}
            >
              {link.label}
              {showBadge && (
                <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-semibold text-white">
                  {unseenPedidos}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
