'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { upsertProduct } from '@/app/actions/products'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_LABELS, PRODUCT_CATEGORIES, type Product } from '@/lib/types/product'
import { uploadProductPhoto } from '@/lib/utils/uploadProductPhoto'

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

    const form = event.currentTarget
    const formData = new FormData(form)
    const productId = product?.id ?? crypto.randomUUID()
    if (!product?.id) formData.set('product_id', productId)

    const supabase = createClient()
    const cover = formData.get('image')
    if (cover instanceof File && cover.size > 0) {
      const uploaded = await uploadProductPhoto(supabase, productId, cover)
      if (uploaded.error) {
        setLoading(false)
        setError(uploaded.error)
        return
      }
      if (uploaded.url) formData.set('new_cover_url', uploaded.url)
    }
    formData.delete('image')

    for (const extra of formData.getAll('gallery')) {
      if (!(extra instanceof File) || extra.size === 0) continue
      const uploaded = await uploadProductPhoto(supabase, productId, extra)
      if (uploaded.error) {
        setLoading(false)
        setError(uploaded.error)
        return
      }
      if (uploaded.url) formData.append('new_gallery_url', uploaded.url)
    }
    formData.delete('gallery')

    let result: { error?: string }
    try {
      result = await upsertProduct(formData)
    } catch (error) {
      setLoading(false)
      setError(error instanceof Error ? error.message : 'No se pudo guardar el producto')
      return
    }

    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }

    setSuccess(true)
    if (!product) form.reset()
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
        <label className="mb-1 block text-sm font-medium">Foto principal</label>
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="w-full text-sm"
        />
        <p className="mt-1 text-xs text-muted">JPG, PNG o WebP. Se comprimen al subir.</p>
        {product?.image_url && (
          <input type="hidden" name="existing_image_url" value={product.image_url} />
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Fotos extra (opcional)</label>
        {product && product.image_urls.filter((url) => url !== product.image_url).length > 0 && (
          <ul className="mb-2 space-y-2">
            {product.image_urls
              .filter((url) => url !== product.image_url)
              .map((url) => (
                <li key={url}>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="keep_gallery" value={url} defaultChecked />
                    <span className="relative h-12 w-12 overflow-hidden rounded-lg bg-background">
                      <Image src={url} alt="" fill className="object-cover" sizes="48px" />
                    </span>
                    <span className="text-muted">Mantener</span>
                  </label>
                </li>
              ))}
          </ul>
        )}
        <input
          name="gallery"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="w-full text-sm"
        />
        <p className="mt-1 text-xs text-muted">Hasta 4 extras. Se suben directo al storage.</p>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {success && <p className="text-sm text-green-700">Producto guardado.</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-shiba px-5 py-2.5 text-sm font-semibold text-white hover:bg-shiba-dark disabled:opacity-50"
      >
        {loading ? 'Subiendo...' : product ? 'Guardar cambios' : 'Crear producto'}
      </button>
    </form>
  )
}
