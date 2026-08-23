'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CATEGORY_LABELS, type Product } from '@/lib/types/product'
import { useCart } from '@/lib/store/useCart'
import { formatPrice } from '@/lib/utils/format'
import { requireLogin } from '@/lib/utils/requireLogin'

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((state) => state.addItem)

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
      <Link href={`/productos/${product.id}`} className="relative aspect-square bg-background">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Sin foto
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-shiba">
          {CATEGORY_LABELS[product.category]}
        </p>
        <Link href={`/productos/${product.id}`} className="text-base font-semibold text-ink hover:text-shiba">
          {product.name}
        </Link>
        <p className="mt-auto text-lg font-semibold text-ink">{formatPrice(product.price)}</p>
        <button
          type="button"
          onClick={() =>
            void requireLogin().then((ok) => {
              if (!ok) return
              addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
              })
            })
          }
          className="mt-1 rounded-full bg-shiba px-4 py-2 text-sm font-medium text-white hover:bg-shiba-dark"
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  )
}
