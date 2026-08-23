import Link from 'next/link'
import BrandLogo from '@/components/BrandLogo'

export default function Footer() {
  return (
    <footer className="mt-auto bg-shiba-dark text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-10 sm:flex-row sm:justify-between">
        <BrandLogo />
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/nosotros"
            className="rounded-full px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
          >
            Sobre nosotros
          </Link>
          <a
            href="https://www.instagram.com/3dshiba.store/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/70 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
            Instagram
          </a>
        </div>
      </div>
    </footer>
  )
}
