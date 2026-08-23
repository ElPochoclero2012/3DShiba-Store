import Link from 'next/link'
import CustomQuoteButton from '@/components/CustomQuoteButton'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-ink text-[#f7f1e8]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-[#f7f1e8]">3DShiba Store</p>
          <p className="mt-1 text-sm text-[#f7f1e8]/70">
            Impresión FDM a pedido. No modelamos: imprimimos el catálogo o tu archivo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-[#f7f1e8]/80">
          <Link href="/productos" className="hover:text-shiba">
            Catálogo
          </Link>
          <Link href="/carrito" className="hover:text-shiba">
            Carrito
          </Link>
          <CustomQuoteButton tone="onDark" size="sm" />
        </div>
      </div>
    </footer>
  )
}
