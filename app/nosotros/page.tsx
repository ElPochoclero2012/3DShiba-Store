import type { Metadata } from 'next'
import CustomQuoteButton from '@/components/CustomQuoteButton'
import { LEAD_TIME_COPY } from '@/lib/utils/checkoutDetails'

export const metadata: Metadata = {
  title: 'Sobre nosotros',
  description: '3DShiba Store: impresión 3D en Mar de Cobo. Figuras, accesorios, mates, vasos y juegos.',
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-ink">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-shiba-dark">
        Mar de Cobo
      </p>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">Sobre nosotros</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        Somos 3DShiba Store, un taller de impresión 3D. Hacemos figuras, accesorios, mates,
        vasos y juegos, y también imprimimos el archivo que nos traigas.
      </p>

      <div className="mt-10 space-y-6">
        <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Cómo pedís</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Elegís del catálogo, armás el carrito y confirmás por WhatsApp. Si tu pieza no
            está en la tienda y tenés el STL o 3MF, pedí una cotización y lo vemos por chat.
          </p>
        </section>
        <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Plazos</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{LEAD_TIME_COPY}</p>
        </section>
        <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Dónde estamos</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Trabajamos desde Mar de Cobo, con amor. Podés retirar acá o coordinar un envío
            al confirmar el pedido.
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <CustomQuoteButton />
        <a
          href="https://www.instagram.com/3dshiba.store/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full border border-line bg-card px-5 py-3 text-sm font-semibold text-ink hover:bg-background"
        >
          Instagram
        </a>
      </div>
    </main>
  )
}
