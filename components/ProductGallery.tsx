'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const INTERVAL_MS = 6000

function slideClass(dir: 1 | -1, role: 'in' | 'out') {
  if (role === 'out') return dir === 1 ? 'gallery-out-next' : 'gallery-out-prev'
  return dir === 1 ? 'gallery-in-next' : 'gallery-in-prev'
}

function Slide({
  url,
  name,
  fit,
  sizes,
  className,
  onAnimationEnd,
}: {
  url: string
  name: string
  fit: 'object-cover' | 'object-contain'
  sizes: string
  className?: string
  onAnimationEnd?: () => void
}) {
  return (
    <div className={`absolute inset-0 ${className ?? ''}`} onAnimationEnd={onAnimationEnd}>
      <Image src={url} alt={name} fill className={fit} sizes={sizes} />
    </div>
  )
}

export default function ProductGallery({
  name,
  photos,
}: {
  name: string
  photos: string[]
}) {
  const [current, setCurrent] = useState(0)
  const [outgoing, setOutgoing] = useState<number | null>(null)
  const [dir, setDir] = useState<1 | -1>(1)
  const [lightbox, setLightbox] = useState(false)
  const outgoingRef = useRef<number | null>(null)
  const photo = photos[current] ?? photos[0]
  const many = photos.length > 1

  const clearOutgoing = () => {
    outgoingRef.current = null
    setOutgoing(null)
  }

  const goTo = (index: number, direction: 1 | -1) => {
    if (!many || outgoingRef.current !== null) return
    const next = (index + photos.length) % photos.length
    if (next === current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCurrent(next)
      return
    }
    setDir(direction)
    outgoingRef.current = current
    setOutgoing(current)
    setCurrent(next)
  }

  const go = (direction: -1 | 1) => {
    goTo(current + direction, direction)
  }

  useEffect(() => {
    if (current >= photos.length) setCurrent(0)
  }, [current, photos.length])

  useEffect(() => {
    if (outgoing === null) return
    const timer = window.setTimeout(clearOutgoing, 500)
    return () => window.clearTimeout(timer)
  }, [outgoing])

  useEffect(() => {
    if (!many || lightbox) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => go(1), INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [many, lightbox, current, photos.length])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(false)
      if (event.key === 'ArrowLeft') go(-1)
      if (event.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, current, photos.length, many])

  if (!photo) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-3xl border border-line bg-card text-muted">
        Sin foto
      </div>
    )
  }

  const slides = (fit: 'object-cover' | 'object-contain', sizes: string) => (
    <>
      {outgoing !== null && photos[outgoing] && (
        <Slide
          url={photos[outgoing]}
          name={name}
          fit={fit}
          sizes={sizes}
          className={slideClass(dir, 'out')}
          onAnimationEnd={clearOutgoing}
        />
      )}
      <Slide
        url={photo}
        name={name}
        fit={fit}
        sizes={sizes}
        className={outgoing === null ? undefined : slideClass(dir, 'in')}
      />
    </>
  )

  const arrows = many ? (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          go(-1)
        }}
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-ink shadow-sm hover:bg-white"
        aria-label="Foto anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          go(1)
        }}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-ink shadow-sm hover:bg-white"
        aria-label="Foto siguiente"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </>
  ) : null

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-card">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute inset-0 overflow-hidden"
          aria-label={`Ver ${name} más grande`}
        >
          {slides('object-cover', '(max-width: 768px) 100vw, 50vw')}
        </button>
        {arrows}
      </div>
      {many && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {photos.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => goTo(index, index > current ? 1 : -1)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border ${
                index === current ? 'border-shiba ring-2 ring-shiba/40' : 'border-line'
              }`}
              aria-label={`Foto ${index + 1}`}
            >
              <Image src={url} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={name}
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-ink"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative h-[min(90vh,900px)] w-full max-w-5xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            {slides('object-contain', '100vw')}
            {arrows}
          </div>
        </div>
      )}
    </div>
  )
}
