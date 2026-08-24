'use server'

import { revalidatePath } from 'next/cache'
import { isProductCategory } from '@/lib/types/product'
import { requireAdmin } from '@/lib/utils/admin'
import { toNumber } from '@/lib/utils/format'
import {
  isProductStorageUrl,
  MAX_PRODUCT_PHOTOS,
  PRODUCT_IMAGE_BUCKET,
  storagePathFromUrl,
} from '@/lib/utils/productImages'

function asError(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo guardar el producto'
}

function slugFromName(name: string, id: string) {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return `${base || 'producto'}-${id.slice(0, 8)}`
}

function revalidateProductPaths(id?: string) {
  revalidatePath('/')
  revalidatePath('/productos')
  revalidatePath('/admin/dashboard')
  if (id) revalidatePath(`/productos/${id}`)
}

function takeStorageUrl(value: FormDataEntryValue | null) {
  const url = String(value ?? '').trim()
  return isProductStorageUrl(url) ? url : ''
}

export async function upsertProduct(formData: FormData) {
  try {
    const { supabase, isAdmin } = await requireAdmin()
    if (!isAdmin) {
      return { error: 'No autorizado' }
    }

    const id = String(formData.get('id') ?? '').trim()
    const productId = id || String(formData.get('product_id') ?? '').trim() || crypto.randomUUID()
    const name = String(formData.get('name') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()
    const price = toNumber(formData.get('price'))
    const category = String(formData.get('category') ?? '')
    const featured = formData.get('featured') === 'on'

    if (!name) return { error: 'El nombre es obligatorio' }
    if (price < 0) return { error: 'El precio no puede ser negativo' }
    if (!isProductCategory(category)) return { error: 'Categoría inválida' }

    const photos = [
      ...formData.getAll('gallery_url').map(takeStorageUrl),
      ...formData.getAll('new_gallery_url').map(takeStorageUrl),
    ]
      .filter(Boolean)
      .filter((url, index, list) => list.indexOf(url) === index)
      .slice(0, MAX_PRODUCT_PHOTOS)

    const previous = formData.getAll('previous_url').map(takeStorageUrl).filter(Boolean)
    const removed = previous.filter((url) => !photos.includes(url))
    const removedPaths = [
      ...new Set(removed.map(storagePathFromUrl).filter((path): path is string => Boolean(path))),
    ]
    if (removedPaths.length) {
      await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove(removedPaths)
    }

    // ponytail: la DB real tiene title + slug NOT NULL (legado) además de name.
    const payload = {
      name,
      title: name,
      slug: slugFromName(name, productId),
      description: description || null,
      price,
      category,
      featured,
      image_url: photos[0] ?? null,
      image_urls: photos,
    }

    if (id) {
      const { error } = await supabase.from('products').update(payload).eq('id', id)
      if (error) {
        if (error.message.includes('image_urls')) {
          const { image_urls: _ignored, ...withoutGallery } = payload
          const retry = await supabase.from('products').update(withoutGallery).eq('id', id)
          if (retry.error) return { error: retry.error.message }
        } else {
          return { error: error.message }
        }
      }
    } else {
      const { error } = await supabase.from('products').insert({ id: productId, ...payload })
      if (error) {
        if (error.message.includes('image_urls')) {
          const { image_urls: _ignored, ...withoutGallery } = payload
          const retry = await supabase.from('products').insert({ id: productId, ...withoutGallery })
          if (retry.error) return { error: retry.error.message }
        } else {
          return { error: error.message }
        }
      }
    }

    revalidateProductPaths(productId)
    return { success: true }
  } catch (error) {
    return { error: asError(error) }
  }
}

export async function deleteProduct(id: string, imageUrl?: string | null) {
  try {
    const { supabase, isAdmin } = await requireAdmin()
    if (!isAdmin) {
      return { error: 'No autorizado' }
    }

    const { data: row } = await supabase
      .from('products')
      .select('image_url, image_urls')
      .eq('id', id)
      .maybeSingle()

    const urls = [
      typeof row?.image_url === 'string' ? row.image_url : imageUrl,
      ...(Array.isArray(row?.image_urls) ? row.image_urls : []),
    ].filter((url): url is string => typeof url === 'string' && url.length > 0)

    const paths = [...new Set(urls.map(storagePathFromUrl).filter((path): path is string => Boolean(path)))]
    if (paths.length) {
      await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove(paths)
    }

    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidateProductPaths(id)
    return { success: true }
  } catch (error) {
    return { error: asError(error) }
  }
}
