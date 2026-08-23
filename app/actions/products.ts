'use server'

import { revalidatePath } from 'next/cache'
import { isProductCategory } from '@/lib/types/product'
import { requireAdmin } from '@/lib/utils/admin'
import { toNumber } from '@/lib/utils/format'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

function storagePathFromUrl(url: string | null | undefined) {
  if (!url) return null
  const marker = '/product-images/'
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length))
}

function revalidateProductPaths(id?: string) {
  revalidatePath('/')
  revalidatePath('/productos')
  revalidatePath('/admin/dashboard')
  if (id) revalidatePath(`/productos/${id}`)
}

export async function upsertProduct(formData: FormData) {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) {
    return { error: 'No autorizado' }
  }

  const id = String(formData.get('id') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const price = toNumber(formData.get('price'))
  const category = String(formData.get('category') ?? '')
  const featured = formData.get('featured') === 'on'
  const stock = Math.max(0, Math.trunc(toNumber(formData.get('stock'))))
  const file = formData.get('image')

  if (!name) return { error: 'El nombre es obligatorio' }
  if (price < 0) return { error: 'El precio no puede ser negativo' }
  if (!isProductCategory(category)) return { error: 'Categoría inválida' }

  const productId = id || crypto.randomUUID()
  let imageUrl: string | undefined

  if (file instanceof File && file.size > 0) {
    if (!ALLOWED.includes(file.type)) {
      return { error: 'La imagen tiene que ser JPG, PNG o WebP' }
    }
    if (file.size > MAX_SIZE) {
      return { error: 'La imagen no puede superar 5 MB' }
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${productId}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      return { error: uploadError.message }
    }

    imageUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
  }

  const payload = {
    name,
    description: description || null,
    price,
    category,
    featured,
    stock,
    ...(imageUrl ? { image_url: imageUrl } : {}),
  }

  if (id) {
    const { error } = await supabase.from('products').update(payload).eq('id', id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('products').insert({ id: productId, ...payload })
    if (error) return { error: error.message }
  }

  revalidateProductPaths(productId)
  return { success: true }
}

export async function deleteProduct(id: string, imageUrl?: string | null) {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) {
    return { error: 'No autorizado' }
  }

  const path = storagePathFromUrl(imageUrl)
  if (path) {
    await supabase.storage.from('product-images').remove([path])
  }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidateProductPaths(id)
  return { success: true }
}
