import Link from 'next/link'

export default function ProductNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-ink">Producto no encontrado</h1>
      <p className="mt-2 text-muted">Puede que lo hayan sacado del catálogo.</p>
      <Link href="/productos" className="mt-6 inline-block font-medium text-shiba hover:underline">
        Volver al catálogo
      </Link>
    </main>
  )
}
