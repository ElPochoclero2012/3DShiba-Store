import {
  isProductCategory,
  type Product,
  type ProductCategory,
} from '@/lib/types/product'
import { toNumber } from '@/lib/utils/format'

function parseImageUrls(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(value)
            return Array.isArray(parsed) ? parsed : []
          } catch {
            return []
          }
        })()
      : []
  return [...new Set(raw.filter((url): url is string => typeof url === 'string' && url.length > 0))]
}

export function mapProduct(row: Record<string, unknown>): Product {
  const category = typeof row.category === 'string' && isProductCategory(row.category)
    ? row.category
    : ('figuras' as ProductCategory)

  const name =
    (typeof row.name === 'string' && row.name.trim()) ||
    (typeof row.title === 'string' && row.title.trim()) ||
    'Producto'

  const cover =
    (typeof row.image_url === 'string' && row.image_url) ||
    (typeof row.image === 'string' && row.image) ||
    null
  const image_urls = parseImageUrls(row.image_urls)
  const photos = [...new Set([cover, ...image_urls].filter((url): url is string => Boolean(url)))]

  return {
    id: String(row.id ?? ''),
    name,
    description: typeof row.description === 'string' ? row.description : null,
    price: toNumber(row.price),
    category,
    image_url: photos[0] ?? null,
    image_urls: photos,
    featured: Boolean(row.featured),
    created_at: String(row.created_at ?? new Date().toISOString()),
  }
}

export function mapProducts(rows: unknown): Product[] {
  if (!Array.isArray(rows)) return []
  return rows
    .filter((row): row is Record<string, unknown> => !!row && typeof row === 'object')
    .map(mapProduct)
    .filter((product) => product.id)
}
