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

export function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const next = index + direction
  if (index < 0 || next < 0 || next >= list.length) return list
  const copy = [...list]
  ;[copy[index], copy[next]] = [copy[next], copy[index]]
  return copy
}
