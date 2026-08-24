export const PRODUCT_IMAGE_BUCKET = 'product-images'
export const MAX_PRODUCT_PHOTOS = 5
export const MAX_PRODUCT_IMAGE_BYTES = 4 * 1024 * 1024
export const ALLOWED_PRODUCT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function isProductStorageUrl(url: string) {
  return url.includes('/storage/v1/object/public/product-images/')
}

export function storagePathFromUrl(url: string | null | undefined) {
  if (!url) return null
  const marker = '/product-images/'
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length))
}
