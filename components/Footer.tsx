import Link from 'next/link'
import { Instagram } from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'
import CustomQuoteButton from '@/components/CustomQuoteButton'

export default function Footer() {
  return (
    <footer className="mt-auto bg-shiba text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <BrandLogo />
          <p className="mt-2 max-w-md text-sm text-white/85">
            Impresión FDM a pedido. Catálogo o tu archivo, lo coordinamos por WhatsApp.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-white">
          <Link href="/productos" className="hover:underline">
            Catálogo
          </Link>
          <Link href="/carrito" className="hover:underline">
            Carrito
          </Link>
          <a
            href="https://www.instagram.com/3dshiba.store/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-medium hover:underline"
          >
            <Instagram className="h-4 w-4" />
            Instagram
          </a>
          <CustomQuoteButton tone="onDark" size="sm" />
        </div>
      </div>
    </footer>
  )
}
