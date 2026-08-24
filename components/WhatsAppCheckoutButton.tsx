'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import type { CartItem } from '@/lib/types/product'
import { useCart } from '@/lib/store/useCart'
import { createClient } from '@/lib/supabase/client'
import { createOrder } from '@/app/actions/orders'
import type { CheckoutDetails } from '@/lib/utils/checkoutDetails'
import {
  buildWhatsAppUrl,
  formatWhatsAppOrder,
  getWhatsAppNumber,
} from '@/lib/utils/formatWhatsAppOrder'

type Props = {
  items: CartItem[]
  email?: string | null
  details?: CheckoutDetails
}

export default function WhatsAppCheckoutButton({ items, email, details }: Props) {
  const phone = getWhatsAppNumber()
  const clear = useCart((state) => state.clear)
  const [askConfirm, setAskConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const disabled = items.length === 0 || !phone || saving || !details

  const handleClick = async () => {
    if (disabled) return
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.assign('/login?next=/carrito')
      return
    }

    if (!details) return
    const message = formatWhatsAppOrder({
      items,
      origin: window.location.origin,
      email: email ?? user.email,
      details,
    })
    window.open(buildWhatsAppUrl(phone, message), '_blank', 'noopener,noreferrer')
    setAskConfirm(true)
  }

  const confirmSent = async () => {
    setSaving(true)
    setError(null)
    if (!details) {
      setSaving(false)
      return
    }
    const result = await createOrder({ items, details })
    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    clear()
    setAskConfirm(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={disabled}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white hover:bg-[#1ebe5d] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MessageCircle className="h-5 w-5" />
        Confirmar pedido por WhatsApp
      </button>
      {!details && items.length > 0 && (
        <p className="text-sm text-muted">Elegí cómo lo recibís.</p>
      )}

      {askConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wa-confirm-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-lg">
            <h2 id="wa-confirm-title" className="text-lg font-semibold text-ink">
              ¿Pudiste enviar el pedido?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Se abrió WhatsApp en otra pestaña. Si el mensaje salió bien, lo guardamos en
              tu cuenta y vaciamos el carrito.
            </p>
            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setAskConfirm(false)}
                disabled={saving}
                className="rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink hover:bg-background disabled:opacity-50"
              >
                Todavía no
              </button>
              <button
                type="button"
                onClick={() => void confirmSent()}
                disabled={saving}
                className="rounded-full bg-shiba px-4 py-2.5 text-sm font-semibold text-white hover:bg-shiba-dark disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Sí, ya lo envié'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
