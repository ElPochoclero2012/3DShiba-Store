import { createClient } from '@/lib/supabase/server'
import AdminProductList from '@/components/admin/AdminProductList'
import ProductForm from '@/components/admin/ProductForm'
import { mapProducts } from '@/lib/utils/mapProduct'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const products = mapProducts(data)

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-ink">Panel de productos</h1>
      <p className="mt-2 text-muted">
        Creá, editá o eliminá piezas. Las fotos van al bucket product-images.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Nuevo producto</h2>
          <ProductForm />
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Inventario</h2>
          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error.message}. Si menciona una columna inexistente, corré{' '}
              <code>supabase/schema.sql</code> en el SQL Editor.
            </p>
          ) : (
            <AdminProductList products={products} />
          )}
        </section>
      </div>
    </main>
  )
}
