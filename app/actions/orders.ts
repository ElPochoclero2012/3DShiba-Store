'use server'

import { createClient } from '@/lib/supabase/server'
import type { CartItem, OrderItem } from '@/lib/types/product'
import { mapProducts } from '@/lib/utils/mapProduct'
import { toNumber } from '@/lib/utils/format'

export async function createOrder(input: { items: CartItem[]; notes?: string }) {
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

    // ponytail: la tabla real tiene customer_name/email NOT NULL (legado).
    const { error: insertError } = await supabase.from('orders').insert({
      user_id: user.id,
      customer_name: customerName,
      customer_email: customerEmail,
      items,
      total,
      notes: input.notes?.trim() || null,
    })

    if (insertError) return { error: insertError.message }
    return { success: true }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'No se pudo guardar el pedido',
    }
  }
}
