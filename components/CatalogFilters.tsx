'use client'

import { useRouter } from 'next/navigation'
import { CATEGORY_LABELS, type ProductCategory } from '@/lib/types/product'

type Props = {
  q: string
  category: string
  sort: string
  categories: ProductCategory[]
}

export default function CatalogFilters({ q, category, sort, categories }: Props) {
  const router = useRouter()

  const apply = (next: { q?: string; category?: string; sort?: string }) => {
    const params = new URLSearchParams()
    const query = next.q ?? q
    const selectedCategory = next.category ?? category
    const selectedSort = next.sort ?? sort

    if (query) params.set('q', query)
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedSort && selectedSort !== 'newest') params.set('sort', selectedSort)

    const qs = params.toString()
    router.push(qs ? `/productos?${qs}` : '/productos')
  }

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        apply({
          q: String(form.get('q') ?? ''),
          sort: String(form.get('sort') ?? 'newest'),
        })
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre..."
          className="flex-1 rounded-full border border-line bg-card px-4 py-2.5 text-sm"
        />
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-full border border-line bg-card px-4 py-2.5 text-sm"
        >
          <option value="newest">Más nuevos</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
        </select>
        <button
          type="submit"
          className="rounded-full bg-shiba px-5 py-2.5 text-sm font-medium text-white hover:bg-shiba-dark"
        >
          Filtrar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => apply({ category: '' })}
          className={`rounded-full px-3 py-1.5 text-sm ${
            !category ? 'bg-ink text-white' : 'border border-line bg-card text-ink'
          }`}
        >
          Todas
        </button>
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => apply({ category: item })}
            className={`rounded-full px-3 py-1.5 text-sm ${
              category === item ? 'bg-ink text-white' : 'border border-line bg-card text-ink'
            }`}
          >
            {CATEGORY_LABELS[item]}
          </button>
        ))}
      </div>
    </form>
  )
}
