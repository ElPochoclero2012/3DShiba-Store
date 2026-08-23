'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, ShoppingCart, X } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useCartItemCount } from '@/lib/store/useCart'
import CustomQuoteButton from '@/components/CustomQuoteButton'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Catálogo' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const itemCount = useCartItemCount()
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const load = async () => {
      const {
        data: { user: current },
      } = await supabase.auth.getUser()
      setUser(current)

      if (!current) {
        setIsAdmin(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', current.id)
        .maybeSingle()

      setIsAdmin(profile?.role === 'admin')
    }

    void load()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setIsAdmin(false)
        return
      }
      void supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()
        .then(({ data }) => setIsAdmin(data?.role === 'admin'))
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
          3D<span className="text-shiba">Shiba</span> Store
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition ${
                pathname === link.href ? 'text-shiba' : 'text-ink/80 hover:text-shiba'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className={`text-sm font-medium transition ${
                pathname.startsWith('/admin') ? 'text-shiba' : 'text-ink/80 hover:text-shiba'
              }`}
            >
              Admin
            </Link>
          )}
          <CustomQuoteButton size="sm" />
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/carrito"
            className="relative rounded-full p-2 text-ink hover:bg-background"
            aria-label="Carrito"
          >
            <ShoppingCart className="h-5 w-5" />
            {ready && itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-shiba px-1 text-center text-xs font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="hidden rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink hover:bg-background md:inline-flex"
            >
              Salir
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full bg-shiba px-3 py-1.5 text-sm font-medium text-white hover:bg-shiba-dark md:inline-flex"
            >
              Ingresar
            </Link>
          )}

          <button
            type="button"
            className="rounded-full p-2 text-ink hover:bg-background md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Menú"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-card px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-ink"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-ink"
              >
                Admin
              </Link>
            )}
            <CustomQuoteButton className="w-full" />
            {user ? (
              <button type="button" onClick={handleLogout} className="text-left text-sm font-medium text-ink">
                Salir
              </button>
            ) : (
              <Link href="/login" className="text-sm font-medium text-shiba">
                Ingresar
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
