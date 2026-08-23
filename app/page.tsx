import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import { mapProducts } from '@/lib/utils/mapProduct'

export default async function HomePage() {
  const supabase = await createClient()
  const featuredQuery = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(8)

  const fallbackQuery = featuredQuery.error
    ? await supabase.from('products').select('*').limit(8)
    : null

  const error = fallbackQuery ? fallbackQuery.error : featuredQuery.error
  const featured = mapProducts(fallbackQuery ? fallbackQuery.data : featuredQuery.data)

  return (
    <main>
      <section className="relative overflow-hidden bg-ink text-[#f7f1e8]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-shiba/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-shiba/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-shiba">
              Impresión 3D en Mar del Plata
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
              Figuras, accesorios y mates que salen de la impresora a tu mesa.
            </h1>
            <p className="mt-4 max-w-xl text-base text-[#f7f1e8]/75">
              3DShiba Store es un emprendimiento de piezas personalizables. Armá tu pedido
              en la web y lo coordinamos por WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/productos"
                className="rounded-full bg-shiba px-5 py-3 text-sm font-semibold text-white hover:bg-shiba-dark"
              >
                Ver catálogo
              </Link>
              <a
                href="#destacados"
                className="rounded-full border border-[#f7f1e8]/20 px-5 py-3 text-sm font-semibold text-[#f7f1e8] hover:bg-white/5"
              >
                Productos destacados
              </a>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm text-[#f7f1e8]/70">Cómo funciona</p>
            <ol className="mt-4 space-y-3 text-sm">
              <li>1. Elegís figuras, accesorios o mates.</li>
              <li>2. Los agregás al carrito.</li>
              <li>3. Confirmás por WhatsApp y coordinamos pago y entrega.</li>
            </ol>
          </div>
        </div>
      </section>

      <section id="destacados" className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink">Destacados</h2>
            <p className="mt-1 text-muted">Piezas que más pedimos esta semana.</p>
          </div>
          <Link href="/productos" className="text-sm font-medium text-shiba hover:underline">
            Ver todo
          </Link>
        </div>

        {error ? (
          <p className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            No pudimos cargar los destacados. Revisá la conexión con Supabase o el esquema de
            `products`.
          </p>
        ) : featured.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-line bg-card p-6 text-muted">
            Todavía no hay productos destacados. Marcalos como featured desde el panel admin.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-line bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-3">
          <article>
            <h3 className="text-lg font-semibold text-ink">Diseño a medida</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Pedí un modelo propio o una variación de algo que ya está en el catálogo.
              Lo vemos por WhatsApp.
            </p>
          </article>
          <article>
            <h3 className="text-lg font-semibold text-ink">Materiales y acabado</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Impresión FDM/resina según la pieza. Colores y post-procesado se coordinan
              antes de imprimir.
            </p>
          </article>
          <article>
            <h3 className="text-lg font-semibold text-ink">Mates personalizables</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Texto, color o un diseño que te guste. Dejá el detalle en las notas del carrito
              al confirmar el pedido.
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}
