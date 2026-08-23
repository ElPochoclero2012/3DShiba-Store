import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import CatalogFilters from '@/components/CatalogFilters'
import CustomQuoteButton from '@/components/CustomQuoteButton'
import { CATEGORY_LABELS, PRODUCT_CATEGORIES, isProductCategory } from '@/lib/types/product'
import { mapProducts } from '@/lib/utils/mapProduct'

type Search = { q?: string | string[]; category?: string | string[]; sort?: string | string[] }

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Search>
}) {
  const params = await searchParams
  const q = first(params.q)?.trim() ?? ''
  const categoryRaw = first(params.category) ?? ''
  const category = isProductCategory(categoryRaw) ? categoryRaw : ''
  const sort = first(params.sort) ?? 'newest'

  const supabase = await createClient()
  let query = supabase.from('products').select('*')

  if (q) {
    const safe = q.replace(/[%_,]/g, ' ')
    query = query.or(`name.ilike.%${safe}%,title.ilike.%${safe}%`)
  }
  if (category) {
    query = query.eq('category', category)
  }

  if (sort === 'price_asc') {
    query = query.order('price', { ascending: true })
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query
  const products = mapProducts(data)

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Catálogo</h1>
          <p className="mt-2 text-muted">
            {category ? CATEGORY_LABELS[category] : 'Todas las categorías'}
            {q ? ` · “${q}”` : ''}
          </p>
        </div>
        <CustomQuoteButton tone="onLight" />
      </div>

      <CatalogFilters
        q={q}
        category={category}
        sort={sort}
        categories={[...PRODUCT_CATEGORIES]}
      />

      {error ? (
        <p className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          No se pudieron cargar los productos: {error.message}
        </p>
      ) : products.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-line bg-card p-8 text-center text-muted">
          No hay productos con esos filtros.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  )
}
