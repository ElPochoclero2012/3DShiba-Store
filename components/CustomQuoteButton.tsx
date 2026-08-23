import { MessageCircle } from 'lucide-react'
import {
  buildWhatsAppUrl,
  formatCustomPrintQuote,
  getWhatsAppNumber,
} from '@/lib/utils/formatWhatsAppOrder'

type Props = {
  tone?: 'onLight' | 'onDark'
  size?: 'md' | 'sm'
  className?: string
}

export default function CustomQuoteButton({
  tone = 'onLight',
  size = 'md',
  className = '',
}: Props) {
  const phone = getWhatsAppNumber()
  if (!phone) return null

  const href = buildWhatsAppUrl(phone, formatCustomPrintQuote())
  const look =
    tone === 'onDark'
      ? 'border border-[#f7f1e8]/20 text-[#f7f1e8] hover:bg-white/5'
      : 'border border-line bg-card text-ink hover:bg-background'
  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-5 py-3 text-sm'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold ${pad} ${look} ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      Cotizar archivo propio
    </a>
  )
}
