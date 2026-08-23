'use client'

import { MessageCircle } from 'lucide-react'
import type { CartItem } from '@/lib/types/product'
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
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white hover:bg-[#1ebe5d] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <MessageCircle className="h-5 w-5" />
      Confirmar pedido por WhatsApp
    </button>
  )
}
