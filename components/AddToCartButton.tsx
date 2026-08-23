'use client'

import { useState } from 'react'
import type { Product } from '@/lib/types/product'
import { useCart } from '@/lib/store/useCart'

function clampQty(value: number) {
  if (!Number.isFinite(value)) return 1
  return Math.max(1, Math.trunc(value))
}

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCart((state) => state.addItem)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const add = () => {
    const qty = clampQty(quantity)
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: qty,
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        Cantidad
        <span className="inline-flex items-center rounded-full border border-line bg-card">
          <button
            type="button"
            aria-label="Menos"
            onClick={() => setQuantity((value) => clampQty(value - 1))}
            className="px-3 py-2 text-ink hover:bg-background"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(clampQty(Number(event.target.value)))}
            className="w-14 border-x border-line bg-background py-2 text-center"
          />
          <button
            type="button"
            aria-label="Más"
            onClick={() => setQuantity((value) => clampQty(value + 1))}
            className="px-3 py-2 text-ink hover:bg-background"
          >
            +
          </button>
        </span>
      </label>
      <button
        type="button"
        onClick={add}
        className="rounded-full bg-shiba px-6 py-3 text-sm font-semibold text-white hover:bg-shiba-dark"
      >
        {added ? `Agregado (${clampQty(quantity)})` : 'Agregar al carrito'}
      </button>
    </div>
  )
}
