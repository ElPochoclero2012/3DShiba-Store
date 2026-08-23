import Image from 'next/image'
import Link from 'next/link'

export default function BrandLogo({ size = 40 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/logo-3dshiba.jpg"
        alt="3DShiba Store"
        width={size}
        height={size}
        className="rounded-full"
        priority
      />
      <span className="text-sm font-semibold tracking-[0.14em] text-white">3DSHIBA.STORE</span>
    </Link>
  )
}
