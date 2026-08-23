'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORY_LABELS, PRODUCT_CATEGORIES, type Product } from '@/lib/types/product'
import { upsertProduct } from '@/app/actions/products'

type Props = {
  product?: Product | null
  onDone?: () => void
}

export default function ProductForm({ product, onDone }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(event.currentTarget)
    const result = await upsertProduct(formData)

    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }

    setSuccess(true)
    if (!product) event.currentTarget.reset()
    router.refresh()
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-line bg-card p-5">
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div>
        <label className="mb-1 block text-sm font-medium">Nombre</label>
        <input
          name="name"
          required
          defaultValue={product?.name ?? ''}
          className="w-full rounded-xl border border-line bg-background p-2.5"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Descripción</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description ?? ''}
          className="w-full rounded-xl border border-line bg-background p-2.5"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Precio (ARS)</label>
          <input
            name="price"
            type="number"
            min={0}
            step="1"
            required
            defaultValue={product?.price ?? 0}
            className="w-full rounded-xl border border-line bg-background p-2.5"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Stock</label>
          <input
            name="stock"
            type="number"
            min={0}
            step="1"
            defaultValue={product?.stock ?? 0}
            className="w-full rounded-xl border border-line bg-background p-2.5"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Categoría</label>
        <select
          name="category"
          defaultValue={product?.category ?? 'figuras'}
          className="w-full rounded-xl border border-line bg-background p-2.5"
        >
          {PRODUCT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
        Destacar en la landing
      </label>

      <div>
        <label className="mb-1 block text-sm font-medium">Foto</label>
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="w-full text-sm"
        />
        <p className="mt-1 text-xs text-muted">JPG, PNG o WebP. Máximo 5 MB.</p>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {success && <p className="text-sm text-green-700">Producto guardado.</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-shiba px-5 py-2.5 text-sm font-semibold text-white hover:bg-shiba-dark disabled:opacity-50"
      >
        {loading ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
      </button>
    </form>
  )
}
