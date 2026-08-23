'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CartItem, OrderItem } from '@/lib/types/product'
import { requireAdmin } from '@/lib/utils/admin'
import {
  formatCheckoutNotes,
  formatDeliveryLine,
  type CheckoutDetails,
} from '@/lib/utils/checkoutDetails'
import { legacyOrderValue, missingNotNullColumn } from '@/lib/utils/legacyOrderColumns'
import { mapProducts } from '@/lib/utils/mapProduct'
import { toNumber } from '@/lib/utils/format'

export async function createOrder(input: { items: CartItem[]; details: CheckoutDetails }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Tenés que iniciar sesión para comprar.' }
    }

    if (!Array.isArray(input.items) || input.items.length === 0) {
      return { error: 'El carrito está vacío.' }
    }

    if (!input.details?.color || !input.details.material || !input.details.delivery) {
      return { error: 'Elegí color, material y forma de entrega.' }
    }

    const ids = [...new Set(input.items.map((item) => item.id).filter(Boolean))]
    const { data, error } = await supabase.from('products').select('*').in('id', ids)
    if (error) return { error: error.message }

    const products = new Map(mapProducts(data).map((product) => [product.id, product]))
    const items: OrderItem[] = []
    let total = 0

    for (const line of input.items) {
      const product = products.get(line.id)
      if (!product) {
        return { error: `No encontramos “${line.name}” en el catálogo.` }
      }

      const quantity = Math.max(1, Math.trunc(toNumber(line.quantity)))
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image_url: product.image_url,
      })
      total += product.price * quantity
    }

    const meta = user.user_metadata ?? {}
    const customerName =
      (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
      (typeof meta.name === 'string' && meta.name.trim()) ||
      user.email ||
      'Cliente'
    const customerEmail = user.email?.trim() || 'sin-email'
    const notes = formatCheckoutNotes(input.details)
    const shippingAddress = formatDeliveryLine(input.details)
    const known = { name: customerName, email: customerEmail, notes, items }

    // ponytail: la tabla real tiene NOT NULL de más; rellenamos y si falta otra, un reintento.
    const row: Record<string, unknown> = {
      user_id: user.id,
      customer_name: customerName,
      customer_email: customerEmail,
      shipping_address: shippingAddress,
      items,
      total,
      notes,
    }

    let lastError = ''
    for (let attempt = 0; attempt < 8; attempt++) {
      const { error: insertError } = await supabase.from('orders').insert(row)
      if (!insertError) return { success: true }

      lastError = insertError.message
      const column = missingNotNullColumn(lastError)
      if (!column) break
      if (column in row && row[column] != null) break
      row[column] = legacyOrderValue(column, known)
    }

    return { error: lastError }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'No se pudo guardar el pedido',
    }
  }
}

export async function markOrderSeen(orderId: string) {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) return { error: 'No tenés permiso.' }
  if (!orderId) return { error: 'Pedido inválido.' }

  const { error } = await supabase
    .from('orders')
    .update({ seen_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) {
    return {
      error: error.message.includes('seen_at')
        ? 'Falta la columna seen_at. Corré el bloque de orders en supabase/schema.sql.'
        : error.message,
    }
  }

  revalidatePath('/admin/pedidos')
  return { success: true }
}
