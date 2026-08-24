import type { CartItem } from '@/lib/types/product'
import {
  formatCheckoutNotes,
  type CheckoutDetails,
} from '@/lib/utils/checkoutDetails'
import { formatPrice, toNumber } from '@/lib/utils/format'

export function formatWhatsAppOrder(params: {
  items: CartItem[]
  origin: string
  email?: string | null
  details?: CheckoutDetails
  notes?: string
}): string {
  const { items, origin, email, details } = params
  const lines: string[] = [
    'Hola! Quiero hacer un pedido en 3DShiba Store',
    '',
  ]

  let total = 0

  for (const item of items) {
    const unit = toNumber(item.price)
    const qty = Math.max(1, item.quantity)
    const subtotal = unit * qty
    total += subtotal

    lines.push(`• ${item.name}`)
    lines.push(`  Cantidad: ${qty}`)
    lines.push(`  Precio unitario: ${formatPrice(unit)}`)
    lines.push(`  Subtotal: ${formatPrice(subtotal)}`)
    lines.push(`  ${origin.replace(/\/$/, '')}/productos/${item.id}`)
    lines.push('')
  }

  lines.push(`Total: ${formatPrice(total)}`)

  if (email) {
    lines.push(`Email: ${email}`)
  }

  if (details) {
    lines.push(formatCheckoutNotes(details))
  } else {
    const trimmedNotes = params.notes?.trim()
    if (trimmedNotes) lines.push(`Notas: ${trimmedNotes}`)
  }

  return lines.join('\n').trim()
}

export function buildWhatsAppUrl(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

export function getWhatsAppNumber(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')
}

export function formatCustomPrintQuote(): string {
  return [
    'Hola! Quiero cotizar una impresión a pedido.',
    '',
    'Tengo el archivo del modelo (STL, 3MF u otro) y no está en el catálogo.',
    '¿Me indican cómo enviarlo y el presupuesto?',
  ].join('\n')
}
