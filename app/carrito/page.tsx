'use client'

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useCart, useCartTotal } from '@/lib/store/useCart'
import WhatsAppCheckoutButton from '@/components/WhatsAppCheckoutButton'
import { formatPrice, toNumber } from '@/lib/utils/format'
import { formatWhatsAppOrder, getWhatsAppNumber } from '@/lib/utils/formatWhatsAppOrder'

export default function CartPage() {
  const items = useCart((state) => state.items)
  const setQuantity = useCart((state) => state.setQuantity)
  const removeItem = useCart((state) => state.removeItem)
  const total = useCartTotal()
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const [notes, setNotes] = useState('')
  const [email, setEmail] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const origin = ready ? window.location.origin : ''

  useEffect(() => {
    const supabase = createClient()
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
      setAuthReady(true)
    })
  }, [])

  const preview = useMemo(
    () =>
      formatWhatsAppOrder({
        items,
        origin: origin || 'https://3dshibastore.local',
        email,
        notes,
      }),
    [items, origin, email, notes]
  )

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-ink">Tu carrito</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Revisá el pedido y confirmalo por WhatsApp. Coordinamos el pago y la entrega por chat.
      </p>

      {!ready ? (
        <p className="mt-10 text-muted">Cargando carrito...</p>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-line bg-card p-8 text-center">
          <p className="text-ink">El carrito está vacío.</p>
          <Link href="/productos" className="mt-4 inline-block font-medium text-shiba hover:underline">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <section className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex gap-4 rounded-2xl border border-line bg-card p-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-background">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted">
                      Sin foto
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/productos/${item.id}`} className="font-semibold text-ink hover:text-shiba">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{formatPrice(item.price)} c/u</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      Cantidad
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) => setQuantity(item.id, Number(event.target.value))}
                        className="w-16 rounded-lg border border-line bg-background px-2 py-1"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-red-700 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
                <p className="hidden font-semibold sm:block">
                  {formatPrice(toNumber(item.price) * item.quantity)}
                </p>
              </article>
            ))}
          </section>

          <aside className="h-fit space-y-4 rounded-2xl border border-line bg-card p-5">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <label className="block text-sm font-medium text-ink">
              Notas para el pedido
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Color, zona de entrega, alguna nota..."
                className="mt-1 w-full rounded-xl border border-line bg-background p-3 text-sm"
              />
            </label>

            {authReady && !email && (
              <p className="text-sm text-ink">
                Para comprar tenés que{' '}
                <Link href="/login?next=/carrito" className="font-medium text-shiba-dark hover:underline">
                  iniciar sesión
                </Link>
                .
              </p>
            )}

            <WhatsAppCheckoutButton items={items} email={email} notes={notes} />

            {!getWhatsAppNumber() && (
              <p className="text-sm text-red-700">
                Falta configurar NEXT_PUBLIC_WHATSAPP_NUMBER en el entorno.
              </p>
            )}

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                Vista previa del mensaje
              </p>
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-ink p-3 text-xs text-[#f7f1e8]">
                {preview}
              </pre>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}
