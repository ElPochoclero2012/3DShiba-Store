import type { SupabaseClient } from '@supabase/supabase-js'
import {
  ALLOWED_PRODUCT_IMAGE_TYPES,
  MAX_PRODUCT_IMAGE_BYTES,
  PRODUCT_IMAGE_BUCKET,
} from '@/lib/utils/productImages'

const MAX_EDGE = 1600

function toBlob(canvas: HTMLCanvasElement, mime: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality))
}

function extensionFor(blob: Blob, original: File) {
  if (blob.type === 'image/webp') return 'webp'
  if (blob.type === 'image/png') return 'png'
  if (blob.type === 'image/jpeg') return 'jpg'
  if (original.type === 'image/png') return 'png'
  if (original.type === 'image/webp') return 'webp'
  return 'jpg'
}

async function compressPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  // ponytail: JPEG no tiene alfa; PNG/WebP se guardan en WebP (o PNG si el navegador no puede).
  if (file.type !== 'image/jpeg') {
    const webp = await toBlob(canvas, 'image/webp', 0.82)
    if (webp && webp.size > 0) return webp
    const png = await toBlob(canvas, 'image/png')
    if (png && png.size > 0) return png
    return file
  }

  const jpeg = await toBlob(canvas, 'image/jpeg', 0.82)
  return jpeg && jpeg.size > 0 ? jpeg : file
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
    blob = await compressPhoto(file)
  } catch {
    blob = file
  }

  if (blob.size > MAX_PRODUCT_IMAGE_BYTES) {
    return { error: 'Cada imagen no puede superar 4 MB' }
  }

  const ext = extensionFor(blob, file)
  const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: blob.type || file.type,
  })
  if (error) return { error: error.message }

  return {
    url: supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl,
  }
}
