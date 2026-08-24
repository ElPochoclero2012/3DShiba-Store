import type { SupabaseClient } from '@supabase/supabase-js'
import {
  ALLOWED_PRODUCT_IMAGE_TYPES,
  MAX_PRODUCT_IMAGE_BYTES,
  PRODUCT_IMAGE_BUCKET,
} from '@/lib/utils/productImages'

const MAX_EDGE = 1600

async function asJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.82)
  )
  return blob && blob.size > 0 ? blob : file
}

export async function uploadProductPhoto(
  supabase: SupabaseClient,
  productId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  if (!ALLOWED_PRODUCT_IMAGE_TYPES.includes(file.type)) {
    return { error: 'La imagen tiene que ser JPG, PNG o WebP' }
  }

  let blob: Blob
  try {
    blob = await asJpeg(file)
  } catch {
    blob = file
  }

  if (blob.size > MAX_PRODUCT_IMAGE_BYTES) {
    return { error: 'Cada imagen no puede superar 4 MB' }
  }

  const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: blob.type || 'image/jpeg',
  })
  if (error) return { error: error.message }

  return {
    url: supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl,
  }
}
