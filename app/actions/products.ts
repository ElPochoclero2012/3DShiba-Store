'use server'

import { revalidatePath } from 'next/cache'
import { isProductCategory } from '@/lib/types/product'
import { requireAdmin } from '@/lib/utils/admin'
import { toNumber } from '@/lib/utils/format'

const MAX_SIZE = 4 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PHOTOS = 5

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
  try {
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
    const file = formData.get('image')
    const galleryFiles = formData.getAll('gallery')
    const kept = formData.getAll('keep_gallery').map(String).filter(Boolean)
    const existingCover = String(formData.get('existing_image_url') ?? '').trim()

    if (!name) return { error: 'El nombre es obligatorio' }
    if (price < 0) return { error: 'El precio no puede ser negativo' }
    if (!isProductCategory(category)) return { error: 'Categoría inválida' }

    const productId = id || crypto.randomUUID()
    const photos: string[] = []

    async function uploadBlob(blob: Blob, filename: string) {
      if (!ALLOWED.includes(blob.type)) {
        return { error: 'La imagen tiene que ser JPG, PNG o WebP' }
      }
      if (blob.size > MAX_SIZE) {
        return { error: 'Cada imagen no puede superar 4 MB' }
      }
      const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const bytes = new Uint8Array(await blob.arrayBuffer())
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, bytes, { upsert: true, contentType: blob.type })
      if (uploadError) return { error: uploadError.message }
      return { url: supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl }
    }

    if (file instanceof Blob && file.size > 0) {
      const uploaded = await uploadBlob(file, file instanceof File ? file.name : 'foto.jpg')
      if (uploaded.error) return { error: uploaded.error }
      if (uploaded.url) photos.push(uploaded.url)
    } else if (existingCover) {
      photos.push(existingCover)
    }

    for (const url of kept) {
      if (!photos.includes(url)) photos.push(url)
    }

    for (const extra of galleryFiles) {
      if (!(extra instanceof Blob) || extra.size === 0) continue
      if (photos.length >= MAX_PHOTOS) break
      const uploaded = await uploadBlob(extra, extra instanceof File ? extra.name : 'foto.jpg')
      if (uploaded.error) return { error: uploaded.error }
      if (uploaded.url && !photos.includes(uploaded.url)) photos.push(uploaded.url)
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
      ...(photos.length ? { image_url: photos[0], image_urls: photos } : {}),
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
      await supabase.storage.from('product-images').remove(paths)
    }

    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidateProductPaths(id)
    return { success: true }
  } catch (error) {
    return { error: asError(error) }
  }
}
