'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { upsertProduct } from '@/app/actions/products'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_LABELS, PRODUCT_CATEGORIES, type Product } from '@/lib/types/product'
import { MAX_PRODUCT_PHOTOS, moveItem } from '@/lib/utils/productImages'
import { uploadProductPhoto } from '@/lib/utils/uploadProductPhoto'

type Props = {
  product?: Product | null
  onDone?: () => void
}

export default function ProductForm({ product, onDone }: Props) {
  const router = useRouter()
  const [photos, setPhotos] = useState<string[]>(product?.image_urls ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const remaining = MAX_PRODUCT_PHOTOS - photos.length

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
    const nextPhotos = [...photos]
    for (const extra of formData.getAll('gallery')) {
      if (!(extra instanceof File) || extra.size === 0) continue
      if (nextPhotos.length >= MAX_PRODUCT_PHOTOS) break
      const uploaded = await uploadProductPhoto(supabase, productId, extra)
      if (uploaded.error) {
        setLoading(false)
        setError(uploaded.error)
        return
      }
      if (uploaded.url && !nextPhotos.includes(uploaded.url)) nextPhotos.push(uploaded.url)
    }
    formData.delete('gallery')
    formData.delete('gallery_url')
    for (const url of nextPhotos) formData.append('gallery_url', url)

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
    setPhotos(nextPhotos)
    if (!product) {
      form.reset()
      setPhotos([])
    }
    router.refresh()
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-line bg-card p-5">
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      {(product?.image_urls ?? []).map((url) => (
        <input key={url} type="hidden" name="previous_url" value={url} />
      ))}

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
        <p className="mb-1 text-sm font-medium">Fotos</p>
        <p className="mb-2 text-xs text-muted">
          La primera es la principal. Podés reordenar o eliminar. Hasta {MAX_PRODUCT_PHOTOS}.
        </p>
        {photos.length === 0 ? (
          <p className="mb-2 rounded-xl border border-dashed border-line bg-background p-3 text-sm text-muted">
            Todavía no hay fotos.
          </p>
        ) : (
          <ul className="mb-3 space-y-2">
            {photos.map((url, index) => (
              <li
                key={url}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-background p-2"
              >
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                  <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                </span>
                <p className="min-w-0 flex-1 text-sm text-ink">
                  {index === 0 ? 'Principal' : `Foto ${index + 1}`}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPhotos(moveItem(photos, index, -1))}
                    disabled={index === 0}
                    className="rounded-lg border border-line p-1.5 text-ink hover:bg-card disabled:opacity-30"
                    aria-label="Subir"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotos(moveItem(photos, index, 1))}
                    disabled={index === photos.length - 1}
                    className="rounded-lg border border-line p-1.5 text-ink hover:bg-card disabled:opacity-30"
                    aria-label="Bajar"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, item) => item !== index))}
                    className="rounded-lg px-2 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {remaining > 0 && (
          <>
            <input
              name="gallery"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="w-full text-sm"
            />
            <p className="mt-1 text-xs text-muted">
              JPG, PNG o WebP. Se comprimen al subir. Quedan {remaining} lugar
              {remaining === 1 ? '' : 'es'}.
            </p>
          </>
        )}
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
