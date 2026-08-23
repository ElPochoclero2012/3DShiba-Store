'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CATEGORY_LABELS, type Product } from '@/lib/types/product'
import { deleteProduct } from '@/app/actions/products'
import ProductForm from '@/components/admin/ProductForm'
import { formatPrice } from '@/lib/utils/format'

export default function AdminProductList({ products }: { products: Product[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`¿Eliminar “${product.name}”?`)) return
    const result = await deleteProduct(product.id, product.image_url)
    if (result.error) {
      setError(result.error)
      return
    }
    router.refresh()
  }

  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-card p-6 text-sm text-muted">
        Todavía no hay productos.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-700">{error}</p>}
      {editing && (
        <div className="rounded-2xl border border-shiba/30 p-1">
          <div className="flex items-center justify-between px-4 pt-3">
            <h3 className="font-semibold">Editar {editing.name}</h3>
            <button type="button" onClick={() => setEditing(null)} className="text-sm text-muted">
              Cerrar
            </button>
          </div>
          <ProductForm product={editing} onDone={() => setEditing(null)} />
        </div>
      )}

      <ul className="space-y-3">
        {products.map((product) => (
          <li
            key={product.id}
            className="flex gap-3 rounded-2xl border border-line bg-card p-3"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-background">
              {product.image_url ? (
                <Image src={product.image_url} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-muted">
                  Sin foto
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{product.name}</p>
              <p className="text-sm text-muted">
                {CATEGORY_LABELS[product.category]} · {formatPrice(product.price)}
                {product.featured ? ' · Destacado' : ''}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setEditing(product)}
                className="text-sm font-medium text-shiba hover:underline"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(product)}
                className="text-sm font-medium text-red-700 hover:underline"
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
