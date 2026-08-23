'use client'

import { useState } from 'react'
import type { Product } from '@/lib/types/product'
import { useCart } from '@/lib/store/useCart'

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCart((state) => state.addItem)
  const [added, setAdded] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
        })
        setAdded(true)
        window.setTimeout(() => setAdded(false), 1500)
      }}
      className="rounded-full bg-shiba px-6 py-3 text-sm font-semibold text-white hover:bg-shiba-dark"
    >
      {added ? 'Agregado' : 'Agregar al carrito'}
    </button>
  )
}
