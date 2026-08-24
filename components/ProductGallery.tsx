'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ProductGallery({
  name,
  photos,
}: {
  name: string
  photos: string[]
}) {
  const [current, setCurrent] = useState(0)
  const photo = photos[current] ?? photos[0]

  if (!photo) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-3xl border border-line bg-card text-muted">
        Sin foto
      </div>
    )
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-card">
        <Image
          src={photo}
          alt={name}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      {photos.length > 1 && (
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
    </div>
  )
}
