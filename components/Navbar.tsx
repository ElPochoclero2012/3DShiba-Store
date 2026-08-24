'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, ShoppingCart, X } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { bindCartSession, whenCartReady } from '@/lib/store/bindCartSession'
import { useCartItemCount } from '@/lib/store/useCart'
import { countUnseenAdminOrders } from '@/app/actions/orders'
import BrandLogo from '@/components/BrandLogo'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Catálogo' },
  { href: '/nosotros', label: 'Sobre nosotros' },
]

export default function Navbar() {
  const pathname = usePathname()
  const itemCount = useCartItemCount()
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [unseenPedidos, setUnseenPedidos] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let booted = false

    const load = async () => {
      await whenCartReady()
      const {
        data: { user: current },
      } = await supabase.auth.getUser()
      bindCartSession(current?.id ?? null)
      booted = true
      setUser(current)

      if (!current) {
        setIsAdmin(false)
        setUnseenPedidos(0)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', current.id)
        .maybeSingle()

      const admin = profile?.role === 'admin'
      setIsAdmin(admin)
      setUnseenPedidos(admin ? await countUnseenAdminOrders() : 0)
    }

    void load()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // ponytail: INITIAL_SESSION can race getUser; first bind waits for load().
      if (!booted && event === 'INITIAL_SESSION') return
      void whenCartReady().then(() => bindCartSession(session?.user?.id ?? null))
      setUser(session?.user ?? null)
      if (!session?.user) {
        setIsAdmin(false)
        setUnseenPedidos(0)
        return
      }
      void supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()
        .then(async ({ data }) => {
          const admin = data?.role === 'admin'
          setIsAdmin(admin)
          setUnseenPedidos(admin ? await countUnseenAdminOrders() : 0)
        })
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!isAdmin) {
      setUnseenPedidos(0)
      return
    }
    void countUnseenAdminOrders().then(setUnseenPedidos)
  }, [isAdmin, pathname])

  const handleLogout = async () => {
    if (user) {
      await whenCartReady()
      bindCartSession(user.id)
      bindCartSession(null)
    }
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.assign('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-shiba-dark text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <BrandLogo />

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition ${
                pathname === link.href ? 'text-white' : 'text-white/80 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/pedidos"
              className={`text-sm font-medium transition ${
                pathname.startsWith('/admin') ? 'text-white' : 'text-white/80 hover:text-white'
              }`}
            >
              Admin
              {unseenPedidos > 0 && (
                <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
                  {unseenPedidos}
                </span>
              )}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/carrito"
            className="relative rounded-full p-2 text-white hover:bg-white/15"
            aria-label="Carrito"
          >
            <ShoppingCart className="h-5 w-5" />
            {ready && itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-white px-1 text-center text-xs font-semibold text-ink">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link
                href="/cuenta"
                className={`hidden text-sm font-medium md:inline ${
                  pathname === '/cuenta' ? 'text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                Mi cuenta
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-full border border-white/70 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/15 md:inline-flex"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full border border-white/70 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 md:inline-flex"
            >
              Ingresar
            </Link>
          )}

          <button
            type="button"
            className="rounded-full p-2 text-white hover:bg-white/15 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Menú"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/20 bg-shiba-dark px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-white"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/pedidos"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-white"
              >
                Admin
                {unseenPedidos > 0 ? ` (${unseenPedidos})` : ''}
              </Link>
            )}
            {user ? (
              <>
                <Link
                  href="/cuenta"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-white"
                >
                  Mi cuenta
                </Link>
                <button type="button" onClick={handleLogout} className="text-left text-sm font-medium text-white">
                  Salir
                </button>
              </>
            ) : (
              <Link href="/login" className="text-sm font-medium text-white">
                Ingresar
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
