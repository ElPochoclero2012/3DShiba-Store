'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const INTERVAL_MS = 6000

export default function ProductGallery({
  name,
  photos,
}: {
  name: string
  photos: string[]
}) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const photo = photos[current] ?? photos[0]
  const many = photos.length > 1

  const go = (direction: -1 | 1) => {
    if (!many) return
    setCurrent((index) => (index + direction + photos.length) % photos.length)
  }

  useEffect(() => {
    if (current >= photos.length) setCurrent(0)
  }, [current, photos.length])

  useEffect(() => {
    if (!many || lightbox) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) return
    const timer = window.setInterval(() => {
      setCurrent((index) => (index + 1) % photos.length)
    }, INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [many, lightbox, current, photos.length])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(false)
      if (!many) return
      if (event.key === 'ArrowLeft') {
        setCurrent((index) => (index - 1 + photos.length) % photos.length)
      }
      if (event.key === 'ArrowRight') {
        setCurrent((index) => (index + 1) % photos.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, many, photos.length])

  if (!photo) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-3xl border border-line bg-card text-muted">
        Sin foto
      </div>
    )
  }

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
          className="absolute inset-0"
          aria-label={`Ver ${name} más grande`}
        >
          <Image
            src={photo}
            alt={name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </button>
        {arrows}
      </div>
      {many && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {photos.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setCurrent(index)}
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
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-ink"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative h-[min(90vh,900px)] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image src={photo} alt={name} fill className="object-contain" sizes="100vw" />
            {arrows}
          </div>
        </div>
      )}
    </div>
  )
}
