'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import type { CartItem } from '@/lib/types/product'
import { useCart } from '@/lib/store/useCart'
import {
  buildWhatsAppUrl,
  formatWhatsAppOrder,
  getWhatsAppNumber,
} from '@/lib/utils/formatWhatsAppOrder'

type Props = {
  items: CartItem[]
  email?: string | null
  notes?: string
}

export default function WhatsAppCheckoutButton({ items, email, notes }: Props) {
  const phone = getWhatsAppNumber()
  const clear = useCart((state) => state.clear)
  const [askConfirm, setAskConfirm] = useState(false)
  const disabled = items.length === 0 || !phone

  const handleClick = () => {
    if (disabled) return
    const message = formatWhatsAppOrder({
      items,
      origin: window.location.origin,
      email,
      notes,
    })
    window.open(buildWhatsAppUrl(phone, message), '_blank', 'noopener,noreferrer')
    setAskConfirm(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white hover:bg-[#1ebe5d] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MessageCircle className="h-5 w-5" />
        Confirmar pedido por WhatsApp
      </button>

      {askConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wa-confirm-title"
          onClick={() => setAskConfirm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="wa-confirm-title" className="text-lg font-semibold text-ink">
              ¿Pudiste enviar el pedido?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Se abrió WhatsApp en otra pestaña. Si el mensaje salió bien, vaciamos el
              carrito. Si no, lo dejamos como está.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setAskConfirm(false)}
                className="rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink hover:bg-background"
              >
                Todavía no
              </button>
              <button
                type="button"
                onClick={() => {
                  clear()
                  setAskConfirm(false)
                }}
                className="rounded-full bg-shiba px-4 py-2.5 text-sm font-semibold text-white hover:bg-shiba-dark"
              >
                Sí, ya lo envié
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
