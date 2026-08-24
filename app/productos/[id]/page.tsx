import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AddToCartButton from '@/components/AddToCartButton'
import ProductGallery from '@/components/ProductGallery'
import { CATEGORY_LABELS } from '@/lib/types/product'
import { formatPrice } from '@/lib/utils/format'
import { mapProduct } from '@/lib/utils/mapProduct'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle()

  if (error || !data) {
    notFound()
  }

  const product = mapProduct(data as Record<string, unknown>)

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
      <ProductGallery name={product.name} photos={product.image_urls} />

      <div>
        <Link href="/productos" className="text-sm font-medium text-shiba hover:underline">
          Volver al catálogo
        </Link>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-shiba">
          {CATEGORY_LABELS[product.category]}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{product.name}</h1>
        <p className="mt-4 text-2xl font-semibold text-ink">{formatPrice(product.price)}</p>
        <p className="mt-2 text-sm text-muted">Se imprime a pedido</p>
        {product.description && (
          <p className="mt-6 whitespace-pre-wrap leading-relaxed text-ink/80">{product.description}</p>
        )}
        <div className="mt-8">
          <AddToCartButton product={product} />
        </div>
      </div>
    </main>
  )
}
