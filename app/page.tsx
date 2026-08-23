import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import CustomQuoteButton from '@/components/CustomQuoteButton'
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
      <section className="relative overflow-hidden bg-shiba-dark text-white">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">
              Impresión 3D en Mar de Cobo
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
              Figuras, accesorios, mates, vasos y juegos. Impresos a pedido.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/85">
              Imprimimos en FDM lo que está en el catálogo, o el archivo que nos mandes.
              Si tenés el STL o 3MF, lo cotizamos por WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/productos"
                className="rounded-full border border-white/70 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Ver catálogo
              </Link>
              <CustomQuoteButton tone="onDark" />
            </div>
          </div>
          <div className="rounded-3xl border border-white/25 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm text-white/75">Cómo funciona</p>
            <ol className="mt-4 space-y-3 text-sm text-white">
              <li>1. Elegís del catálogo o nos mandás tu archivo.</li>
              <li>2. Armás el pedido en la web, o pedís cotización por WhatsApp.</li>
              <li>3. Coordinamos pago y entrega por chat.</li>
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
            <h3 className="text-lg font-semibold text-ink">Catálogo listo</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Figuras, accesorios, mates, vasos y juegos. Los agregás al carrito y
              confirmás por WhatsApp.
            </p>
          </article>
          <article>
            <h3 className="text-lg font-semibold text-ink">Solo impresión FDM</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              No imprimimos en resina. Color y acabado se coordinan antes de imprimir.
            </p>
          </article>
          <article>
            <h3 className="text-lg font-semibold text-ink">Traé tu archivo</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Si ya tenés el archivo, lo imprimimos a pedido. La cotización va por WhatsApp.
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}
