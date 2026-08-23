export const PRODUCT_CATEGORIES = [
  'figuras',
  'accesorios',
  'mates',
  'vasos',
  'juegos',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  figuras: 'Figuras',
  accesorios: 'Accesorios',
  mates: 'Mates',
  vasos: 'Vasos',
  juegos: 'Juegos',
}

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category: ProductCategory
  image_url: string | null
  featured: boolean
  created_at: string
}

export type Profile = {
  id: string
  email: string | null
  role: 'user' | 'admin'
  created_at: string
}

export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image_url: string | null
}

export type OrderItem = CartItem

export type Order = {
  id: string
  user_id: string
  items: OrderItem[]
  total: number
  notes: string | null
  created_at: string
}

export function isProductCategory(value: string): value is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value)
}
