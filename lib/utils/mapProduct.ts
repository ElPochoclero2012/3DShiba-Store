import {
  isProductCategory,
  type Product,
  type ProductCategory,
} from '@/lib/types/product'
import { toNumber } from '@/lib/utils/format'

export function mapProduct(row: Record<string, unknown>): Product {
  const category = typeof row.category === 'string' && isProductCategory(row.category)
    ? row.category
    : ('figuras' as ProductCategory)

  const name =
    (typeof row.name === 'string' && row.name.trim()) ||
    (typeof row.title === 'string' && row.title.trim()) ||
    'Producto'

  const image =
    (typeof row.image_url === 'string' && row.image_url) ||
    (typeof row.image === 'string' && row.image) ||
    null

  return {
    id: String(row.id ?? ''),
    name,
    description: typeof row.description === 'string' ? row.description : null,
    price: toNumber(row.price),
    category,
    image_url: image,
    featured: Boolean(row.featured),
    stock: Math.max(0, Math.trunc(toNumber(row.stock))),
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
